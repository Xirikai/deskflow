using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Web.Script.Serialization;
using NAudio.CoreAudioApi;

[ComImport,Guid("870af99c-171d-4f9e-af0d-e63df40c2bc9")] class PolicyConfigClient {}
[ComImport,Guid("f8679f50-850a-41cf-9c72-430f290290c8"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IPolicyConfig {
 int GetMixFormat(string id,IntPtr f);int GetDeviceFormat(string id,int d,IntPtr f);int ResetDeviceFormat(string id);int SetDeviceFormat(string id,IntPtr a,IntPtr b);int GetProcessingPeriod(string id,int d,IntPtr a,IntPtr b);int SetProcessingPeriod(string id,IntPtr p);int GetShareMode(string id,IntPtr m);int SetShareMode(string id,IntPtr m);int GetPropertyValue(string id,IntPtr key,IntPtr value);int SetPropertyValue(string id,IntPtr key,IntPtr value);
 [PreserveSig]int SetDefaultEndpoint([MarshalAs(UnmanagedType.LPWStr)]string id,int role);
 int SetEndpointVisibility(string id,int visible);
}
class Audio {
 static JavaScriptSerializer json=new JavaScriptSerializer();
 static MMDevice Device(MMDeviceEnumerator en,string id) { return String.IsNullOrEmpty(id)?en.GetDefaultAudioEndpoint(DataFlow.Render,Role.Multimedia):en.GetDevice(id); }
 static object Snapshot(MMDeviceEnumerator en) {
  var devices=new List<object>();var sessions=new List<object>();string defaultId=null;try{using(var d=en.GetDefaultAudioEndpoint(DataFlow.Render,Role.Multimedia)){defaultId=d.ID;}}catch{}
  foreach(var d in en.EnumerateAudioEndPoints(DataFlow.Render,DeviceState.Active))using(d){
   try{devices.Add(new {id=d.ID,name=d.FriendlyName,volume=(int)Math.Round(d.AudioEndpointVolume.MasterVolumeLevelScalar*100),mute=d.AudioEndpointVolume.Mute,isDefault=d.ID==defaultId});}catch{}
   try{var list=d.AudioSessionManager.Sessions;for(int i=0;i<list.Count;i++)using(var s=list[i]){
    if(s.SimpleAudioVolume==null)continue;int pid=(int)s.GetProcessID;string name="Системные звуки";try{if(pid>0)using(var p=Process.GetProcessById(pid)){name=p.ProcessName;}}catch{name="Процесс "+pid;}
    sessions.Add(new {deviceId=d.ID,pid=pid,name=name,volume=(int)Math.Round(s.SimpleAudioVolume.Volume*100),mute=s.SimpleAudioVolume.Mute});
   }}catch{}
  }
  return new {devices=devices,sessions=sessions};
 }
 [STAThread] static int Main(string[] args) {
  Console.OutputEncoding=new System.Text.UTF8Encoding(false);
  try{using(var en=new MMDeviceEnumerator()){
   string command=args.Length>0?args[0]:"list";
   if(command=="list"){Console.WriteLine(json.Serialize(Snapshot(en)));return 0;}
   if(args.Length<2)throw new Exception("Missing device");
   using(var d=Device(en,args[1])){
    if(command=="default"){
     if(d.State!=DeviceState.Active)throw new Exception("Устройство недоступно");
     var policy=(IPolicyConfig)new PolicyConfigClient();try{for(int role=0;role<3;role++)Marshal.ThrowExceptionForHR(policy.SetDefaultEndpoint(d.ID,role));}finally{Marshal.ReleaseComObject(policy);}
    }else if(command=="master"){
     int value=Int32.Parse(args[2]);if(value<0||value>100)throw new Exception("Volume 0..100");d.AudioEndpointVolume.MasterVolumeLevelScalar=value/100f;
    }else if(command=="mute"){d.AudioEndpointVolume.Mute=args[2]=="1";}
    else if(command=="session"){
     int pid=Int32.Parse(args[2]),volume=Int32.Parse(args[3]);if(volume<0||volume>100)throw new Exception("Volume 0..100");
     bool found=false;var list=d.AudioSessionManager.Sessions;for(int i=0;i<list.Count;i++)using(var s=list[i])if((int)s.GetProcessID==pid&&s.SimpleAudioVolume!=null){s.SimpleAudioVolume.Volume=volume/100f;found=true;}
     if(!found)throw new Exception("Программа больше не воспроизводит звук. Обновите список.");
    }else throw new Exception("Unknown command");
   }
   Console.WriteLine(json.Serialize(Snapshot(en)));return 0;
  }}catch(Exception e){Console.WriteLine(json.Serialize(new {error=e.Message}));return 1;}
 }
}
