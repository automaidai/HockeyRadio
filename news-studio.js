'use strict';
const $=id=>document.getElementById(id);
const studios={
 news:{label:'News',headline:'',second:'',intro:'',hint:'Wähle den News-Bereich aus und starte, wenn du bereit bist.',topic:true},
 ergebnisse:{label:'Ergebnisse',headline:'',second:'',intro:'',hint:'Ergänze optional Team, Spiel oder Anlass.',topic:false},
 spielankuendigungen:{label:'Spielankündigungen',headline:'',second:'',intro:'',hint:'Ergänze optional Teams, Liga oder Spieltag.',topic:false},
 ergebnisticker:{label:'Ergebnisticker',headline:'',second:'',intro:'',hint:'Ergänze optional Team, Spielstand oder Spielminute.',topic:false},
 stadionreporter:{label:'Stadion Reporter',headline:'',second:'',intro:'',hint:'Ergänze optional Halle, Teams oder Anlass.',topic:false}
};
const params=new URLSearchParams(location.search),studioKey=params.get('studio')||'news',studio=studios[studioKey]||studios.news;
$('studio-kicker').textContent=`HOCKEYRADIO · ${studio.label.toUpperCase()}`;
$('studio-title').hidden=!studio.headline;
if(studio.headline)$('studio-title').innerHTML=`${studio.headline}<br><span>${studio.second}</span>`;
$('studio-intro').hidden=!studio.intro;
$('studio-intro').textContent=studio.intro;
$('studio-hint').textContent=studio.hint;
$('topic-field').hidden=!studio.topic;
$('details-field').hidden=studio.topic;
$('news-format-field').hidden=!studio.topic;
$('news-music-field').hidden=!studio.topic;
$('news-partner-logo').hidden=!studio.topic;
$('custom-music-field').hidden=studio.topic;
const selectedNewsFormat=()=>document.querySelector('input[name="newsFormat"]:checked')?.value||'weekend';
const newsTracks={weekend:{name:'News Background',path:'/assets/studio-music/News_Background.mp3'},midweek:{name:'Powerplay News Background',path:'/assets/studio-music/Powerplay_News_Background.mp3'}};
const selectedNewsTrack=()=>newsTracks[selectedNewsFormat()];
function updateNewsTrack(){$('news-music-name').textContent=selectedNewsTrack().name;}
async function loadNewsTrack(){const response=await fetch(selectedNewsTrack().path,{cache:'force-cache'});if(!response.ok)throw Error('Die passende Hintergrundmusik ist nicht verfügbar.');return response.arrayBuffer();}
if(studio.topic){updateNewsTrack();document.querySelectorAll('input[name="newsFormat"]').forEach(input=>input.addEventListener('change',()=>{key=crypto.randomUUID();invalidate();updateNewsTrack();}));}
let recorder,stream,raw,mp3,url,mp3Filename,interval,started,busy=false,key=crypto.randomUUID();
const say=t=>$('status').textContent=t;
const invalidate=()=>{mp3=null;$('send').disabled=true;$('preview').hidden=true;};
for(const id of ['voice','bed'])$(id).oninput=()=>{$(id+'Value').textContent=$(id).value+' %';invalidate();};
$('music').onchange=invalidate;
$('topic').onchange=()=>{key=crypto.randomUUID();invalidate();};
function newsFilename(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'2-digit',month:'2-digit',day:'2-digit'}).formatToParts().map(part=>[part.type,part.value]));const date=`${parts.year}${parts.month}${parts.day}`;const kind=selectedNewsFormat()==='weekend'?'Bericht_Wochenende':'News';return `${date}_${kind}_${$('topic').value}.mp3`;}
function lock(value){busy=value;for(const id of ['record','music','voice','bed','topic','details'])$(id).disabled=value;document.querySelectorAll('input[name="newsFormat"]').forEach(input=>input.disabled=value);$('mix').disabled=value||!raw;$('send').disabled=value||!mp3;}
$('record').onclick=async()=>{
 if(raw&&!confirm('Bisherige Aufnahme ersetzen?'))return;
 try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});recorder=new MediaRecorder(stream);const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{clearInterval(interval);stream.getTracks().forEach(t=>t.stop());raw=new Blob(chunks,{type:recorder.mimeType});lock(false);$('stop').disabled=true;$('timer').textContent='00:00';$('mix').disabled=false;say('Aufnahme fertig. Du kannst jetzt mischen und deine MP3 anhören.');};invalidate();lock(true);$('stop').disabled=false;recorder.start();started=Date.now();say('Aufnahme läuft …');interval=setInterval(()=>{const s=Math.floor((Date.now()-started)/1000);$('timer').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');if(s>=180&&recorder.state==='recording')recorder.stop();},250);
 }catch(e){stream?.getTracks().forEach(t=>t.stop());lock(false);say('Mikrofon nicht verfügbar. Bitte Zugriff erlauben und HTTPS verwenden.');}
};
$('stop').onclick=()=>{if(recorder?.state==='recording'){recorder.stop();$('stop').disabled=true;}};
$('mix').onclick=async()=>{lock(true);say('MP3 wird erstellt …');let ctx;
 try{ctx=new AudioContext();const speech=await ctx.decodeAudioData(await raw.arrayBuffer());const rate=44100;const offline=new OfflineAudioContext(1,Math.ceil(speech.duration*rate),rate);const voice=offline.createBufferSource();voice.buffer=speech;const gain=offline.createGain();gain.gain.value=+$('voice').value/100;voice.connect(gain);const limiter=offline.createDynamicsCompressor();limiter.threshold.value=-3;limiter.ratio.value=20;gain.connect(limiter);limiter.connect(offline.destination);voice.start();const file=$('music').files[0];let musicData=null;if(studio.topic)musicData=await loadNewsTrack();else if(file){if(file.size>30*1024*1024)throw Error('Musikdatei bitte unter 30 MB wählen.');musicData=await file.arrayBuffer();}if(musicData){const source=offline.createBufferSource();source.buffer=await ctx.decodeAudioData(musicData);source.loop=true;const musicGain=offline.createGain();const level=+$('bed').value/100;musicGain.gain.setValueAtTime(0,0);musicGain.gain.linearRampToValueAtTime(level,Math.min(1,speech.duration/4));musicGain.gain.setValueAtTime(level,Math.max(0,speech.duration-1));musicGain.gain.linearRampToValueAtTime(0,speech.duration);source.connect(musicGain);musicGain.connect(offline.destination);source.start();}const rendered=await offline.startRendering();const samples=rendered.getChannelData(0),encoder=new lamejs.Mp3Encoder(1,rate,128),parts=[];for(let offset=0;offset<samples.length;offset+=1152){const block=samples.subarray(offset,offset+1152),pcm=new Int16Array(block.length);for(let i=0;i<block.length;i++)pcm[i]=Math.max(-1,Math.min(1,block[i]))*32767;const bytes=encoder.encodeBuffer(pcm);if(bytes.length)parts.push(new Uint8Array(bytes));if(offset%(1152*100)===0)await new Promise(r=>setTimeout(r,0));}parts.push(new Uint8Array(encoder.flush()));mp3=new Blob(parts,{type:'audio/mpeg'});key=crypto.randomUUID();if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(mp3);mp3Filename=studio.topic?newsFilename():`HockeyRadio-${studioKey}.mp3`;$('audio').src=url;$('download').href=url;$('download').download=mp3Filename;$('preview').hidden=false;say('MP3 bereit. Bitte anhören, dann senden.');}catch(e){say('MP3 konnte nicht erstellt werden. '+e.message);}finally{await ctx?.close();lock(false);}};
$('send').onclick=async()=>{if(!mp3||busy)return;lock(true);say('Beitrag wird gesendet …');try{const content=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(mp3);});const response=await fetch('/api/news',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studio:studioKey,topic:$('topic').value,newsFormat:studio.topic?selectedNewsFormat():'',filename:mp3Filename,details:$('details').value.trim(),content,key})});const result=await response.json();if(!response.ok)throw Error(result.error||'Versand fehlgeschlagen.');say(result.destination==='drive'?'✓ Aufnahme an die automatische Drive-Ablage übergeben.':'✓ Erfolgreich an den Maildienst für info@hockey-radio.com übergeben.');mp3=null;}catch(e){say(e.message+' Die MP3 bleibt zum Herunterladen und erneuten Senden erhalten.');}finally{lock(false);}};
window.addEventListener('beforeunload',e=>{if(raw){e.preventDefault();e.returnValue='';}});
