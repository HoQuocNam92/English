$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    $adbDirectory = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools'
    if (Test-Path (Join-Path $adbDirectory 'adb.exe')) { $env:PATH = "$adbDirectory;$env:PATH" }
}
if (-not (Get-Command adb -ErrorAction SilentlyContinue)) { throw 'Khong tim thay adb. Hay cai Android SDK platform-tools.' }

adb devices
adb reverse tcp:8080 tcp:8080
if ($LASTEXITCODE -ne 0) { throw 'Hay ket noi mot dien thoai USB va cho phep USB debugging.' }
adb reverse tcp:8081 tcp:8081
if ($LASTEXITCODE -ne 0) { throw 'Khong the noi cong Metro qua USB.' }

# Windows may resolve localhost to ::1, which adb reverse cannot reach over IPv4.
$env:NODE_OPTIONS = "$env:NODE_OPTIONS --dns-result-order=ipv4first".Trim()
$env:EXPO_PUBLIC_API_URL = 'http://127.0.0.1:8080/api/v1'

# Reuse a reachable Metro instance when this script is run more than once.
$metroReady = $false
try {
    $metroResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:8081/status' -UseBasicParsing -TimeoutSec 5
    $metroStatus = if ($metroResponse.Content -is [byte[]]) {
        [System.Text.Encoding]::UTF8.GetString($metroResponse.Content)
    } else { [string]$metroResponse.Content }
    $metroReady = $metroStatus.Trim() -eq 'packager-status:running'
} catch { }

if ($metroReady) {
    $listeners = @(Get-NetTCPConnection -State Listen -LocalPort 8081 -ErrorAction SilentlyContinue)
    $workspaceRoot = (Get-Location).Path
    $sameWorkspace = $false
    foreach ($listener in $listeners) {
        $metroProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue
        if ($metroProcess.CommandLine -and
            $metroProcess.CommandLine.IndexOf($workspaceRoot, [System.StringComparison]::OrdinalIgnoreCase) -ge 0 -and
            $metroProcess.CommandLine -match 'expo.*start') { $sameWorkspace = $true }
    }
    if (-not $sameWorkspace) { throw 'Cong 8081 dang chay Metro cua du an khac hoac khong xac dinh duoc. Hay dung Metro do truoc.' }
    Write-Host 'Metro cua du an da chay. Dang mo lai app qua USB; khong khoi dong them Metro.'
    adb shell am start -a android.intent.action.VIEW -d 'exp+tech-english://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081' com.techenglish.pro
    if ($LASTEXITCODE -ne 0) { throw 'Khong the mo app. Hay kiem tra ban development da duoc cai.' }
    exit 0
}

$busyListeners = @(Get-NetTCPConnection -State Listen -LocalPort 8081 -ErrorAction SilentlyContinue)
if ($busyListeners.Count -gt 0) {
    throw 'Cong 8081 dang bi chiem nhung Metro IPv4 khong phan hoi. Hay dung phien Metro cu bang Ctrl+C roi chay lai script.'
}
Write-Host 'Giu cua so nay mo va dien thoai cam USB trong khi dung app.'
pnpm --filter mobile exec expo start --dev-client --localhost --port 8081 --android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
