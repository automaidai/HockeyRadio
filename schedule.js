(function(root){
  'use strict';
  const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function berlinTime(date=new Date()){
    const parts=Object.fromEntries(formatter.formatToParts(date).map(p=>[p.type,p.value]));
    return {day:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(parts.weekday),seconds:Number(parts.hour)*3600+Number(parts.minute)*60+Number(parts.second)};
  }
  function seconds(time){const match=/^(\d{1,2}):([0-5]\d)$/.exec(time||'');return match&&Number(match[1])<=24&&(Number(match[1])<24||match[2]==='00')?Number(match[1])*3600+Number(match[2])*60:null;}
  function interval(p){
    if(p.hourly)return null;
    const match=/^(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})$/.exec(p.time||'');
    if(!match)return null;
    const start=seconds(match[1]),end=seconds(match[2]);
    return start===null||end===null||start===end?null:{start,end:end<start?end+86400:end};
  }
  function currentProgramme(week,date=new Date()){
    const now=berlinTime(date),matches=[];
    for(const offset of [-1,0]){
      const day=(now.day+offset+7)%7;
      (week[day]||[]).forEach((program,index)=>{
        const slot=interval(program);if(!slot)return;
        const relative=now.seconds-offset*86400;
        if(relative>=slot.start&&relative<slot.end)matches.push({day,index,program,start:slot.start+offset*86400});
      });
    }
    return matches.sort((a,b)=>b.start-a.start)[0]||null;
  }
  function insertLive(slots,date=new Date()){
    const now=berlinTime(date);
    return slots.filter(slot=>slot.days.includes(now.day)&&slot.duration>0).some(slot=>{
      const start=seconds(slot.time);return start!==null&&now.seconds>=start&&now.seconds<start+slot.duration;
    })||slots.some(slot=>slot.days.includes((now.day+6)%7)&&slot.duration>0&&seconds(slot.time)!==null&&now.seconds+86400>=seconds(slot.time)&&now.seconds+86400<seconds(slot.time)+slot.duration);
  }
  const api={berlinTime,seconds,interval,currentProgramme,insertLive};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.HockeySchedule=api;
})(typeof window==='undefined'?{}:window);
