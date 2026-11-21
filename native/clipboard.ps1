param([Parameter(Mandatory=$true)][string]$JsonPath)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false)
try{Add-Type -AssemblyName System.Windows.Forms;$files=Get-Content -LiteralPath $JsonPath -Raw -Encoding UTF8|ConvertFrom-Json;$list=New-Object System.Collections.Specialized.StringCollection;foreach($file in $files){$null=$list.Add([string]$file)};[System.Windows.Forms.Clipboard]::SetFileDropList($list);'{"ok":true}'}catch{@{error=$_.Exception.Message}|ConvertTo-Json -Compress;exit 1}
