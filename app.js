(function(){
'use strict';
var $=function(i){return document.getElementById(i)},file=null,MAX=40*1048576;
function say(t,err){$('m1').textContent=t;$('m1').className='msg'+(err?' err':'')}
function toLocal(d){d=new Date(d);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)}
function ready(){$('make').disabled=!(file&&$('pw').value.length>=6)}
function ascii(s){return s.replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/…/g,'...').replace(/[^\x20-\x7E]/g,'?')}
function rnd(n){return crypto.getRandomValues(new Uint8Array(n))}

$('exp').value=toLocal(Date.now()+7*864e5);
document.querySelectorAll('[data-d]').forEach(function(b){b.onclick=function(){var d=+b.dataset.d;$('exp').value=d?toLocal(Date.now()+d*864e5):''}});
$('f1').onchange=function(){var f=this.files[0];if(!f)return;
 if(f.size>MAX){file=null;$('d1').className='drop';$('d1').textContent='Tap to choose a PDF (or a JPG/PNG image)';say('That file is over 40 MB. Please use a smaller one.',true);ready();return}
 file=f;$('d1').className='drop has';$('d1').textContent=f.name+' ('+(f.size/1048576).toFixed(2)+' MB)';say('');ready()};
$('pw').oninput=ready;
$('gen').onclick=function(){var c='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789',s='';rnd(14).forEach(function(x){s+=c[x%c.length]});$('pw').value=s.slice(0,4)+'-'+s.slice(4,9)+'-'+s.slice(9);ready()};

function download(blob,name){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},10000)}
function offer(bytes,name){
 var blob=new Blob([bytes],{type:'application/pdf'}),o=$('o1'),f;
 o.innerHTML='<p><strong>Your protected PDF is ready.</strong></p><p class="hint">Send it by WhatsApp or email. Whoever opens it is asked for the password first.</p>';
 try{f=new File([blob],name,{type:'application/pdf'})}catch(e){f=null}
 if(f&&navigator.canShare&&navigator.canShare({files:[f]})){
  var s=document.createElement('button');s.className='go';s.textContent='Share or save to Files';
  s.onclick=async function(){try{await navigator.share({files:[f],title:name})}catch(e){if(e.name!=='AbortError')download(blob,name)}};o.appendChild(s)}
 var d=document.createElement('button');d.className='go'+(o.querySelector('button')?' alt':'');d.textContent='Download PDF';d.onclick=function(){download(blob,name)};o.appendChild(d);
 o.hidden=false}

$('make').onclick=async function(){
 $('make').disabled=true;$('o1').hidden=true;say('Working…');
 try{
  var L=window.PDFLib;if(!L)throw new Error('PDF tools did not load. Reload the page.');
  var bytes=new Uint8Array(await file.arrayBuffer()),isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name),doc;
  if(isPdf){try{doc=await L.PDFDocument.load(bytes)}catch(e){throw new Error('This PDF already has a password or can’t be read. Remove its password and try again.')}}
  else{doc=await L.PDFDocument.create();var im=(file.type==='image/png'||/\.png$/i.test(file.name))?await doc.embedPng(bytes):await doc.embedJpg(bytes),k=Math.min(1,595/im.width);
   var pg=doc.addPage([im.width*k+40,im.height*k+40]);pg.drawImage(im,{x:20,y:20,width:im.width*k,height:im.height*k})}
  var font=await doc.embedFont(L.StandardFonts.HelveticaBold),wm=ascii($('wm').value.trim()),exp=$('exp').value?new Date($('exp').value):null,
  foot=exp?'Valid until '+ascii(exp.toLocaleString([],{dateStyle:'medium',timeStyle:'short'})):'';
  say('Adding watermark…');
  doc.getPages().forEach(function(p){var s=p.getSize();
   if(wm){var sz=Math.max(14,Math.min(s.width,s.height)/16),tw=font.widthOfTextAtSize(wm,sz),c=Math.SQRT1_2;
    [-0.28,0,0.28].forEach(function(o){p.drawText(wm,{x:s.width/2-tw/2*c-o*s.height*0.5,y:s.height/2-tw/2*c+o*s.height*0.5,size:sz,font:font,color:L.rgb(.45,.45,.45),opacity:.22,rotate:L.degrees(45)})})}
   if(foot)p.drawText(foot,{x:24,y:12,size:9,font:font,color:L.rgb(.55,.1,.1)})});
  say('Encrypting…');
  var owner=Array.from(rnd(18)).map(function(x){return x.toString(16).padStart(2,'0')}).join(''),lock=$('lock').checked;
  await doc.encrypt({userPassword:$('pw').value,ownerPassword:owner,permissions:{printing:'highResolution',copying:!lock,modifying:!lock,annotating:!lock,fillingForms:true,contentAccessibility:true,documentAssembly:!lock}});
  offer(await doc.save(),file.name.replace(/\.[^.]+$/,'')+' (protected).pdf');say('');
 }catch(e){say(e.message||'Something went wrong.',true)}
 ready()};

if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});
})();
