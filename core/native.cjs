const {execFile}=require('node:child_process'),path=require('node:path');
const {promisify}=require('node:util');const exec=promisify(execFile);
const base=path.resolve(__dirname,'../native').replace(/app\.asar([\\/])/,'app.asar.unpacked$1');
async function jsonExec(command,args,timeout=25000){try{const {stdout}=await exec(command,args,{windowsHide:true,timeout,maxBuffer:8*1024*1024,encoding:'utf8'});const data=JSON.parse(stdout.trim().replace(/^\uFEFF/,''));if(data?.error)throw Error(data.error);return data;}catch(e){if(e.stdout){try{const parsed=JSON.parse(e.stdout.trim().replace(/^\uFEFF/,''));if(parsed.error)throw Error(parsed.error);}catch(inner){if(!(inner instanceof SyntaxError))throw inner;}}throw Error(e.killed?'Операция заняла слишком много времени. Попробуйте ещё раз.':e.message);}}
const powershell=path.join(process.env.WINDIR??'C:\\Windows','System32/WindowsPowerShell/v1.0/powershell.exe');
function ps(script,args=[],timeout){return jsonExec(powershell,['-NoProfile','-NonInteractive','-STA','-ExecutionPolicy','Bypass','-File',path.join(base,script),...args],timeout);}
function audio(command='list',...args){return jsonExec(path.join(base,'DeskFlowAudio.exe'),[command,...args.map(String)]);}
module.exports={audio,ps,jsonExec,powershell};
