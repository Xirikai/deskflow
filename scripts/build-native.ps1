$ErrorActionPreference='Stop'
& node (Join-Path $PSScriptRoot 'build-native.mjs')
if($LASTEXITCODE -ne 0){throw 'Native build failed'}
