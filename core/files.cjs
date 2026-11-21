const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {createReadStream}=require('node:fs');
const GROUPS={Изображения:'jpg jpeg png webp gif bmp tif tiff heic avif svg ico',Документы:'pdf doc docx xls xlsx ppt pptx txt md rtf csv odt',Видео:'mp4 mkv avi mov webm m4v mpg mpeg',Музыка:'mp3 wav flac aac ogg m4a wma',Архивы:'zip rar 7z tar gz bz2',Установщики:'exe msi msix appx iso'};
function category(name){const ext=path.extname(name).slice(1).toLowerCase();return Object.entries(GROUPS).find(([,exts])=>exts.split(' ').includes(ext))?.[0]??'Другое';}
function filename(value){const name=String(value).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/,'').slice(0,180);if(!name||/^\.+$/.test(name)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))throw Error('Недопустимое имя файла.');return name;}
async function exists(p){try{await fs.lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function uniquePath(folder,name,reserved=new Set()){
  const parsed=path.parse(filename(name));let candidate=path.join(folder,parsed.base),n=2;
  while(reserved.has(candidate.toLowerCase())||await exists(candidate)){candidate=path.join(folder,`${parsed.name} (${n++})${parsed.ext}`);}
  reserved.add(candidate.toLowerCase());return candidate;
}
async function hash(file){const sum=crypto.createHash('sha256');for await(const chunk of createReadStream(file))sum.update(chunk);return sum.digest('hex');}
const stamp=s=>({size:s.size,mtime:s.mtimeMs,ino:s.ino,dev:s.dev});
const unchanged=(a,b)=>a.size===b.size&&a.mtime===b.mtime&&a.ino===b.ino&&a.dev===b.dev;
async function scan(folder){
  const root=await fs.realpath(folder),entries=await fs.readdir(root,{withFileTypes:true});const files=[];
  for(const e of entries){if(!e.isFile()||e.name.startsWith('.')||/\.(crdownload|part|partial|tmp)$/i.test(e.name))continue;try{const full=path.join(root,e.name),stat=await fs.lstat(full);if(!stat.isFile()||stat.isSymbolicLink())continue;files.push({name:e.name,path:full,...stamp(stat),category:category(e.name)});}catch{}}
  return {root,files:files.sort((a,b)=>a.name.localeCompare(b.name,'ru',{numeric:true}))};
}
async function planOrganize(folder){const data=await scan(folder),reserved=new Set(),moves=[];for(const f of data.files){const targetFolder=path.join(data.root,f.category);if(await exists(targetFolder)){const st=await fs.lstat(targetFolder);if(!st.isDirectory()||st.isSymbolicLink())throw Error(`«${f.category}» не является обычной папкой.`);}moves.push({...f,to:await uniquePath(targetFolder,f.name,reserved)});}return {kind:'organize',root:data.root,moves};}
async function planRename(paths,template,start=1){if(!template||template.length>120)throw Error('Шаблон должен содержать от 1 до 120 символов.');if(!Number.isSafeInteger(start)||start<0||start>999999)throw Error('Номер должен быть от 0 до 999999.');const moves=[],reserved=new Set();for(let i=0;i<paths.length;i++){const from=paths[i],st=await fs.lstat(from);if(!st.isFile()||st.isSymbolicLink())continue;const parsed=path.parse(from),stem=template.replaceAll('{name}',parsed.name).replaceAll('{n}',String(start+i).padStart(3,'0')),name=filename(stem)+parsed.ext;if(name===parsed.base)continue;moves.push({name:parsed.base,path:from,...stamp(st),to:await uniquePath(parsed.dir,name,reserved)});}return {kind:'rename',root:null,moves};}
async function moveOne(move,onJournal){
  const st=await fs.lstat(move.path);if(!st.isFile()||st.isSymbolicLink()||!unchanged(move,stamp(st)))throw Error(`Файл изменился: ${move.name}. Постройте план заново.`);
  const dir=path.dirname(move.to);await fs.mkdir(dir,{recursive:true});const real=await fs.realpath(dir);if(real.toLowerCase()!==path.resolve(dir).toLowerCase())throw Error('Целевая папка содержит ссылку. Перемещение отменено.');
  await fs.copyFile(move.path,move.to,require('node:fs').constants.COPYFILE_EXCL);
  const sourceAfter=stamp(await fs.lstat(move.path));
  if(!unchanged(move,sourceAfter)){await fs.unlink(move.to);throw Error(`Файл изменился во время копирования: ${move.name}. Оригинал оставлен.`);}
  const digest=await hash(move.to);if(digest!==await hash(move.path)){await fs.unlink(move.to);throw Error('Файл изменился во время проверки. Оригинал оставлен.');}
  const record={from:move.path,to:move.to,hash:digest,size:move.size};
  // Durable journal precedes source removal, so interrupted moves can be recovered.
  await onJournal(record);
  if(!unchanged(move,stamp(await fs.lstat(move.path))))throw Error('Исходный файл изменился перед перемещением. Обе копии сохранены.');
  await fs.unlink(move.path);return record;
}
async function applyPlan(plan,onJournal=async()=>{},onProgress=()=>{}){
  const results=[],errors=[];
  for(let i=0;i<plan.moves.length;i++){const m=plan.moves[i];try{results.push(await moveOne(m,onJournal));}catch(e){errors.push({name:m.name,error:e.message});}onProgress(i+1,plan.moves.length);}
  return {results,errors};
}
async function undo(records,onProgress=()=>{}){
  const restored=[],errors=[];
  for(const r of [...records].reverse())try{
    for(const p of [r.to,r.from]){const parent=path.dirname(p);const real=await fs.realpath(parent);if(real.toLowerCase()!==path.resolve(parent).toLowerCase())throw Error('Папка содержит ссылку; автоматическая отмена остановлена.');}
    if(!await exists(r.to))throw Error('Файл в целевой папке не найден.');
    const st=await fs.lstat(r.to);if(!st.isFile()||st.isSymbolicLink()||await hash(r.to)!==r.hash)throw Error('Файл изменён после операции; автоматически отменять его нельзя.');
    if(await exists(r.from)){const original=await fs.lstat(r.from);if(!original.isFile()||original.isSymbolicLink()||await hash(r.from)!==r.hash)throw Error('Исходное имя уже занято другим файлом.');}
    else{await fs.mkdir(path.dirname(r.from),{recursive:true});const real=await fs.realpath(path.dirname(r.from));if(real.toLowerCase()!==path.resolve(path.dirname(r.from)).toLowerCase())throw Error('Исходная папка содержит ссылку.');await fs.copyFile(r.to,r.from,require('node:fs').constants.COPYFILE_EXCL);if(await hash(r.from)!==r.hash)throw Error('Не удалось проверить восстановленную копию.');}
    if(await hash(r.to)!==r.hash||await hash(r.from)!==r.hash)throw Error('Файл изменился во время отмены. Копии сохранены.');
    await fs.unlink(r.to);restored.push(r);onProgress(restored.length,records.length);
  }catch(e){errors.push({name:path.basename(r.to),error:e.message,record:r});}
  return {restored,errors};
}
module.exports={category,filename,uniquePath,exists,hash,scan,planOrganize,planRename,applyPlan,undo};
