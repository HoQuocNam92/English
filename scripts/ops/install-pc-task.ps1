param()
$ErrorActionPreference='Stop'
$destination='D:\TechEnglish_Backups';New-Item -ItemType Directory -Force $destination|Out-Null
$user=[Security.Principal.WindowsIdentity]::GetCurrent();$sid=$user.User.Value
& icacls.exe $destination /inheritance:r /grant:r ('*'+$sid+':(OI)(CI)F') '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
if($LASTEXITCODE -ne 0){throw 'Backup folder ACL setup failed'}
$script='D:\English\scripts\ops\sync-backup.ps1'
$exe=(Get-Process -Id $PID).Path
$action=New-ScheduledTaskAction -Execute $exe -Argument ('-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy RemoteSigned -File "'+$script+'"') -WorkingDirectory 'D:\English'
$boot=New-ScheduledTaskTrigger -AtLogOn -User $user.Name
$repeat=New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
$principal=New-ScheduledTaskPrincipal -UserId $user.Name -LogonType Interactive -RunLevel Limited
$task=New-ScheduledTask -Action $action -Trigger @($boot,$repeat) -Settings $settings -Principal $principal -Description 'Verify VPS health and download new verified TechEnglish database backups to D:\TechEnglish_Backups every five minutes while this PC is on. Uses the existing SSH key; stores no Windows password.'
$null=Register-ScheduledTask -TaskName 'TechEnglishBackupSync' -InputObject $task -Force -ErrorAction Stop
Start-ScheduledTask -TaskName 'TechEnglishBackupSync'
Get-ScheduledTask -TaskName 'TechEnglishBackupSync' | Select-Object TaskName,State


