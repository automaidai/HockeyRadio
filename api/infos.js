'use strict';
const {parseCSV}=require('./program.js');
// This separate publication contains only five listener-facing columns.
const SOURCE='https://docs.google.com/spreadsheets/d/e/2PACX-1vR7ereVZ7nOj7TwGAdWWKkL6DJ2J53h5e0C9KSKnNwTOn7MH2yfpriDQNYSygL_rnejcMKoX6txYWJX/pub?gid=20261023&single=true&output=csv';
let cached;
function parseDays(text){
  const s=text.toLowerCase().trim();
  if(/^(täglich|taeglich|alle tage|jeden tag|mo\s*[-–]\s*so)$/.test(s))return [0,1,2,3,4,5,6];
  if(/^(werktags|wochentags)$/.test(s))return [0,1,2,3,4];
  if(/^wochenende$/.test(s))return [5,6];
  const aliases={mo:0,montag:0,di:1,dienstag:1,mi:2,mittwoch:2,do:3,donnerstag:3,fr:4,freitag:4,sa:5,samstag:5,so:6,sonntag:6};
  const days=new Set();
  for(const token of s.replace(/\s+bis\s+/g,'-').split(/[,;/]+/)){
    const parts=token.trim().replace(/\./g,'').split(/\s*[-–]\s*/);
    if(parts.length===2&&parts.every(p=>Object.hasOwn(aliases,p))){let d=aliases[parts[0]];for(let n=0;n<7;n++){days.add(d);if(d===aliases[parts[1]])break;d=(d+1)%7;}}
    else for(const p of token.trim().split(/\s+/))if(Object.hasOwn(aliases,p))days.add(aliases[p]);
  }
  return [...days].sort();
}
function parseInfos(text){
  if(text.length>150000)throw Error('Infos too large');
  const rows=parseCSV(text.replace(/^\uFEFF/,''));
  if(rows[0]?.slice(0,5).join('|')!=='Typ|Format|Uhrzeit(en)|Wochentage|Dauer (Sek.)')throw Error('Invalid public infos source');
  const formats=new Map();
  for(const r of rows.slice(1)){
    const [type,titleValue,timeValue='',daysValue='',durationValue='']=r;
    const title=(titleValue||'').trim();if(!title)continue;
    if(title.startsWith('#')||r.some(v=>/^#(ERROR|REF|VALUE|N\/A|DIV)/.test(v))||title.length>120||r.length>5)throw Error('Invalid public infos row');
    const key=title.toLowerCase();if(!formats.has(key))formats.set(key,{title,times:[],days:[],duration:null,slots:[]});
    const format=formats.get(key),days=parseDays(daysValue),duration=Number(durationValue.replace(',','.'));
    const times=timeValue.match(/(?:[01]?\d|2[0-3]):[0-5]\d/g)||[];
    if(type==='Format'){format.times=times;format.days=days;format.duration=Number.isFinite(duration)&&duration>0&&duration<=1800?duration:null;}
    else if(type==='Slot'&&times.length){format.slots.push({time:times[0],days,duration:Number.isFinite(duration)&&duration>0&&duration<=1800?duration:null});}
  }
  if(formats.size>100)throw Error('Too many formats');
  return [...formats.values()].map(format=>({...format,slots:format.slots.map(slot=>({...slot,days:slot.days.length?slot.days:format.days,duration:slot.duration||format.duration}))}));
}
async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD')return res.status(405).end();
  try{
    if(!cached||Date.now()-cached.at>60000){
      const response=await fetch(SOURCE,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Infos unavailable');
      cached={formats:parseInfos(await response.text()),at:Date.now()};
    }
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=60, stale-while-revalidate=60');
    return res.status(200).json({formats:cached.formats});
  }catch{
    res.setHeader('Cache-Control','no-store');
    if(cached&&Date.now()-cached.at<86400000)return res.status(200).json({formats:cached.formats,stale:true});
    return res.status(503).json({error:'Infos vorübergehend nicht abrufbar.'});
  }
}
module.exports=handler;
module.exports.parseInfos=parseInfos;
module.exports.parseDays=parseDays;
