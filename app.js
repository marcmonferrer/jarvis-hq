const defaults={
  command:'https://chatgpt.com/',
  consulting:'https://chatgpt.com/',
  finances:'https://chatgpt.com/',
  ideas:'https://chatgpt.com/',
  learning:'https://chatgpt.com/',
  mundo:'https://www.mundodeportivo.com/',
  as:'https://as.com/',
  gmailPersonal:'https://mail.google.com/mail/u/0/#inbox',
  gmailConsulting:'https://mail.google.com/mail/u/1/#inbox',
  youtube:'https://www.youtube.com/',
  tradeRepublic:'https://app.traderepublic.com/',
  netflix:'https://www.netflix.com/',
  hbo:'https://www.hbomax.com/',
  disney:'https://www.disneyplus.com/',
  cat3:'https://www.3cat.cat/3cat/',
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
  mundo:'Mundo Deportivo',
  as:'Diari AS',
  gmailPersonal:'Gmail personal',
  gmailConsulting:'Gmail AI Consulting',
  youtube:'YouTube',
  tradeRepublic:'Trade Republic',
  netflix:'Netflix',
  hbo:'HBO Max',
  disney:'Disney+',
  cat3:'3Cat',
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

const routineGroups=[
  {title:'Premsa esportiva',icon:'⚽',accent:'#ff8a36',items:[
    {key:'mundo',icon:'MD',sub:'Actualitat esportiva'},
    {key:'as',icon:'AS',sub:'Notícies i resultats'}
  ]},
  {title:'Correu',icon:'✉️',accent:'#ff477e',items:[
    {key:'gmailPersonal',icon:'M',sub:'Inbox principal'},
    {key:'gmailConsulting',icon:'AI',sub:'Inbox professional'}
  ]},
  {title:'Vídeo i continguts',icon:'▶',accent:'#9f62ff',items:[
    {key:'youtube',icon:'YT',sub:'YouTube'},
    {key:'cat3',icon:'3C',sub:'3Cat'}
  ]},
  {title:'Finances',icon:'↗',accent:'#55e6a5',items:[
    {key:'tradeRepublic',icon:'TR',sub:'Cartera i estalvi'}
  ]},
  {title:'Streaming',icon:'▣',accent:'#73a8ff',items:[
    {key:'netflix',icon:'N',sub:'Netflix'},
    {key:'hbo',icon:'H',sub:'HBO Max'},
    {key:'disney',icon:'D+',sub:'Disney+'}
  ]}
];

const quick=[
  {key:'command',icon:'🏠',sub:'Organització, tasques i vida diària'},
  {key:'porra',icon:'🏆',sub:'Projecte de portfolio publicat'},
  {key:'github',icon:'⌘',sub:'Repositoris i projectes tècnics'},
  {key:'email',icon:'✉️',sub:'marcmonferrer.ai@gmail.com'}
];

const storageKey='jarvis-hq-links';
const cards=document.getElementById('cards');
const routineGrid=document.getElementById('routineGrid');
const quickBox=document.getElementById('quick');
const dialog=document.getElementById('dialog');
const fields=document.getElementById('fields');
const toast=document.getElementById('toast');
const mobileNav=document.getElementById('mobileNav');
const isAndroid=/Android/i.test(navigator.userAgent);

function loadLinks(){
  try{
    const stored=JSON.parse(localStorage.getItem(storageKey)||'{}');
    return {...defaults,...stored};
  }catch{
    return {...defaults};
  }
}

function saveLinks(){
  try{
    localStorage.setItem(storageKey,JSON.stringify(links));
    return true;
  }catch{
    return false;
  }
}

function clearSavedLinks(){
  try{localStorage.removeItem(storageKey);}catch{}
}

let links=loadLinks();

function escapeHtml(value){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function render(){
  cards.innerHTML=areas.map(area=>`
    <article class="card" style="--accent:${area.accent}" data-open="${area.key}" tabindex="0" role="link">
      <div class="cardicon">${area.icon}</div>
      <h4>${area.title}</h4>
      <p>${area.desc}</p>
      <div class="cardfooter"><span>${area.tag}</span><button class="open" aria-label="Obrir ${area.title}">↗</button></div>
    </article>`).join('');

  routineGrid.innerHTML=routineGroups.map(group=>`
    <article class="routine-card" style="--accent:${group.accent}">
      <div class="routine-head"><span>${group.icon}</span><h4>${group.title}</h4></div>
      <div class="app-list">
        ${group.items.map(item=>`
          <button class="app-link" data-open="${item.key}">
            <span class="app-badge">${item.icon}</span>
            <span><strong>${labels[item.key]}</strong><small>${item.sub}</small></span>
            <b>↗</b>
          </button>`).join('')}
      </div>
    </article>`).join('');

  quickBox.innerHTML=quick.map(item=>`
    <div class="quickitem" data-open="${item.key}" tabindex="0" role="link">
      <div class="quickico">${item.icon}</div>
      <div><strong>${labels[item.key]}</strong><small>${item.sub}</small></div>
      <span class="arrow">›</span>
    </div>`).join('');
}

function makeAndroidChatGPTIntent(url){
  try{
    const parsed=new URL(url);
    if(parsed.protocol!=='https:'||parsed.hostname!=='chatgpt.com')return null;
    if(parsed.pathname==='/'&&!parsed.search&&!parsed.hash){
      return 'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.openai.chatgpt;end';
    }
    const destination=`${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
    const fallback=encodeURIComponent(url);
    return `intent://${destination}#Intent;scheme=https;package=com.openai.chatgpt;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${fallback};end`;
  }catch{
    return null;
  }
}

function launch(url){
  if(url.startsWith('mailto:')){
    window.location.href=url;
    return;
  }

  if(isAndroid){
    const intentUrl=makeAndroidChatGPTIntent(url);
    if(intentUrl){
      window.location.href=intentUrl;
      return;
    }
  }

  const link=document.createElement('a');
  link.href=url;
  link.target='_blank';
  link.rel='noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function openLink(key){
  const url=links[key]||defaults[key];
  if(!url){showToast('Configura primer aquest enllaç');return;}
  launch(url);
}

function closeMobileMenu(){
  if(mobileNav)mobileNav.open=false;
}

function openSettings(){
  closeMobileMenu();
  fields.innerHTML=Object.keys(labels).map(key=>`
    <div class="field">
      <label for="${key}">${labels[key]}</label>
      <input id="${key}" name="${key}" value="${escapeHtml(links[key]||'')}" inputmode="url" autocomplete="off" placeholder="https://...">
    </div>`).join('');
  dialog.showModal();
}

function showToast(text){
  toast.textContent=text;
  toast.classList.add('show');
  window.setTimeout(()=>toast.classList.remove('show'),2400);
}

function isAllowedUrl(value){
  return /^(https?:\/\/|mailto:)/i.test(value);
}

document.addEventListener('click',event=>{
  const opener=event.target.closest('[data-open]');
  if(opener){
    event.preventDefault();
    openLink(opener.dataset.open);
    return;
  }

  const nav=event.target.closest('[data-go]');
  if(nav){
    event.preventDefault();
    const target=document.getElementById(nav.dataset.go);
    closeMobileMenu();
    target?.scrollIntoView({behavior:'smooth',block:'start'});
  }
});

document.addEventListener('keydown',event=>{
  if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-open]')){
    event.preventDefault();
    openLink(event.target.dataset.open);
  }
  if(event.key==='Escape')closeMobileMenu();
});

document.getElementById('edit').addEventListener('click',openSettings);
document.getElementById('customize').addEventListener('click',openSettings);
document.getElementById('manage').addEventListener('click',openSettings);

document.getElementById('form').addEventListener('submit',event=>{
  if(event.submitter?.value==='cancel')return;

  const updated={};
  for(const key of Object.keys(labels)){
    const value=document.getElementById(key).value.trim()||defaults[key];
    if(!isAllowedUrl(value)){
      event.preventDefault();
      showToast(`Revisa l’enllaç de ${labels[key]}`);
      document.getElementById(key).focus();
      return;
    }
    updated[key]=value;
  }

  links=updated;
  if(saveLinks())showToast('Enllaços desats en aquest dispositiu');
  else showToast('No s’han pogut desar al navegador');
});

document.getElementById('reset').addEventListener('click',()=>{
  links={...defaults};
  clearSavedLinks();
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

const now=new Date();
const hour=now.getHours();
const greeting=hour<13?'Bon dia':hour<20?'Bona tarda':'Bona nit';
document.getElementById('greeting').textContent=`${greeting}, Marc`;
document.getElementById('today').textContent=new Intl.DateTimeFormat('ca-ES',{
  weekday:'long',day:'numeric',month:'long'
}).format(now);

render();
