const fs=require('node:fs/promises'),path=require('node:path');
const initial=()=>({version:1,shortcuts:[],shelf:[],history:[],audioProfiles:[],prefs:{theme:'light',closeToTray:true,hotkey:'CommandOrControl+Shift+Space',ffmpegPath:''}});
class Store{
 constructor(dir){this.dir=dir;this.file=path.join(dir,'deskflow.json');this.state=initial();this.queue=Promise.resolve();}
 async init(){await fs.mkdir(this.dir,{recursive:true});try{const raw=await fs.readFile(this.file,'utf8'),s=JSON.parse(raw);if(s.version!==1||!['shortcuts','shelf','history','audioProfiles'].every(k=>Array.isArray(s[k])))throw Error('Некорректный файл настроек');this.state={...initial(),...s,prefs:{...initial().prefs,...s.prefs}};}catch(e){if(e.code!=='ENOENT')throw Error('Не удалось прочитать данные DeskFlow. Исходный файл не изменён: '+e.message);}return this.state;}
 async mutate(fn){const task=this.queue.then(async()=>{const next=structuredClone(this.state);fn(next);const tmp=this.file+'.tmp';await fs.writeFile(tmp,JSON.stringify(next,null,2));await fs.rename(tmp,this.file);this.state=next;return structuredClone(next);});this.queue=task.catch(()=>{});return task;}
}
module.exports={Store,initial};
