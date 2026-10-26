(function(){
"use strict";
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
// Tema
var root=document.documentElement, KEY="gl-tema";
function setTheme(t){ if(t) root.setAttribute("data-theme",t); else root.removeAttribute("data-theme"); }
try{ setTheme(localStorage.getItem(KEY)); }catch(e){}
$("#theme").addEventListener("click",function(){
  var cur=root.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  var nxt=cur==="dark"?"light":"dark"; setTheme(nxt); try{localStorage.setItem(KEY,nxt)}catch(e){}
});
// Flikar
function tab(name){
  document.querySelectorAll("nav button").forEach(function(b){b.setAttribute("aria-selected",b.dataset.tab===name?"true":"false")});
  ["sok","ut","in","info"].forEach(function(t){$("#tab-"+t).classList.toggle("hide",t!==name)});
  window.scrollTo(0,0);
}
document.querySelectorAll("nav button").forEach(function(b){b.addEventListener("click",function(){tab(b.dataset.tab)})});
// Sök
function norm(s){return String(s).toUpperCase().replace(/\s+/g,"").replace(/^M/,"").replace(/[X*×]/g,"X").replace(/\./g,",")}
function find(q){
  var s=norm(q); if(!s) return [];
  var exact=DATA.filter(function(r){return norm(r.n)===s});
  if(exact.length) return exact;
  var byD=DATA.filter(function(r){return String(r.d)===s});
  if(byD.length) return byD;
  return DATA.filter(function(r){return norm(r.n).indexOf(s)===0});
}
function kClass(t){return /^✓/.test(t)&&!/1 källa/.test(t)?"k":"k w"}
function card(r){
  var val=r.val==="fin"?"fingänga":(r.val==="1:a"?"ISO 261 första val":"ISO 261 andra val");
  return '<div class="card"><h2>'+esc(r.n)+'</h2><div class="sub">Stigning P = <b>'+esc(r.p)+' mm</b> · '+val+'</div>'+
  '<div class="grid">'+
  '<div class="blk"><h3>Utvändig 6g (skruv)</h3><div class="kv">'+
   '<span></span><span class="h" style="text-align:right">max</span><span class="h" style="text-align:right">min</span>'+
   '<span class="l">d</span><span class="v">'+r.dmax+'</span><span class="v">'+r.dmin+'</span>'+
   '<span class="l">d2</span><span class="v">'+r.d2max+'</span><span class="v">'+r.d2min+'</span>'+
   '<span class="l">d3 grundmått</span><span class="v">'+r.d3+'</span><span></span>'+
  '</div><div class="'+kClass(r.kU)+'">Kontroll: '+esc(r.kU)+'</div></div>'+
  '<div class="blk"><h3>Invändig 6H (mutter/hål)</h3><div class="kv">'+
   '<span></span><span class="h" style="text-align:right">min</span><span class="h" style="text-align:right">max</span>'+
   '<span class="l">D2</span><span class="v">'+r.D2min+'</span><span class="v">'+r.D2max+'</span>'+
   '<span class="l">D1</span><span class="v">'+r.D1min+'</span><span class="v">'+r.D1max+'</span>'+
   '<span class="l">Borr Ø</span><span class="v big">'+r.drill+'</span><span></span>'+
  '</div><div class="'+kClass(r.kI)+'">Kontroll: '+esc(r.kI)+'</div></div>'+
  '</div></div>';
}
function show(q){
  var res=find(q);
  $("#cards").innerHTML=res.length?res.map(card).join(""):(norm(q)?'<p class="note">Ingen träff. Finns: M3–M90 grovgänga samt M25×1,5 och M25×2.</p>':"");
  document.querySelectorAll("#chips button").forEach(function(b){b.classList.toggle("sel",res.length>0&&res.some(function(r){return r.n===b.dataset.n}))});
}
var chips=$("#chips");
DATA.forEach(function(r){var b=document.createElement("button");b.textContent=r.n;b.dataset.n=r.n;if(r.n.length>4)b.className="wide";b.addEventListener("click",function(){$("#q").value=r.n;show(r.n);window.scrollTo({top:0,behavior:"smooth"})});chips.appendChild(b)});
$("#q").addEventListener("input",function(e){show(e.target.value)});
// Tabeller
function table(id,head,cols){
  var h="<thead><tr>"+head.map(function(x){return"<th>"+x+"</th>"}).join("")+"</tr></thead><tbody>";
  DATA.forEach(function(r){h+='<tr class="click" data-n="'+esc(r.n)+'">'+cols.map(function(c){return"<td>"+esc(r[c])+"</td>"}).join("")+"</tr>"});
  $(id).innerHTML=h+"</tbody>";
  $(id).addEventListener("click",function(e){var tr=e.target.closest("tr[data-n]");if(!tr)return;$("#q").value=tr.dataset.n;show(tr.dataset.n);tab("sok")});
}
table("#t-ut",["Gänga","P","Val","d max","d min","d2 max","d2 min","d3 grundm.","Kontroll"],["n","p","val","dmax","dmin","d2max","d2min","d3","kU"]);
table("#t-in",["Gänga","P","Val","D2 min","D2 max","D1 min","D1 max","Borr Ø","Kontroll"],["n","p","val","D2min","D2max","D1min","D1max","drill","kI"]);
// Service worker (offline)
var off=$("#offline");
if("serviceWorker" in navigator && location.protocol!=="file:"){
  navigator.serviceWorker.register("sw.js").then(function(){off.textContent="Offline-läge aktivt: appen fungerar utan nät efter första öppning.";window.__swRegistered=true})
  .catch(function(e){off.textContent="Offline-läge kunde inte aktiveras ("+e.message+").";});
}else{off.textContent="Fristående version: fungerar offline som sparad fil.";}
window.__gl={find:find,DATA:DATA};
})();
