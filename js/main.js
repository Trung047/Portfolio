/* Typing */
const ph=['Lập trình C++ & Python','Phát triển Web HTML/CSS/JS','Sinh viên CNTT – UTH'];let pi=0,ci=0,del=false;const te=document.getElementById('typed');
(function t(){const w=ph[pi];te.textContent=w.slice(0,ci);if(!del&&ci===w.length){del=true;return setTimeout(t,1600)}if(del&&ci===0){del=false;pi=(pi+1)%ph.length}ci+=del?-1:1;setTimeout(t,del?35:75)})();

/* Skills */
const sk=[['HTML / CSS / UI Design',85],['JavaScript / Logic',75],['C++ / Python',70],['Thể thao & Làm việc nhóm',95]];
document.getElementById('skills').innerHTML=sk.map(([n,v])=>`<div><div class="flex justify-between mb-1"><span class="text-sm font-medium text-slate-300">${n}</span><span class="text-sm font-medium text-neon">${v}%</span></div><div class="w-full bg-white/10 rounded-full h-2"><div class="bg-neon skill-fill h-2 rounded-full" style="width:${v}%"></div></div></div>`).join('');

/* Reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('active')}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));

/* Mobile menu */
const mm=document.getElementById('mmenu');document.getElementById('mbtn').onclick=()=>mm.classList.toggle('hidden');
mm.querySelectorAll('a').forEach(a=>a.onclick=()=>mm.classList.add('hidden'));

/* Nav + navbot mascot */
const links=[...document.querySelectorAll('.navlink')],navbot=document.getElementById('navbot'),pill=document.getElementById('pill');
function moveBot(l){navbot.style.transform=`translateX(${l.offsetLeft+l.offsetWidth/2-29}px)`}
function setOn(id){links.forEach(l=>{const on=l.getAttribute('href')==='#'+id;l.classList.toggle('on',on);if(on)moveBot(l)})}
const secs=['home','about','projects','contact'].map(i=>document.getElementById(i));
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)setOn(e.target.id)}),{rootMargin:'-45% 0px -45% 0px'});
secs.forEach(s=>so.observe(s));
addEventListener('load',()=>moveBot(links[0]));addEventListener('resize',()=>moveBot(document.querySelector('.navlink.on')));
document.getElementById('mbtn').addEventListener('click',()=>{});
if(getComputedStyle(pill).display==='none')navbot.style.display='none';
