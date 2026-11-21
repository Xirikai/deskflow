const fs=require('node:fs/promises'),path=require('node:path'),{spawn}=require('node:child_process');
const sharp=require('sharp'),{PDFDocument}=require('pdf-lib');
const {uniquePath}=require('./files.cjs');
sharp.concurrency(2);sharp.cache({memory:48,files:0,items:20});
async function image(input,folder,{format='webp',width=1920,quality=82}={}){
 if(!['jpeg','png','webp'].includes(format))throw Error('Поддерживаются JPEG, PNG, WebP.');
 if(!Number.isInteger(width)||width<16||width>16000||!Number.isInteger(quality)||quality<10||quality>100)throw Error('Ширина: 16–16000, качество: 10–100.');
 const name=path.parse(input).name+'-deskflow.'+(format==='jpeg'?'jpg':format),out=await uniquePath(folder,name);
 const pipeline=sharp(input,{limitInputPixels:80_000_000}).autoOrient().resize({width,withoutEnlargement:true});
 if(format==='jpeg')pipeline.flatten({background:'#ffffff'}).jpeg({quality,mozjpeg:true});else if(format==='png')pipeline.png({compressionLevel:9});else pipeline.webp({quality});
 const buffer=await pipeline.toBuffer();await fs.writeFile(out,buffer,{flag:'wx'});return out;
}
async function pdf(inputs,folder){const doc=await PDFDocument.create();for(const input of inputs){const bytes=await sharp(input,{limitInputPixels:80_000_000}).autoOrient().resize({width:2400,height:3300,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:90}).toBuffer(),img=await doc.embedJpg(bytes);const landscape=img.width>img.height,[w,h]=landscape?[841.89,595.28]:[595.28,841.89],page=doc.addPage([w,h]);const fit=Math.min((w-48)/img.width,(h-48)/img.height);page.drawImage(img,{x:(w-img.width*fit)/2,y:(h-img.height*fit)/2,width:img.width*fit,height:img.height*fit});}const out=await uniquePath(folder,'Документ-DeskFlow.pdf');await fs.writeFile(out,await doc.save(),{flag:'wx'});return out;}
function ffmpegPath(configured){
 const sync=require('node:fs');
 const candidates=[configured,process.env.DESKFLOW_FFMPEG_BIN];
 if(process.env.PORTABLE_EXECUTABLE_DIR)candidates.push(path.join(process.env.PORTABLE_EXECUTABLE_DIR,'ffmpeg.exe'));
 try{const {execFileSync}=require('node:child_process');candidates.push(...execFileSync(process.platform==='win32'?'where.exe':'which',[process.platform==='win32'?'ffmpeg.exe':'ffmpeg'],{encoding:'utf8',windowsHide:true,timeout:5000}).trim().split(/\r?\n/));}catch{}
 for(const value of candidates){if(!value||!path.isAbsolute(value))continue;try{if(sync.statSync(value).isFile())return value;}catch{}}
 throw Error('Для видео нужен FFmpeg. Скачайте его с ffmpeg.org и выберите ffmpeg.exe в настройках DeskFlow. Остальные инструменты работают без него.');
}
async function muteVideo(input,folder,signal,configuredFfmpeg){const p=path.parse(input),out=await uniquePath(folder,p.name+'-без-звука'+p.ext);return new Promise((resolve,reject)=>{
 const child=spawn(ffmpegPath(configuredFfmpeg),['-hide_banner','-nostdin','-n','-i',input,'-map','0:v','-map','0:s?','-c','copy','-an',out],{windowsHide:true,stdio:['ignore','ignore','pipe'],signal});let errors='';child.stderr.on('data',b=>{errors=(errors+b).slice(-5000);});child.on('error',reject);child.on('close',async code=>{if(code===0)resolve(out);else{try{await fs.unlink(out);}catch{}reject(Error('Не удалось обработать видео: '+errors.slice(-1200)));}});
 });}
module.exports={image,pdf,muteVideo,ffmpegPath};
