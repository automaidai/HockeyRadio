'use strict';
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Nur POST erlaubt.'});}
 const origin=req.headers.origin;
 if(!origin||!['https:','http:'].includes((()=>{try{return new URL(origin).protocol;}catch{return '';}})())||new URL(origin).host!==req.headers.host)return res.status(403).json({error:'Ungültige Anfrage.'});
 let body=req.body;try{if(typeof body==='string')body=JSON.parse(body);}catch{return res.status(400).json({error:'Ungültige Daten.'});}
 const {studio='news',topic,newsFormat,filename,details='',content,key}=body||{};
 const studios={news:'Eishockey NEWS',ergebnisse:'Ergebnisse',spielankuendigungen:'Spielankündigungen',ergebnisticker:'Ergebnisticker',stadionreporter:'Stadion Reporter'};
 const newsFormats={weekend:'Berichte vom Wochenende',midweek:'News ab Mittwoch'};
 const filenamePattern=/^\d{6}_(Bericht_Wochenende|News)_(DEL2|Oberliga|Bayernliga)\.mp3$/;
 const expectedFormatPart=newsFormat==='weekend'?'_Bericht_Wochenende_':'_News_';
 if(!Object.hasOwn(studios,studio)||(studio==='news'&&(!['DEL2','Oberliga','Bayernliga'].includes(topic)||!Object.hasOwn(newsFormats,newsFormat)||typeof filename!=='string'||!filenamePattern.test(filename)||!filename.includes(expectedFormatPart)||!filename.endsWith(`_${topic}.mp3`)))||typeof details!=='string'||details.length>100||typeof content!=='string'||content.length>3900000||!/^[A-Za-z0-9+/]+={0,2}$/.test(content)||!/^[-a-f0-9]{36}$/.test(key||''))return res.status(400).json({error:'Ungültige oder zu große Aufnahme.'});
 const audio=Buffer.from(content,'base64');if(audio.length<100||!(audio.subarray(0,3).toString()==='ID3'||(audio[0]===255&&(audio[1]&224)===224)))return res.status(400).json({error:'Bitte eine MP3 senden.'});
 const date=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Berlin'});
 const topicLabel=studio==='news'?` · ${newsFormats[newsFormat]} · ${topic}`:'';
 const detailLine=details.trim()?`Zusätzliche Angabe: ${details.trim()}\n`:'';
 const safeName=studio.replace(/[^a-z0-9-]/gi,'-');
 const attachmentName=studio==='news'?filename:`HockeyRadio-${safeName}-${date}.mp3`;
 const hasMakeConfig=Boolean(process.env.NEWS_MAKE_WEBHOOK_URL||process.env.NEWS_WEBHOOK_API_KEY);
 if(hasMakeConfig){
  if(!process.env.NEWS_MAKE_WEBHOOK_URL||!process.env.NEWS_WEBHOOK_API_KEY)return res.status(503).json({error:'Die automatische Ablage ist noch nicht vollständig eingerichtet. Bitte MP3 herunterladen.'});
  try{
   const response=await fetch(process.env.NEWS_MAKE_WEBHOOK_URL,{method:'POST',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json','x-make-apikey':process.env.NEWS_WEBHOOK_API_KEY},body:JSON.stringify({studio,topic,newsFormat,filename:attachmentName,details:details.trim(),content,key})});
   if(!response.ok)throw Error('webhook');
   return res.status(200).json({ok:true,destination:'drive'});
  }catch{return res.status(502).json({error:'Die automatische Ablage ist momentan nicht erreichbar. Bitte MP3 herunterladen und später erneut senden.'});}
 }
 if(!process.env.RESEND_API_KEY||!process.env.NEWS_MAIL_FROM)return res.status(503).json({error:'Die automatische Ablage ist noch nicht eingerichtet. Bitte MP3 herunterladen.'});
 try{const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`${studio}-${newsFormat||'none'}-${key}`},body:JSON.stringify({from:process.env.NEWS_MAIL_FROM,to:['info@hockey-radio.com'],subject:`${studios[studio]}${topicLabel} – ${date}`,text:`Neuer gesprochener Beitrag aus dem Studio „${studios[studio]}“.${studio==='news'?` Format: ${newsFormats[newsFormat]}. Bereich: ${topic}.`:''}\n${detailLine}Datum: ${date}. Die MP3 befindet sich im Anhang.`,attachments:[{filename:attachmentName,content}]})});if(!response.ok)throw Error('provider');return res.status(200).json({ok:true,destination:'email'});}catch{return res.status(502).json({error:'Der Maildienst ist momentan nicht erreichbar. Bitte erneut versuchen.'});}
};
