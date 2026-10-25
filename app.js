'use strict';
const audio = document.querySelector('#audio');
const statusText = document.querySelector('#player-status');
const toggle = document.querySelector('#player-toggle');
const volumeControls = document.querySelectorAll('.volume-control');
function setStatus(text){statusText.textContent=text;document.querySelectorAll('[data-stream-status]').forEach(el=>el.textContent=text);}
audio.volume = .7;
let connecting = false;
function syncPlayer(){
  const playing = !audio.paused;
  document.body.classList.toggle('is-playing',playing);
  document.querySelectorAll('.play-icon').forEach(el=>el.textContent=playing?'Ⅱ':'▶');
  toggle.setAttribute('aria-label',playing?'Livestream pausieren':'Livestream starten');
  document.querySelector('#hero-play').setAttribute('aria-label',playing?'HockeyRadio Livestream pausieren':'HockeyRadio Livestream starten');
  document.querySelectorAll('.play-trigger').forEach(el=>el.setAttribute('aria-pressed',String(playing)));
}
document.querySelectorAll('.play-trigger').forEach(button=>button.addEventListener('click',async()=>{
  if(connecting){audio.pause();connecting=false;setStatus('Stream pausiert');return;}
  if(!audio.paused){audio.pause();return;}
  connecting=true;setStatus('Verbindung zum Stream …');
  try{await audio.play();}catch(error){if(error.name!=='AbortError')setStatus('Stream nicht erreichbar. Bitte erneut starten.');}finally{connecting=false;syncPlayer();}
}));
audio.addEventListener('playing',()=>{setStatus('Du hörst HockeyRadio · Live');syncPlayer();});
audio.addEventListener('pause',()=>{setStatus('Stream pausiert');syncPlayer();});
audio.addEventListener('waiting',()=>{setStatus('Stream lädt …');});
audio.addEventListener('error',()=>{setStatus('Verbindung unterbrochen. Bitte erneut starten.');syncPlayer();});
audio.addEventListener('ended',()=>{setStatus('Stream beendet. Erneut starten?');syncPlayer();});
volumeControls.forEach(control=>control.addEventListener('input',()=>{audio.volume=Number(control.value);audio.muted=false;volumeControls.forEach(other=>other.value=control.value);syncMute();}));
const mute=document.querySelector('#mute');
function syncMute(){mute.textContent=audio.muted||audio.volume===0?'⊘':'♪';mute.setAttribute('aria-label',audio.muted?'Ton einschalten':'Ton ausschalten');}
mute.addEventListener('click',()=>{audio.muted=!audio.muted;syncMute();});
const favorite=document.querySelector('#favorite');
let saved=false;try{saved=localStorage.getItem('hockeyradio-favorite')==='true';}catch{}
function syncFavorite(){favorite.setAttribute('aria-pressed',String(saved));favorite.textContent=saved?'♥':'♡';favorite.setAttribute('aria-label',saved?'Sender aus Merkliste entfernen':'Sender merken');}
favorite.addEventListener('click',()=>{saved=!saved;try{localStorage.setItem('hockeyradio-favorite',String(saved));}catch{}syncFavorite();});syncFavorite();
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.header nav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menü öffnen');nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a===link));}));
const weekdays=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
const programs=[
  {time:'JEDE STUNDE',hourly:true,title:'POWERPLAY DER STUNDE',art:'POWERPLAY<br><span>DER STUNDE.</span>',kind:'NEWS / EISHOCKEY',text:'Eure News aus der Eishockeywelt.'},
  {time:'06:00 – 10:00',title:'DIE FRÜHSCHICHT',art:'ERSTES<br><span>BULLY.</span>',kind:'MORNING / MUSIK',text:'Mit Energie und deinem Sound in den Tag.'},
  {time:'10:00 – 14:00',title:'HOCKEY & HITS',art:'HOCKEY<br><span>& HITS.</span>',kind:'DAYTIME / MUSIK',text:'Der Musikmix für deinen Eishockeyalltag.'},
  {time:'14:00 – 18:00',title:'DIE DRITTELPAUSE',art:'DRITTEL<br><span>PAUSE.</span>',kind:'AFTERNOON / MUSIK',text:'Kopf frei, Musik an. Dein Nachmittag.'},
  {time:'18:00 – 24:00',title:'OVERTIME',art:'OVER<br><span>TIME.</span>',kind:'EVENING / MUSIK',text:'Dein Soundtrack nach der Schlusssirene.'}
];
let selectedDay=HockeySchedule.berlinTime().day;
let currentView="programme",followToday=true,clockDay=selectedDay;
let infoFormats=[],infosState="loading";
let programmeWeek=HOCKEY_PROGRAMME;
const programmeCacheKey='hockeyradio-programme-v2';
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function decorateProgram(p,index){
  const known=programs.find(original=>original.title===p.title.toUpperCase());
  return {...p,title:p.title.toUpperCase(),art:known?.art||escapeHTML(p.title.toUpperCase()),
    kind:known?.kind||(p.hourly?'NEWS / EISHOCKEY':'HOCKEYRADIO / MUSIK'),artIndex:known?Math.max(0,programs.indexOf(known)-1):index%4};
}
function validProgramme(week){return Array.isArray(week)&&week.length===7&&week.every(day=>Array.isArray(day)&&day.length<=60&&day.every(p=>p&&typeof p.title==='string'&&typeof p.text==='string'&&typeof p.time==='string'&&typeof p.hourly==='boolean'&&typeof p.draft==='boolean'));}
try{
  const cached=JSON.parse(localStorage.getItem(programmeCacheKey));
  if(cached&&Date.now()-cached.at<86400000&&validProgramme(cached.week))programmeWeek=cached.week;
}catch{}
const dialog=document.querySelector('#info-dialog'),dialogTitle=document.querySelector('#dialog-title'),dialogBody=document.querySelector('#dialog-body');
function showDialog(title,body){dialogTitle.textContent=title;dialogBody.innerHTML=body;dialog.showModal();}
const infoDescriptions={
  'das eishockeywetter':'Das Wetter für deinen Eishockeytag.',
  'eisblog kompakt':'Eishockey kompakt mit Eisblog.',
  'der equipment check':'Ausrüstung im Check. Für deinen nächsten Einsatz auf dem Eis.',
  'food & pucks - der speisetipp':'Der Speisetipp für deinen Eishockeyalltag.'
};
const infoArt={
  'das eishockeywetter':'WETTER<br><span>AUF EIS.</span>',
  'eisblog kompakt':'EISBLOG<br><span>KOMPAKT.</span>',
  'der equipment check':'EQUIPMENT<br><span>CHECK.</span>',
  'food & pucks - der speisetipp':'FOOD<br><span>& PUCKS.</span>'
};
function visibleInfos(){
  return infoFormats.map((format,index)=>{
    const slots=format.slots.filter(slot=>!slot.days.length||slot.days.includes(selectedDay));
    const times=[...new Set(slots.length?slots.map(slot=>slot.time):!format.days.length||format.days.includes(selectedDay)?format.times:[])].sort();
    const explicitDays=[...new Set(slots.flatMap(slot=>slot.days.length?slot.days:[]))];
    const days=explicitDays.length?explicitDays:format.days;
    return {...format,title:format.title.toUpperCase(),text:infoDescriptions[format.title.toLowerCase()]||'Deine kurzen Infos bei HockeyRadio.',
      time:times.length?times.join(' / '):'RUBRIK',hourly:false,draft:false,art:infoArt[format.title.toLowerCase()]||escapeHTML(format.title.toUpperCase()),artIndex:index%4,kind:'INFOS',
      daysNote:!days.length?'':days.length===7?'Täglich':days.map(d=>weekdays[d].slice(0,2)).join(' / '),
      hasTiming:slots.some(slot=>slot.days.length&&slot.duration>0)};
  });
}
function renderProgram(){
  const infos=currentView==='infos',day=infos?visibleInfos():programmeWeek[selectedDay].map(decorateProgram);
  document.querySelector('#program-grid').classList.toggle('is-infos',infos);
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===currentView)));
  document.querySelector('#program-grid').innerHTML=day.length?day.map((p,i)=>{
    const label=`${weekdays[selectedDay]}: ${p.title}, ${p.time}${p.hourly||infos?'':' Uhr'} ansehen`;
    if(infos)return `<button class="program-card info-row" data-program="${i}" data-base-label="${escapeHTML(label)}" aria-label="${escapeHTML(label)}"><span class="info-time">${escapeHTML(p.time)}</span><span class="info-content"><span class="live-badge" hidden>JETZT LIVE</span><h3>${escapeHTML(p.title).replace(/EISHOCKEYWETTER/g,'EISHOCKEY&shy;WETTER')}</h3><p>${escapeHTML(p.text)}</p><span class="info-days">${escapeHTML(p.daysNote)}</span></span><span class="info-arrow" aria-hidden="true">↗</span></button>`;
    return `<button class="program-card" data-program="${i}" data-base-label="${escapeHTML(label)}" aria-label="${escapeHTML(label)}"><div class="card-art art-${p.artIndex??Math.max(0,i-1)}${infos?' info-art':''}"><span class="card-time">${escapeHTML(p.time)}${p.hourly||infos?'':' UHR'}</span><span class="art-word">${p.art}</span><span class="card-kind">${p.kind}</span></div><div class="card-body"><span class="live-badge" hidden>JETZT LIVE</span><h3>${escapeHTML(p.title).replace(/EISHOCKEYWETTER/g,'EISHOCKEY&shy;WETTER')}</h3><p>${escapeHTML(p.text)}</p>${infos?`<p class="info-label">${escapeHTML(p.daysNote)}</p>`:''}<div class="card-footer"><span>${infos?'Info-Einspieler':weekdays[selectedDay]+' · '+(p.hourly?'Eishockey-News':'Sendung')}</span><b>↗</b></div></div></button>`;
  }).join(''):`<p class="programme-empty">${infos?(infosState==='loading'?'Infos werden geladen …':infosState==='error'?'Die Infos sind gerade nicht erreichbar. Bitte später erneut versuchen.':'Die ersten Infos folgen in Kürze.'):'Für diesen Tag sind noch keine Sendungen eingetragen.'}</p>`;
  document.querySelectorAll('[data-program]').forEach(button=>button.addEventListener('click',()=>{
    const p=day[Number(button.dataset.program)];
    showDialog(p.title,`<p class="eyebrow">${infos?(p.daysNote?escapeHTML(p.daysNote)+' · ':''):weekdays[selectedDay]+' · '}${escapeHTML(p.time)}${p.hourly||infos?'':' Uhr'}</p><p>${escapeHTML(p.text)}</p>${p.hourly?'<p class="dialog-note">Eure Eishockey-News, jede Stunde bei HockeyRadio.</p>':''}<p>Den HockeyRadio-Livestream kannst du jederzeit über den Player unten starten.</p>`);
  }));
  updateLiveState();
}
function updateLiveState(){
  const now=new Date(),clock=HockeySchedule.berlinTime(now),live=HockeySchedule.currentProgramme(programmeWeek,now);
  if(clock.day!==clockDay){clockDay=clock.day;if(followToday){selectedDay=clock.day;syncDayButtons();renderProgram();return;}}
  document.querySelectorAll('[data-day]').forEach(b=>{b.classList.toggle('is-today',Number(b.dataset.day)===clock.day);b.title=weekdays[Number(b.dataset.day)]+(Number(b.dataset.day)===clock.day?' · Heute':'');});
  document.querySelector('#now-program-text').textContent=live?'Jetzt: '+live.program.title+' · '+live.program.time:'HockeyRadio · Livestream';
  document.querySelector('#now-program').classList.toggle('has-programme',Boolean(live));
  document.querySelector('#now-program').title=live?'Aktuelle Sendung laut Sendeplan anzeigen':'Zum heutigen Programm';
  const infos=currentView==='infos',visible=infos?visibleInfos():[];
  document.querySelectorAll('[data-program]').forEach(button=>{
    const index=Number(button.dataset.program),onAir=infos?HockeySchedule.insertLive(visible[index].slots,now):Boolean(live&&live.day===selectedDay&&live.index===index);
    button.classList.toggle('is-live',onAir);button.querySelector('.live-badge').hidden=!onAir;
    button.setAttribute('aria-label',button.dataset.baseLabel+(onAir?' · Jetzt live laut Sendeplan':''));
    if(onAir)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
  });
}
function syncDayButtons(){document.querySelectorAll('[data-day]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.day)===selectedDay)));}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{currentView=b.dataset.view;renderProgram();}));
document.querySelector('#now-program').addEventListener('click',()=>{const live=HockeySchedule.currentProgramme(programmeWeek);selectedDay=live?live.day:HockeySchedule.berlinTime().day;followToday=true;currentView='programme';syncDayButtons();renderProgram();});
setInterval(updateLiveState,15000);
let refreshingProgramme=false;
async function refreshProgramme(){
  if(refreshingProgramme||document.hidden)return;
  refreshingProgramme=true;
  try{
    const response=await fetch('/api/program',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('Programme unavailable');
    const data=await response.json();
    if(!validProgramme(data.week))throw new Error('Invalid programme');
    const changed=JSON.stringify(programmeWeek)!==JSON.stringify(data.week);
    programmeWeek=data.week;
    try{localStorage.setItem(programmeCacheKey,JSON.stringify({week:data.week,at:Date.now()}));}catch{}
    if(changed)renderProgram();
  }catch{/* Keep the last valid programme and leave the radio uninterrupted. */}
  finally{refreshingProgramme=false;}
}
setInterval(refreshProgramme,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshProgramme();});
refreshProgramme();
document.querySelectorAll('[data-day]').forEach(button=>button.addEventListener('click',()=>{selectedDay=Number(button.dataset.day);followToday=selectedDay===HockeySchedule.berlinTime().day;syncDayButtons();renderProgram();}));
syncDayButtons();renderProgram();
let refreshingInfos=false;
async function refreshInfos(){
  if(refreshingInfos||document.hidden)return;refreshingInfos=true;
  try{
    const response=await fetch('/api/infos',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Infos unavailable');
    const {formats}=await response.json();
    if(!Array.isArray(formats)||formats.length>100||!formats.every(f=>typeof f.title==='string'&&Array.isArray(f.times)&&Array.isArray(f.days)&&Array.isArray(f.slots)))throw Error('Invalid infos');
    const changed=JSON.stringify(infoFormats)!==JSON.stringify(formats)||infosState!=='ready';
    infoFormats=formats;infosState='ready';if(changed&&currentView==='infos')renderProgram();
  }catch{if(!infoFormats.length){infosState='error';if(currentView==='infos')renderProgram();}}
  finally{refreshingInfos=false;}
}
setInterval(refreshInfos,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshInfos();updateLiveState();}});refreshInfos();
document.querySelectorAll('[data-dialog="greeting"]').forEach(button=>button.addEventListener('click',()=>{
  if(!audio.paused)audio.pause();
  showDialog('JETZT RADIOGRUSS ABSENDEN',`<p class="greeting-intro">Deine Stimme für die Fankurve. Nimm deinen Gruß auf und sende ihn direkt an HockeyRadio.</p><div class="radioking-widget"><iframe id="AudioDedication" title="Radiogruß an HockeyRadio senden" src="https://widget.radioking.io/audio-shoutouts/?id=hockey-radio" allow="microphone" width="265" height="365" style="border-radius: 8px;" frameborder="0"></iframe></div><p class="widget-note">Die Aufnahme und der Versand erfolgen über RadioKing. Der Mikrofonzugriff beginnt erst, wenn du im Widget eine Aufnahme startest und dein Browser die Freigabe hat. <a href="/datenschutz">Datenschutzhinweise</a></p><a class="widget-fallback" href="https://widget.radioking.io/audio-shoutouts/?id=hockey-radio" target="_blank" rel="noopener noreferrer">Widget alternativ in neuem Tab öffnen ↗</a>`);
  dialog.classList.add('greeting-dialog');
}));
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{dialog.classList.remove('greeting-dialog');dialogBody.innerHTML='';});
const partnersToggle=document.querySelector('#partners-toggle');
partnersToggle.addEventListener('click',()=>{const paused=document.querySelector('.partners').classList.toggle('paused');partnersToggle.setAttribute('aria-pressed',String(paused));partnersToggle.setAttribute('aria-label',paused?'Partner-Slider starten':'Partner-Slider anhalten');partnersToggle.textContent=paused?'▶':'Ⅱ';});
document.querySelector('#year').textContent=new Date().getFullYear();
