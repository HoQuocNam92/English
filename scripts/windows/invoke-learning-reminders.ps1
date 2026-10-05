param([Parameter(Mandatory=$true)][string]$ConfigPath)
$ErrorActionPreference = 'Stop'
try {
    $config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
    $uri = [Uri]$config.ApiBaseUrl
    if ($uri.Scheme -ne 'https' -and -not $uri.IsLoopback) { throw 'Use HTTPS for a remote API.' }
    if ([string]::IsNullOrWhiteSpace($config.JobKey)) { throw 'JobKey is missing.' }
    $endpoint = $config.ApiBaseUrl.TrimEnd('/') + '/internal/jobs/learning-reminders'
    $result = Invoke-RestMethod -Method Post -Uri $endpoint -Headers @{ 'x-scheduler-key' = $config.JobKey } -ContentType 'application/json' -Body '{}' -TimeoutSec 50
    Write-Output ('Created reminders: ' + $result.created)
    exit 0
} catch {
    Write-Error 'Reminder job failed. Check API connectivity, scheduler key and server logs.'
    exit 1
}
