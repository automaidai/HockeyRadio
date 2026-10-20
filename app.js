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
  {time:'06:00 – 10:00',title:'DIE FRÜHSCHICHT',art:'ERSTES<br><span>BULLY.</span>',kind:'MORNING / MUSIK',text:'Mit Energie und deinem Sound in den Tag.'},
  {time:'10:00 – 14:00',title:'HOCKEY & HITS',art:'HOCKEY<br><span>& HITS.</span>',kind:'DAYTIME / MUSIK',text:'Der Musikmix für deinen Eishockeyalltag.'},
  {time:'14:00 – 18:00',title:'DIE DRITTELPAUSE',art:'DRITTEL<br><span>PAUSE.</span>',kind:'AFTERNOON / MUSIK',text:'Kopf frei, Musik an. Dein Nachmittag.'},
  {time:'18:00 – 24:00',title:'ABEND AUF EIS',art:'ABEND<br><span>AUF EIS.</span>',kind:'EVENING / MUSIK',text:'Dein Soundtrack nach der Schlusssirene.'}
];
let selectedDay=0;
const dialog=document.querySelector('#info-dialog'),dialogTitle=document.querySelector('#dialog-title'),dialogBody=document.querySelector('#dialog-body');
function showDialog(title,body){dialogTitle.textContent=title;dialogBody.innerHTML=body;dialog.showModal();}
function renderProgram(){document.querySelector('#program-grid').innerHTML=programs.map((p,i)=>`<button class="program-card" data-program="${i}" aria-label="${weekdays[selectedDay]}: ${p.title}, ${p.time} Uhr – Beispielsendung ansehen"><div class="card-art art-${i}"><span class="card-time">${p.time} UHR</span><span class="art-word">${p.art}</span><span class="card-kind">${p.kind}</span></div><div class="card-body"><h3>${p.title}</h3><p>${p.text}</p><div class="card-footer"><span>${weekdays[selectedDay]} · Beispielsendung</span><b>↗</b></div></div></button>`).join('');
  document.querySelectorAll('[data-program]').forEach(button=>button.addEventListener('click',()=>{const p=programs[Number(button.dataset.program)];showDialog(p.title,`<p class="eyebrow">${weekdays[selectedDay]} · ${p.time} Uhr</p><p>${p.text}</p><p class="dialog-note">Programmidee in der Website-Vorschau. Diese Sendung und ihre Uhrzeit sind noch nicht redaktionell bestätigt.</p><p>Den echten HockeyRadio-Livestream kannst du jederzeit über den Player unten starten.</p>`);}));}
document.querySelectorAll('[data-day]').forEach(button=>button.addEventListener('click',()=>{selectedDay=Number(button.dataset.day);document.querySelectorAll('[data-day]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderProgram();}));
selectedDay=(new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Berlin'})).getDay()+6)%7;
document.querySelectorAll('[data-day]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.day)===selectedDay)));renderProgram();
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
