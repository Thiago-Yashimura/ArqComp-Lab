/* ArqComp Lab: cruzadinha + jogos de arrastar. HTML, CSS e JS puros. */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const norm=s=>s.normalize('NFD').replace(/[^a-zA-Z]/g,'').toUpperCase();
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const badge=(id,on)=>$('#'+id).classList.toggle('on',on);
const bump=el=>{el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')};
function confetti(){const col=['#f0185c','#0660c6','#3e7f87','#f9b233','#1f2a44'];
  for(let i=0;i<110;i++){const s=document.createElement('i');s.className='cf';
    s.style.cssText=`left:${Math.random()*100}vw;background:${col[i%5]};border-radius:${i%3?'2px':'50%'};width:${6+Math.random()*8}px;animation-delay:${Math.random()*.6}s;--x:${(Math.random()-.5)*340}px`;
    document.body.append(s);setTimeout(()=>s.remove(),3200)}}

$$('.tab').forEach(b=>b.onclick=()=>{
  $$('.tab').forEach(x=>x.classList.toggle('on',x===b));
  $$('.pane').forEach(p=>p.hidden=p.id!==b.dataset.t)});

/* ---------- CRUZADINHA ---------- */
// d: H = horizontal, V = vertical; r/c = linha/coluna da primeira letra
const WORDS=[
 {a:'CPU',r:0,c:12,d:'V',t:'Cérebro do computador: busca, decodifica e executa as instruções dos programas.'},
 {a:'REGISTRADORES',r:1,c:8,d:'V',t:'Minúsculas e velocíssimas, guardam bytes dentro da CPU, no topo da hierarquia.'},
 {a:'QUADCORE',r:2,c:2,d:'V',t:'Processador com quatro núcleos de execução trabalhando em paralelo.'},
 {a:'ADDRESSBUS',r:2,c:4,d:'H',t:'Via unidirecional pela qual a CPU indica a posição de memória desejada.'},
 {a:'DMA',r:2,c:6,d:'V',t:'Recurso que deixa periféricos transferirem dados com a RAM sem ocupar a CPU.'},
 {a:'EEPROM',r:3,c:15,d:'V',t:'Memória permanente regravável com eletricidade, alterando um byte por vez.'},
 {a:'FLASH',r:4,c:0,d:'H',t:'Memória permanente regravada em blocos, presente em pen drives e SSDs.'},
 {a:'UC',r:5,c:5,d:'V',t:'Parte da CPU que comanda e coordena o que cada componente faz.'},
 {a:'ROM',r:5,c:10,d:'V',t:'Guarda o programa básico de inicialização, gravado na fábrica; não se perde ao desligar.'},
 {a:'RAM',r:5,c:12,d:'V',t:'Memória principal e volátil, onde ficam os aplicativos em uso.'},
 {a:'MICROCONTROLADOR',r:6,c:0,d:'H',t:'Chip único com processador, memória e portas de entrada e saída, usado em sistemas embarcados.'},
 {a:'CACHE',r:8,c:11,d:'V',t:'Memória rápida, de KB a MB, entre a CPU e a RAM.'},
 {a:'MEMORIADEMASSA',r:9,c:1,d:'H',t:'Nível mais lento e espaçoso, de centenas de GB a TB, como SSD e HD.'},
 {a:'DUALCORE',r:11,c:2,d:'H',t:'Processador com dois núcleos de execução trabalhando em paralelo.'},
 {a:'ULA',r:11,c:3,d:'V',t:'Circuito da CPU que faz somas, subtrações e comparações lógicas.'},
 {a:'DATABUS',r:13,c:2,d:'H',t:'Via bidirecional que transporta a informação em si entre CPU, memória e periféricos.'}
];
const R=14,C=16,cells={},starts={};
let dir='H',act=0,n=0,wasFocused=false;

WORDS.forEach((w,i)=>{w.keys=[];
  for(let k=0;k<w.a.length;k++){
    const r=w.r+(w.d==='V'?k:0),c=w.c+(w.d==='H'?k:0),key=r+','+c;
    w.keys.push(key);(cells[key]=cells[key]||{r,c,w:{}}).w[w.d]=i}});
for(let r=0;r<R;r++)for(let c=0;c<C;c++){
  const ws=WORDS.filter(w=>w.r===r&&w.c===c);
  if(ws.length){starts[r+','+c]=++n;ws.forEach(w=>w.n=n)}}

const grid=$('#grid');
grid.style.gridTemplateColumns=`repeat(${C},var(--cs))`;
for(let r=0;r<R;r++)for(let c=0;c<C;c++){
  const k=r+','+c,cell=cells[k],d=document.createElement('div');
  if(cell){
    d.className='cell';
    d.innerHTML=(starts[k]?`<span class="n">${starts[k]}</span>`:'')+
      `<input maxlength="2" autocomplete="off" autocapitalize="characters" spellcheck="false" data-k="${k}" aria-label="linha ${r+1}, coluna ${c+1}">`;
    cell.el=d;cell.in=d.lastChild}
  grid.append(d)}

['H','V'].forEach(d=>{
  WORDS.map((w,i)=>[w,i]).filter(x=>x[0].d===d).sort((a,b)=>a[0].n-b[0].n).forEach(([w,i])=>{
    const li=document.createElement('li');
    li.innerHTML=`<b>${w.n}</b><span>${w.t}</span>`;
    li.onclick=()=>{dir=d;setActive(i);(cells[w.keys.find(k=>!cells[k].in.value)||w.keys[0]]).in.focus()};
    w.li=li;$('#cl-'+d).append(li)})});

function setActive(i){
  act=i;const w=WORDS[i];
  $$('.cell.hl').forEach(x=>x.classList.remove('hl'));
  w.keys.forEach(k=>cells[k].el.classList.add('hl'));
  $$('ol li.on').forEach(x=>x.classList.remove('on'));w.li.classList.add('on');
  $('#cur').textContent=`${w.n} ${w.d==='H'?'Horizontal':'Vertical'}: ${w.t}`}

grid.addEventListener('pointerdown',e=>{wasFocused=document.activeElement===e.target});
grid.addEventListener('click',e=>{ // segundo toque na mesma casa troca a direção
  const c=cells[e.target.dataset.k];
  if(c&&wasFocused&&c.w.H!==undefined&&c.w.V!==undefined){dir=dir==='H'?'V':'H';setActive(c.w[dir])}});
grid.addEventListener('focusin',e=>{
  const c=cells[e.target.dataset.k];if(!c)return;
  const i=c.w[dir]??c.w[dir==='H'?'V':'H'];dir=WORDS[i].d;setActive(i);e.target.select()});
grid.addEventListener('input',e=>{
  const i=e.target,c=cells[i.dataset.k];
  i.value=norm(i.value).slice(-1);c.el.classList.remove('ok','err');
  if(i.value){c.el.classList.remove('typed');void c.el.offsetWidth;c.el.classList.add('typed')}
  if(i.value){const w=WORDS[act],p=w.keys.indexOf(i.dataset.k);
    if(p>=0&&p<w.keys.length-1)cells[w.keys[p+1]].in.focus()}});
grid.addEventListener('keydown',e=>{
  const i=e.target,c=cells[i.dataset.k];if(!c)return;
  const A={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[e.key];
  if(A){e.preventDefault();dir=A[0]?'V':'H';
    let r=c.r+A[0],q=c.c+A[1];
    while(r>=0&&q>=0&&r<R&&q<C){const t=cells[r+','+q];if(t){t.in.focus();return}r+=A[0];q+=A[1]}}
  else if(e.key==='Backspace'&&!i.value){
    e.preventDefault();const w=WORDS[act],p=w.keys.indexOf(i.dataset.k);
    if(p>0){const t=cells[w.keys[p-1]];t.in.value='';t.el.classList.remove('ok','err');t.in.focus()}}});

$('#check').onclick=()=>{
  $$('.cell').forEach(x=>x.classList.remove('ok','err'));void grid.offsetWidth;
  const res=WORDS.map(w=>w.keys.map(k=>cells[k].in.value).join('')===w.a);
  let ok=0;
  res.forEach((r,i)=>{const w=WORDS[i];
    w.li.classList.toggle('ok',r);w.li.classList.toggle('err',!r);
    if(r){ok++;w.keys.forEach((k,j)=>{const e=cells[k].el;e.style.setProperty('--d',j*70+'ms');e.classList.add('ok')})}});
  res.forEach((r,i)=>{if(!r)WORDS[i].keys.forEach(k=>{
    const c=cells[k];if(c.in.value&&!c.el.classList.contains('ok'))c.el.classList.add('err')})});
  $('#score').textContent=`${ok} de ${WORDS.length} palavras`;bump($('#score'));
  badge('p-cruz',ok===WORDS.length);
  if(ok===WORDS.length)confetti()};

$('#reset').onclick=()=>{
  Object.values(cells).forEach(c=>{c.in.value='';c.el.classList.remove('ok','err')});
  $$('ol li').forEach(li=>li.classList.remove('ok','err'));
  $('#score').textContent=`0 de ${WORDS.length} palavras`;badge('p-cruz',false);setActive(act)};
$('#score').textContent=`0 de ${WORDS.length} palavras`;setActive(0);

/* ---------- ARRASTAR E SOLTAR (mouse, toque e toque-e-toque) ---------- */
function dragInit(root,drop){
  root.addEventListener('pointerdown',e=>{
    const chip=e.target.closest('.chip');if(!chip||chip.classList.contains('lock'))return;
    e.preventDefault();
    const b=chip.getBoundingClientRect(),dx=e.clientX-b.left,dy=e.clientY-b.top,x0=e.clientX,y0=e.clientY;
    let g=null,over=null;
    const at=(x,y)=>{const s=document.elementFromPoint(x,y);return s&&s.closest('.slot')};
    const mv=ev=>{
      if(!g&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>6){
        g=chip.cloneNode(true);g.classList.add('ghost');g.style.width=b.width+'px';
        document.body.append(g);chip.classList.add('lifted')}
      if(g){g.style.transform=`translate(${ev.clientX-dx}px,${ev.clientY-dy}px) rotate(3deg)`;
        const s=at(ev.clientX,ev.clientY);
        if(s!==over){over&&over.classList.remove('over');over=s;over&&over.classList.add('over')}}};
    const up=ev=>{
      removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);
      over&&over.classList.remove('over');
      if(g){g.remove();chip.classList.remove('lifted');const s=at(ev.clientX,ev.clientY);if(s)drop(chip,s)}
      else{const was=chip.classList.contains('sel');
        $$('.chip.sel').forEach(c=>c.classList.remove('sel'));chip.classList.toggle('sel',!was)}};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)});
  root.addEventListener('click',e=>{
    const s=e.target.closest('.slot'),c=root.querySelector('.chip.sel');
    if(s&&c&&!e.target.closest('.chip'))drop(c,s)})}

function game(id,badgeId,items,board,msg){
  const el=$('#'+id),bank=el.querySelector('.bank'),brd=el.querySelector('.board'),st=el.querySelector('.stat');
  let hit,miss;
  const show=()=>{st.classList.remove('win');bump(st);st.textContent=`${hit} de ${items.length} no lugar certo · ${miss} ${miss===1?'erro':'erros'}`};
  const reset=()=>{
    hit=miss=0;brd.innerHTML=board();bank.innerHTML='';
    shuffle(items).forEach((i,n)=>{const c=document.createElement('div');c.style.setProperty('--i',n);c.className='chip';c.dataset.k=i.k;c.textContent=i.t;bank.append(c)});
    badge(badgeId,false);show()};
  dragInit(el,(chip,slot)=>{
    el.querySelectorAll('.chip.sel').forEach(c=>c.classList.remove('sel'));
    if(slot.querySelector('.chip'))return;
    if(chip.dataset.k===slot.dataset.k){
      slot.append(chip);chip.classList.add('lock');slot.classList.add('ok');
      slot.closest('.tier')?.classList.add('ok');hit++;show();
      if(hit===items.length){st.textContent=`${msg} ${miss?`Erros: ${miss}.`:'Sem nenhum erro!'}`;st.classList.add('win');badge(badgeId,true);confetti()}
    }else{miss++;slot.classList.add('bad');setTimeout(()=>slot.classList.remove('bad'),450);show()}});
  el.querySelector('.reset').onclick=reset;reset()}

// Jogo 1: pirâmide (do topo, mais rápida, até a base, mais lenta)
const PYR=[
 {k:'REG',t:'Registradores',cap:'bytes',c:'#f0185c',w:52},
 {k:'CAC',t:'Cache',cap:'KB a MB',c:'#0660c6',w:66},
 {k:'RAM',t:'RAM (memória principal)',cap:'GB',c:'#3e7f87',w:82},
 {k:'MAS',t:'Armazenamento (SSD, HD)',cap:'centenas de GB a TB',c:'#1f2a44',w:100}];
game('g1','p-pir',PYR,()=>
  `<div class="axis"><span>mais lenta, mais espaço</span><span>mais rápida e cara ▲</span></div><div class="tiers">`+
  PYR.map((i,n)=>`<div class="tier" style="--c:${i.c};--i:${n}"><div class="tc"><div class="slot" style="--w:${i.w}%" data-k="${i.k}"><span class="hint">solte aqui</span></div></div><span class="cap">${i.cap}</span></div>`).join('')+`</div>`,
  'Pirâmide completa!');

// Jogo 2: CPU, memória e barramentos
const PARTS=[
 {g:'CPU',k:'UC',t:'UC',h:'Comanda e coordena o que cada parte faz'},
 {g:'CPU',k:'ULA',t:'ULA',h:'Faz as contas e as comparações lógicas'},
 {g:'CPU',k:'REG',t:'Registradores',h:'Guardam dados dentro da CPU; os mais rápidos'},
 {g:'Memória',k:'CAC',t:'Cache',h:'Pequena e veloz; guarda o que a CPU mais usa'},
 {g:'Memória',k:'RAM',t:'RAM',h:'Principal e volátil; guarda o que está em uso'},
 {g:'Memória',k:'ROM',t:'ROM',h:'Permanente e gravada de fábrica; guarda o básico para ligar'},
 {g:'Memória',k:'MAS',t:'Memória de massa',h:'Grande, lenta e permanente: SSD e HD'},
 {g:'Barramentos',k:'ADD',t:'Address bus',h:'Leva a posição de memória que a CPU quer acessar'},
 {g:'Barramentos',k:'DAT',t:'Data bus',h:'Carrega a informação em si, nos dois sentidos'}];
game('g2','p-cpu',PARTS,()=>
  ['CPU','Memória','Barramentos'].map((g,n)=>`<div class="panel" style="--i:${n}"><h3>${{CPU:'🧠',Memória:'💾',Barramentos:'🔀'}[g]} ${g}</h3>`+
    PARTS.filter(p=>p.g===g).map(p=>`<div class="slot" data-k="${p.k}"><span class="hint">${p.h}</span></div>`).join('')+`</div>`).join(''),
  'Computador montado!');
