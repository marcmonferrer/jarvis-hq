const defaults={
  command:'https://chatgpt.com/',
  consulting:'https://chatgpt.com/',
  finances:'https://chatgpt.com/',
  ideas:'https://chatgpt.com/',
  learning:'https://chatgpt.com/',
  porra:'https://marcmonferrer.github.io/finalissima-porra/',
  github:'https://github.com/marcmonferrer',
  email:'mailto:marcmonferrer.ai@gmail.com'
};

const labels={
  command:'Centre de comandament',
  consulting:'AI Consulting',
  finances:'Marc & Jarvis | Finances',
  ideas:'Idees & Projectes',
  learning:'Aprenentatge & Cultura',
  porra:'La Porra — Portfolio',
  github:'GitHub de Marc',
  email:'Correu AI Consulting'
};

const areas=[
  {key:'consulting',icon:'🤖',title:'AI Consulting',desc:'Clients, propostes, automatitzacions i oportunitats de negoci.',accent:'#ff477e',tag:'NEGOCI'},
  {key:'finances',icon:'📈',title:'Finances',desc:'Mercats, inversions, estratègia i decisions amb calma.',accent:'#ff8a36',tag:'PATRIMONI'},
  {key:'ideas',icon:'💡',title:'Idees & Projectes',desc:'Apps, experiments, MVPs i brainstorming amb IA.',accent:'#9f62ff',tag:'CREACIÓ'},
  {key:'learning',icon:'📚',title:'Aprenentatge',desc:'Llibres, història, òpera, cultura i noves habilitats.',accent:'#55e6a5',tag:'CULTURA'}
];

const quick=[
  {key:'command',icon:'🏠',sub:'Organització, tasques i vida diària'},
  {key:'porra',icon:'🏆',sub:'Projecte de portfolio publicat'},
  {key:'github',icon:'⌘',sub:'Repositoris i projectes tècnics'},
  {key:'email',icon:'✉️',sub:'marcmonferrer.ai@gmail.com'}
];

let links={...defaults,...JSON.parse(localStorage.getItem('jarvis-hq-links')||'{}')};
const cards=document.getElementById('cards');
const quickBox=document.getElementById('quick');
const dialog=document.getElementById('dialog');
const fields=document.getElementById('fields');
const toast=document.getElementById('toast');
const sidebar=document.getElementById('sidebar');
const menuButton=document.getElementById('menu');
const menuScrim=document.getElementById('menuScrim');
const isAndroid=/Android/i.test(navigator.userAgent);

function render(){
  cards.innerHTML=areas.map(a=>`
    <article class="card" style="--accent:${a.accent}" data-open="${a.key}" tabindex="0">
      <div class="cardicon">${a.icon}</div>
      <h4>${a.title}</h4>
      <p>${a.desc}</p>
      <div class="cardfooter"><span>${a.tag}</span><button class="open" aria-label="Obrir ${a.title}">↗</button></div>
    </article>`).join('');

  quickBox.innerHTML=quick.map(q=>`
    <div class="quickitem" data-open="${q.key}" tabindex="0">
      <div class="quickico">${q.icon}</div>
      <div><strong>${labels[q.key]}</strong><small>${q.sub}</small></div>
      <span class="arrow">›</span>
    </div>`).join('');
}

function buildAndroidChatGPTIntent(url){
  try{
    const parsed=new URL(url);
    if(parsed.protocol!=='https:'||parsed.hostname!=='chatgpt.com')return null;
    const destination=`${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
    const fallback=encodeURIComponent(url);
    return `intent://${destination}#Intent;scheme=https;package=com.openai.chatgpt;S.browser_fallback_url=${fallback};end`;
  }catch{
    return null;
  }
}

function openLink(key){
  const url=links[key]||defaults[key];
  if(!url){showToast('Configura primer aquest enllaç');return;}

  if(isAndroid){
    const appIntent=buildAndroidChatGPTIntent(url);
    if(appIntent){
      window.location.href=appIntent;
      return;
    }
  }

  window.open(url,'_blank','noopener,noreferrer');
}

function setMenu(open){
  const mobile=window.matchMedia('(max-width:760px)').matches;
  if(!mobile){
    sidebar.classList.remove('open');
    menuScrim.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded','false');
    menuButton.textContent='☰';
    return;
  }

  sidebar.classList.toggle('open',open);
  menuScrim.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.textContent=open?'×':'☰';
}

function openSettings(){
  setMenu(false);
  fields.innerHTML=Object.keys(labels).map(key=>`
    <div class="field">
      <label for="${key}">${labels[key]}</label>
      <input id="${key}" name="${key}" value="${links[key]||''}" placeholder="https://...">
    </div>`).join('');
  dialog.showModal();
}

function showToast(text){
  toast.textContent=text;
  toast.classList.add('show');
  window.setTimeout(()=>toast.classList.remove('show'),2400);
}

document.addEventListener('click',event=>{
  const opener=event.target.closest('[data-open]');
  if(opener)openLink(opener.dataset.open);

  const nav=event.target.closest('[data-go]');
  if(nav){
    document.getElementById(nav.dataset.go).scrollIntoView({behavior:'smooth'});
    setMenu(false);
  }
});

document.addEventListener('keydown',event=>{
  if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-open]')){
    event.preventDefault();
    openLink(event.target.dataset.open);
  }
  if(event.key==='Escape')setMenu(false);
});

document.getElementById('edit').addEventListener('click',openSettings);
document.getElementById('customize').addEventListener('click',openSettings);
document.getElementById('manage').addEventListener('click',openSettings);

menuButton.addEventListener('click',event=>{
  event.stopPropagation();
  setMenu(!sidebar.classList.contains('open'));
});
menuScrim.addEventListener('click',()=>setMenu(false));
window.addEventListener('resize',()=>{
  if(!window.matchMedia('(max-width:760px)').matches)setMenu(false);
});

document.getElementById('form').addEventListener('submit',event=>{
  if(event.submitter?.value==='cancel')return;
  Object.keys(labels).forEach(key=>{
    links[key]=document.getElementById(key).value.trim()||defaults[key];
  });
  localStorage.setItem('jarvis-hq-links',JSON.stringify(links));
  showToast('Enllaços desats en aquest dispositiu');
});

document.getElementById('reset').addEventListener('click',()=>{
  links={...defaults};
  localStorage.removeItem('jarvis-hq-links');
  dialog.close();
  openSettings();
  showToast('Valors restablerts');
});

document.getElementById('share').addEventListener('click',async()=>{
  const data={title:'JARVIS HQ',text:'El centre de comandament de Marc',url:location.href};
  try{
    if(navigator.share)await navigator.share(data);
    else{
      await navigator.clipboard.writeText(location.href);
      showToast('Enllaç copiat');
    }
  }catch(error){
    if(error.name!=='AbortError')showToast('No s’ha pogut compartir');
  }
});

const hour=new Date().getHours();
const greeting=hour<13?'Bon dia':hour<20?'Bona tarda':'Bona nit';
document.getElementById('greeting').textContent=`${greeting}, Marc`;
render();