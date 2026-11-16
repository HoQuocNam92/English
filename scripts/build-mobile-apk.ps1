param(
    [string]$JavaHome = $env:JAVA_HOME,
    [string]$NinjaPath = ''
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
if (-not $JavaHome) { $JavaHome = 'C:/Program Files/Android/Android Studio/jbr' }
if (-not (Test-Path "$JavaHome/bin/java.exe")) { throw 'Set JAVA_HOME to a JDK installation.' }
$env:JAVA_HOME = $JavaHome
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = "$env:LOCALAPPDATA/Android/Sdk" }
$env:PATH = "$JavaHome/bin;$env:PATH"
$env:NODE_ENV = 'production'
$config = Get-Content "$repoRoot/apps/mobile/eas.json" -Raw | ConvertFrom-Json
$env:EXPO_PUBLIC_API_URL = $config.build.preview.env.EXPO_PUBLIC_API_URL
$env:EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = $config.build.preview.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

# Ninja bundled with CMake 3.22.1 does not handle Windows long paths.
# Keep the newer tool local to this checkout instead of replacing the SDK binary.
$toolDir = Join-Path $repoRoot 'artifacts/tools/ninja-1.12.1'
if (-not $NinjaPath) { $NinjaPath = Join-Path $toolDir 'ninja.exe' }
if (-not (Test-Path -LiteralPath $ninjaPath)) {
    if ($NinjaPath -ne (Join-Path $toolDir 'ninja.exe')) { throw 'The supplied Ninja executable does not exist.' }
    New-Item -ItemType Directory -Path $toolDir -Force | Out-Null
    $zipPath = Join-Path $toolDir 'ninja-win.zip'
    Invoke-WebRequest 'https://github.com/ninja-build/ninja/releases/download/v1.12.1/ninja-win.zip' -OutFile $zipPath
    Expand-Archive -LiteralPath $zipPath -DestinationPath $toolDir -Force
}
& $ninjaPath --version
if ($LASTEXITCODE -ne 0) { throw 'Ninja could not start.' }

Push-Location "$repoRoot/apps/mobile/android"
try {
    & ./gradlew.bat :app:assembleRelease '-PreactNativeArchitectures=arm64-v8a' "-PwindowsNinjaPath=$ninjaPath" --max-workers=2 --console=plain
    if ($LASTEXITCODE -ne 0) { throw "Android build failed ($LASTEXITCODE)." }
    Write-Host "APK: $repoRoot/apps/mobile/android/app/build/outputs/apk/release/app-release.apk"
    Write-Host 'This local release uses the checked-in debug signing key; Expo signing credentials are separate.'
} finally {
    Pop-Location
}
