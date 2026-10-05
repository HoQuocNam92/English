param(
    [Parameter(Mandatory=$true)][string]$ConfigPath,
    [string]$TaskName = 'TechEnglish-LearningReminders'
)
$ErrorActionPreference = 'Stop'
$runner = Join-Path $PSScriptRoot 'invoke-learning-reminders.ps1'
$configFile = (Resolve-Path -LiteralPath $ConfigPath).Path
if ($configFile.Contains('"') -or $runner.Contains('"')) { throw 'Paths must not contain quotes.' }
$arguments = '-NoProfile -NonInteractive -File "' + $runner + '" -ConfigPath "' + $configFile + '"'
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $arguments
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal
