const {contextBridge,ipcRenderer,webUtils}=require('electron');
contextBridge.exposeInMainWorld('deskflow',{
 call:(action,args)=>ipcRenderer.invoke('deskflow',action,args),
 dropped:files=>ipcRenderer.invoke('deskflow','files:drop',Array.from(files).map(f=>webUtils.getPathForFile(f))),
 drag:id=>ipcRenderer.send('deskflow-drag',id),
 progress:callback=>{const fn=(_e,p)=>callback(p);ipcRenderer.on('deskflow-progress',fn);return()=>ipcRenderer.removeListener('deskflow-progress',fn);},
 navigate:callback=>{const fn=(_e,p)=>callback(p);ipcRenderer.on('deskflow-navigate',fn);return()=>ipcRenderer.removeListener('deskflow-navigate',fn);},
 theme:callback=>{const fn=(_e,dark)=>callback(dark);ipcRenderer.on('deskflow-theme',fn);return()=>ipcRenderer.removeListener('deskflow-theme',fn);},
});
