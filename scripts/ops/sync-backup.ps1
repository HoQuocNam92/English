param([string]$Destination='D:\TechEnglish_Backups')
$ErrorActionPreference='Stop'
$TaskState=Join-Path $Destination '_state'
$ProfileRoot=[Environment]::GetFolderPath('UserProfile')
$Ssh=Join-Path $env:WINDIR 'System32\OpenSSH\ssh.exe'
$Scp=Join-Path $env:WINDIR 'System32\OpenSSH\scp.exe'
$SshOptions=@('-F',(Join-Path $ProfileRoot '.ssh\config'),'-o','BatchMode=yes','-o','ConnectTimeout=15','-o','StrictHostKeyChecking=yes','-o',('UserKnownHostsFile='+(Join-Path $ProfileRoot '.ssh\known_hosts')))
$Ops='/home/ubuntu/techenglish-ops/bin/ops.py'
$CredentialFile='D:\English\artifacts\ops-20261103\telegram.env'
New-Item -ItemType Directory -Force $Destination,$TaskState | Out-Null
$root=[IO.Path]::GetFullPath($Destination).TrimEnd('\')
if($root -ne 'D:\TechEnglish_Backups'){throw 'Unexpected backup root'}
function Safe-Path([string]$path){$full=[IO.Path]::GetFullPath($path);if(-not $full.StartsWith($root+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Path outside backup folder'};return $full}
function Read-State([string]$path){
 $value=@{failures=0;lastAlert=0;lastSuccess=0};try{if(Test-Path -LiteralPath $path){$parsed=Get-Content -Raw -LiteralPath $path|ConvertFrom-Json;foreach($item in $parsed.PSObject.Properties){$value[$item.Name]=$item.Value}}}catch{};return $value
}
function Notify([string]$message){
 try{
  $values=@{};foreach($line in Get-Content -LiteralPath $CredentialFile){if($line -match '^\s*(TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID)\s*=\s*(.*?)\s*$'){$values[$matches[1]]=$matches[2].Trim('"',"'")}}
  $token=$values['TELEGRAM_BOT_TOKEN'];$chat=$values['TELEGRAM_CHAT_ID']
  if($token -notmatch '^\d+:[A-Za-z0-9_-]{20,}$' -or $chat -notmatch '^-?\d+$'){return}
  $body=@{chat_id=$chat;text=$message}|ConvertTo-Json -Compress
  $null=Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot'+$token+'/sendMessage') -Body $body -ContentType 'application/json; charset=utf-8' -TimeoutSec 15
 }catch{}
}
$lock=$null
try{
 $lock=[IO.File]::Open((Join-Path $TaskState 'sync.lock'),[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
 $statusPath=Join-Path $TaskState 'status.json'
 $status=(Read-State $statusPath)
 $raw=& $Ssh @SshOptions techenglish ('python3 '+$Ops+' latest')
 if($LASTEXITCODE -ne 0){throw 'VPS backup metadata could not be read'}
 $meta=($raw -join "`n")|ConvertFrom-Json
 $stamp=[string]$meta.snapshot
 if($stamp -notmatch '^\d{8}T\d{6}Z$'){throw 'Invalid snapshot name'}
 $remote='/home/ubuntu/techenglish-backups/automated/daily/'+$stamp
 if($meta.directory -ne $remote){throw 'Invalid remote backup path'}
 $target=Safe-Path (Join-Path $root $stamp)
 $dumpName='TechEnglish_'+$stamp+'.dump';$sqlName='TechEnglish_'+$stamp+'.sql'
 $dump=Join-Path $target $dumpName;$sql=Join-Path $target $sqlName
 $valid=(Test-Path -LiteralPath $dump) -and (Test-Path -LiteralPath $sql)
 if($valid -and ($meta.manifest.files.PSObject.Properties.Name -contains 'app-state.json')){$stateFile=Join-Path $target 'app-state.json';$valid=(Test-Path -LiteralPath $stateFile) -and ((Get-FileHash -LiteralPath $stateFile -Algorithm SHA256).Hash -eq $meta.manifest.files.'app-state.json'.sha256)}
 if($valid){$valid=((Get-FileHash -LiteralPath $dump -Algorithm SHA256).Hash -eq $meta.manifest.files.'database.dump'.sha256) -and ((Get-FileHash -LiteralPath $sql -Algorithm SHA256).Hash -eq $meta.manifest.sql_plain_sha256)}
 if(-not $valid){
  if(Test-Path -LiteralPath $target){throw 'Existing snapshot is incomplete or checksum failed; retained for inspection'}
  $partial=Safe-Path (Join-Path $root ('_partial-'+[Guid]::NewGuid().ToString('N')))
  New-Item -ItemType Directory -Path $partial | Out-Null
  & $Scp @SshOptions ('techenglish:'+ $remote+'/database.dump') ('techenglish:'+ $remote+'/database.sql.gz') ('techenglish:'+ $remote+'/manifest.json') ($partial+'\')
  if($LASTEXITCODE -ne 0){throw 'Backup download failed'}
  if((Get-FileHash -LiteralPath (Join-Path $partial 'database.dump') -Algorithm SHA256).Hash -ne $meta.manifest.files.'database.dump'.sha256){throw 'Dump checksum mismatch'}
  if((Get-FileHash -LiteralPath (Join-Path $partial 'database.sql.gz') -Algorithm SHA256).Hash -ne $meta.manifest.files.'database.sql.gz'.sha256){throw 'Compressed SQL checksum mismatch'}
  $source=[IO.File]::OpenRead((Join-Path $partial 'database.sql.gz'))
  try{$gzip=[IO.Compression.GZipStream]::new($source,[IO.Compression.CompressionMode]::Decompress);try{$out=[IO.File]::Create((Join-Path $partial $sqlName));try{$gzip.CopyTo($out)}finally{$out.Dispose()}}finally{$gzip.Dispose()}}finally{$source.Dispose()}
  if((Get-FileHash -LiteralPath (Join-Path $partial $sqlName) -Algorithm SHA256).Hash -ne $meta.manifest.sql_plain_sha256){throw 'Plain SQL checksum mismatch'}
  if ($meta.manifest.files.PSObject.Properties.Name -contains 'app-state.json') {
   & $Scp @SshOptions ('techenglish:'+ $remote+'/app-state.json') (Join-Path $partial 'app-state.json')
   if($LASTEXITCODE -ne 0){throw 'File state download failed'}
   if((Get-FileHash -LiteralPath (Join-Path $partial 'app-state.json') -Algorithm SHA256).Hash -ne $meta.manifest.files.'app-state.json'.sha256){throw 'File state checksum mismatch'}
  }
  Move-Item -LiteralPath (Join-Path $partial 'database.dump') -Destination (Join-Path $partial $dumpName)
  $compressed=Safe-Path (Join-Path $partial 'database.sql.gz');Remove-Item -LiteralPath $compressed
  Move-Item -LiteralPath $partial -Destination $target
 }
 $digest=[string]$meta.manifest.files.'database.dump'.sha256
 if($digest -notmatch '^[a-fA-F0-9]{64}$'){throw 'Invalid digest'}
 $null=& $Ssh @SshOptions techenglish ('python3 '+$Ops+' confirm --snapshot '+$stamp+' --sha256 '+$digest)
 if($LASTEXITCODE -ne 0){throw 'VPS did not confirm the verified PC copy'}
 foreach($url in @('https://techenglish.click/login','https://api.techenglish.click/api/docs-json')){$r=Invoke-WebRequest -Uri $url -TimeoutSec 15;if($r.StatusCode -ne 200){throw 'A public endpoint is unavailable'}}
 if($status.failures -ge 3){Notify 'TechEnglish: kết nối VPS, HTTPS và đồng bộ backup trên PC đã hoạt động trở lại.'}
 $status.failures=0;$status.lastSuccess=[DateTimeOffset]::UtcNow.ToUnixTimeSeconds();$status.snapshot=$stamp
 $status|ConvertTo-Json|Set-Content -Encoding utf8 -LiteralPath $statusPath
 @{ok=$true;snapshot=$stamp;directory=$target;checked=[DateTimeOffset]::UtcNow.ToString('o')}|ConvertTo-Json -Compress|Add-Content -Encoding utf8 -LiteralPath (Join-Path $TaskState 'sync.log')
 Write-Output ('Verified dump and SQL: '+$target)
}catch{
 if($null -eq $lock){exit 0}
 $statusPath=Join-Path $TaskState 'status.json';$s=(Read-State $statusPath)
 $s.failures=[int]$s.failures+1;$now=[DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
 if($s.failures -ge 3 -and ($now-[long]$s.lastAlert) -gt 7200){Notify 'TechEnglish: PC không thể kiểm tra HTTPS hoặc đồng bộ backup từ VPS sau nhiều lần thử. Kiểm tra kết nối và lịch backup.';$s.lastAlert=$now}
 $s|ConvertTo-Json|Set-Content -Encoding utf8 -LiteralPath $statusPath
 @{ok=$false;errorType=$_.Exception.GetType().Name;time=[DateTimeOffset]::UtcNow.ToString('o')}|ConvertTo-Json -Compress|Add-Content -Encoding utf8 -LiteralPath (Join-Path $TaskState 'sync.log')
 Write-Error 'Backup sync or endpoint check failed; details are recorded locally without credentials.';exit 1
}finally{if($null -ne $lock){$lock.Dispose()}}
