$ErrorActionPreference='Stop'
[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false)
try {@(Get-StartApps | Sort-Object Name | ForEach-Object { @{name=$_.Name;appId=$_.AppID} }) | ConvertTo-Json -Compress -Depth 4} catch { @{error=$_.Exception.Message}|ConvertTo-Json -Compress;exit 1 }
