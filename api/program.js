'use strict';

// Only the published Wochenplan is read. No Google account credentials are used.
const SOURCE = process.env.PROGRAM_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7ereVZ7nOj7TwGAdWWKkL6DJ2J53h5e0C9KSKnNwTOn7MH2yfpriDQNYSygL_rnejcMKoX6txYWJX/pub?gid=1443611678&single=true&output=csv';
const DAYS = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
let cached;

function parseCSV(text) {
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"') {
      if(quoted&&text[i+1]==='"'){field+='"';i++;}
      else if(!quoted&&field!=='') throw new Error('Invalid CSV');
      else quoted=!quoted;
    } else if(c===','&&!quoted){row.push(field);field='';}
    else if((c==='\n'||c==='\r')&&!quoted){
      if(c==='\r'&&text[i+1]==='\n')i++;
      row.push(field);rows.push(row);row=[];field='';
    } else field+=c;
  }
  if(quoted)throw new Error('Incomplete CSV');
  if(field||row.length){row.push(field);rows.push(row);}
  return rows;
}

function parseProgram(text) {
  if(text.length>200000)throw new Error('Programme too large');
  const rows=parseCSV(text.replace(/^\uFEFF/,''));
  const header=rows.findIndex(r=>r[0]?.trim()==='Tag'&&r[5]?.trim()==='Sendung'&&r[6]?.trim()==='Beschreibung');
  if(header<0)throw new Error('Programme headers missing');
  const week=DAYS.map(()=>[]);
  for(const r of rows.slice(header+1)) {
    if(r.every(v=>!v.trim()))continue;
    const day=DAYS.findIndex(d=>d.toLowerCase()===r[0]?.trim().toLowerCase());
    if(day<0)throw new Error('Unknown weekday');
    const state=(r[7]||'').trim();
    if(/^(inaktiv|ausgeblendet|pausiert)$/i.test(state))continue;
    const title=(r[5]||'').trim(),text=(r[6]||'').trim();
    const order=Number(r[1]),hourly=/stündlich|stuendlich|jede stunde/i.test(r[2]||'');
    const start=(r[3]||'').trim(),end=(r[4]||'').trim();
    const validTime=t=>/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(t)||t==='24:00';
    if(!title||title.length>120||text.length>1000||!Number.isFinite(order)||order<1||
      (!hourly&&(!validTime(start)||!validTime(end))))throw new Error('Invalid programme row');
    if(week[day].length>=60)throw new Error('Too many programmes');
    week[day].push({order,title,text,hourly,time:hourly?'JEDE STUNDE':`${start} – ${end}`,draft:/entwurf/i.test(state)});
  }
  if(!week.some(d=>d.length))throw new Error('Empty programme');
  week.forEach(day=>day.sort((a,b)=>a.order-b.order));
  return week;
}

async function handler(req,res) {
  if(req.method!=='GET'&&req.method!=='HEAD')return res.status(405).end();
  try {
    if(!cached||Date.now()-cached.at>60000) {
      if(!SOURCE)throw new Error('Programme source not configured');
      const response=await fetch(SOURCE,{signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw new Error('Programme source unavailable');
      cached={week:parseProgram(await response.text()),at:Date.now()};
    }
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=60, stale-while-revalidate=60');
    return res.status(200).json({week:cached.week,updatedAt:new Date(cached.at).toISOString()});
  } catch {
    // Preserve the last valid data during temporary Google errors.
    if(cached&&Date.now()-cached.at<86400000) {
      res.setHeader('Cache-Control','no-store');
      return res.status(200).json({week:cached.week,updatedAt:new Date(cached.at).toISOString(),stale:true});
    }
    res.setHeader('Cache-Control','no-store');
    return res.status(503).json({error:'Programm vorübergehend nicht abrufbar.'});
  }
}
module.exports=handler;
module.exports.parseCSV=parseCSV;
module.exports.parseProgram=parseProgram;
