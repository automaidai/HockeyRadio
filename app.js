'use strict';
const audio = document.querySelector('#audio');
const statusText = document.querySelector('#player-status');
const toggle = document.querySelector('#player-toggle');
const volume = document.querySelector('#volume');
audio.volume = .7;
let connecting = false;
function syncPlayer(){
  const playing = !audio.paused;
  document.body.classList.toggle('is-playing',playing);
  document.querySelectorAll('.play-icon').forEach(el=>el.textContent=playing?'Ⅱ':'▶');
  toggle.setAttribute('aria-label',playing?'Livestream pausieren':'Livestream starten');
  document.querySelectorAll('.play-trigger').forEach(el=>el.setAttribute('aria-pressed',String(playing)));
}
document.querySelectorAll('.play-trigger').forEach(button=>button.addEventListener('click',async()=>{
  if(connecting){audio.pause();connecting=false;statusText.textContent='Stream pausiert';return;}
  if(!audio.paused){audio.pause();return;}
  connecting=true;statusText.textContent='Verbindung zum Stream …';
  try{await audio.play();}catch(error){if(error.name!=='AbortError')statusText.textContent='Stream nicht erreichbar. Bitte erneut starten.';}finally{connecting=false;syncPlayer();}
}));
audio.addEventListener('playing',()=>{statusText.textContent='Du hörst HockeyRadio · Live';syncPlayer();});
audio.addEventListener('pause',()=>{statusText.textContent='Stream pausiert';syncPlayer();});
audio.addEventListener('waiting',()=>{statusText.textContent='Stream lädt …';});
audio.addEventListener('error',()=>{statusText.textContent='Verbindung unterbrochen. Bitte erneut starten.';syncPlayer();});
audio.addEventListener('ended',()=>{statusText.textContent='Stream beendet. Erneut starten?';syncPlayer();});
volume.addEventListener('input',()=>{audio.volume=Number(volume.value);audio.muted=false;syncMute();});
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
const content={
imprint:['IMPRESSUM',`<p class="dialog-note">Website-Vorschau: Die verbindlichen Betreiberangaben für HockeyRadio sind noch zu ergänzen.</p><p>Vor dem offiziellen Start müssen insbesondere Betreiber, ladungsfähige Anschrift, Vertretungsberechtigte, Kontakt und redaktionell Verantwortliche bestätigt und hier eingetragen werden.</p><p>Die Nennung von SpradeTV und Blueline beschreibt die Senderzuordnung laut Stream-Metadaten und ersetzt keine Betreiberangaben.</p>`],
privacy:['DATENSCHUTZ',`<p class="dialog-note">Informationen zur Vorschau. Die vollständige Datenschutzerklärung mit Verantwortlichem und Rechtsgrundlagen folgt nach Freigabe.</p><p>Beim Öffnen der Website werden Dateien über Vercel und Schriftarten von Google Fonts geladen. Dabei wird deine IP-Adresse an die jeweiligen Anbieter übertragen. Beim Starten des Livestreams verbindet sich dein Browser mit RadioKing; dabei werden deine IP-Adresse und technische Verbindungsdaten übermittelt.</p><p>Deine Sender-Merkliste wird ausschließlich lokal im Browser gespeichert. Diese Vorschau verwendet keine Analyse- oder Marketingwerkzeuge.</p><p>Eine Mikrofonaufnahme startet nur auf deinen ausdrücklichen Klick und nach Browserfreigabe. Die Aufnahme bleibt lokal auf deinem Gerät. Es gibt keinen automatischen Upload.</p>`],
greeting:['DEINE STIMME FÜRS TEAM.',`<p>Ein Gruß an die Fankurve? Nimm hier bis zu 30 Sekunden auf und lade deinen Radiogruß herunter.</p><p class="dialog-note">Die Aufnahme bleibt auf deinem Gerät. Ein Versand an die Redaktion ist in dieser Vorschau noch nicht eingerichtet.</p><div class="record-controls"><button class="button" id="record-start">● Aufnahme starten</button><button class="button outline" id="record-stop" disabled>Aufnahme beenden</button></div><p id="record-status" role="status">Das Mikrofon wird erst nach deinem Klick angefragt.</p><div id="record-result"></div>`]
};
document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{const [title,body]=content[button.dataset.dialog];showDialog(title,body);if(button.dataset.dialog==='greeting')setupRecording();}));
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
let recorder=null,recordStream=null,recordTimer=null,recordInterval=null,recordUrl=null,recordSession=0;
function stopTracks(){recordStream?.getTracks().forEach(track=>track.stop());recordStream=null;clearTimeout(recordTimer);clearInterval(recordInterval);}
dialog.addEventListener('close',()=>{recordSession++;if(recorder?.state==='recording')recorder.stop();stopTracks();if(recordUrl){URL.revokeObjectURL(recordUrl);recordUrl=null;}});
function setupRecording(){
const start=document.querySelector('#record-start'),stop=document.querySelector('#record-stop'),status=document.querySelector('#record-status'),result=document.querySelector('#record-result');
if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){start.disabled=true;status.textContent='Dein Browser unterstützt hier keine Aufnahme. Verwende einen aktuellen Browser über HTTPS.';return;}
start.addEventListener('click',async()=>{start.disabled=true;const session=++recordSession;try{
recordStream=await navigator.mediaDevices.getUserMedia({audio:true});if(!dialog.open||session!==recordSession){stopTracks();return;}
if(recordUrl){URL.revokeObjectURL(recordUrl);recordUrl=null;}result.innerHTML='';
recorder=new MediaRecorder(recordStream);const chunks=[];
recorder.addEventListener('dataavailable',e=>{if(e.data.size)chunks.push(e.data);});
recorder.addEventListener('stop',()=>{stopTracks();if(session!==recordSession||!dialog.open)return;const blob=new Blob(chunks,{type:recorder.mimeType});recordUrl=URL.createObjectURL(blob);const ext=recorder.mimeType.includes('mp4')?'m4a':'webm';result.innerHTML=`<audio class="record-preview" controls src="${recordUrl}"></audio><a class="button" href="${recordUrl}" download="HockeyRadio-Radiogruss.${ext}">Radiogruß herunterladen ↓</a>`;status.textContent='Fertig. Du kannst die Aufnahme anhören und herunterladen.';start.disabled=false;stop.disabled=true;});
recorder.start();let seconds=0;status.textContent='Aufnahme läuft · 0 / 30 Sekunden';stop.disabled=false;
recordInterval=setInterval(()=>{seconds++;status.textContent=`Aufnahme läuft · ${seconds} / 30 Sekunden`;},1000);
recordTimer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},30000);
}catch(error){stopTracks();start.disabled=false;status.textContent='Mikrofon nicht verfügbar oder nicht freigegeben. Prüfe die Mikrofonfreigabe deines Browsers.';}});
stop.addEventListener('click',()=>{if(recorder?.state==='recording')recorder.stop();});
}
document.querySelector('#year').textContent=new Date().getFullYear();
