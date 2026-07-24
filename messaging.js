(()=>{
  const isAndroid=/Android/i.test(navigator.userAgent);
  const apps={
    whatsapp:{
      packageName:'com.whatsapp',
      fallback:'https://web.whatsapp.com/'
    },
    telegram:{
      packageName:'org.telegram.messenger',
      fallback:'https://web.telegram.org/k/'
    },
    amazon:{
      packageName:'com.amazon.mShop.android.shopping',
      fallback:'https://www.amazon.es/'
    },
    bbva:{
      packageName:'com.bbva.bbvacontigo',
      fallback:'https://www.bbva.es/personas/banca-online.html'
    },
    salut:{
      packageName:'cat.gencat.mobi.lamevasalut',
      fallback:'https://lamevasalut.gencat.cat/ca/web/cps/'
    }
  };

  function addPersonalLinks(){
    if(typeof defaults==='undefined'||typeof labels==='undefined'||typeof routineGroups==='undefined')return;

    defaults.prime='https://www.primevideo.com/';
    defaults.instagram='https://www.instagram.com/marcmonferrer/';
    defaults.threads='https://www.threads.net/@marcmonferrer';
    defaults.amazon='https://www.amazon.es/';
    defaults.bbva='https://www.bbva.es/personas/banca-online.html';
    defaults.salut='https://lamevasalut.gencat.cat/ca/web/cps/';

    labels.prime='Prime Video';
    labels.instagram='Instagram de Marc';
    labels.threads='Threads de Marc';
    labels.amazon='Amazon Shopping';
    labels.bbva='BBVA Espanya';
    labels.salut='La Meva Salut';

    const streaming=routineGroups.find(group=>group.title==='Streaming');
    if(streaming&&!streaming.items.some(item=>item.key==='prime')){
      streaming.items.push({key:'prime',icon:'PV',sub:'Prime Video'});
    }

    const finances=routineGroups.find(group=>group.title==='Finances');
    if(finances&&!finances.items.some(item=>item.key==='bbva')){
      finances.items.push({key:'bbva',icon:'B',sub:'Compte, targetes i banca online'});
    }

    if(!routineGroups.some(group=>group.title==='Salut')){
      routineGroups.push({
        title:'Salut',
        icon:'❤',
        accent:'#ff5c75',
        items:[{key:'salut',icon:'LMS',sub:'Informació, visites i tràmits mèdics'}]
      });
    }

    if(typeof links!=='undefined'){
      links={...defaults,...links};
    }

    const dock=document.querySelector('.messaging-dock');
    if(dock&&!dock.querySelector('.social-dock')){
      dock.insertAdjacentHTML('beforeend',`
        <div class="social-dock" aria-label="Xarxes socials de Marc">
          <button class="social-link instagram" data-open="instagram" aria-label="Obrir l'Instagram de Marc">
            <span class="social-icon" aria-hidden="true">◎</span>
            <span class="social-copy"><small>XARXA SOCIAL</small><strong>Instagram</strong><em>@marcmonferrer</em></span>
            <span class="social-arrow" aria-hidden="true">↗</span>
          </button>
          <button class="social-link threads" data-open="threads" aria-label="Obrir el Threads de Marc">
            <span class="social-icon" aria-hidden="true">@</span>
            <span class="social-copy"><small>XARXA SOCIAL</small><strong>Threads</strong><em>@marcmonferrer</em></span>
            <span class="social-arrow" aria-hidden="true">↗</span>
          </button>
        </div>`);
    }

    if(dock&&!dock.querySelector('.shopping-dock')){
      dock.insertAdjacentHTML('beforeend',`
        <div class="shopping-dock" aria-label="Compres">
          <button class="shopping-link amazon" data-messaging="amazon" aria-label="Obrir Amazon Shopping">
            <span class="shopping-icon" aria-hidden="true">a</span>
            <span class="shopping-copy"><small>COMPRES</small><strong>Amazon Shopping</strong><em>Obrir l'app o Amazon.es</em></span>
            <span class="shopping-arrow" aria-hidden="true">↗</span>
          </button>
        </div>`);
    }

    const version=document.querySelector('footer span:first-child');
    if(version)version.textContent='JARVIS HQ · v1.5';

    if(typeof render==='function')render();
  }

  function openApp(key){
    const app=apps[key];
    if(!app)return;

    if(isAndroid){
      const fallback=encodeURIComponent(app.fallback);
      window.location.href=`intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${app.packageName};S.browser_fallback_url=${fallback};end`;
      return;
    }

    const link=document.createElement('a');
    link.href=app.fallback;
    link.target='_blank';
    link.rel='noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const baseOpenLink=window.openLink;
  if(typeof baseOpenLink==='function'){
    window.openLink=function(key){
      if((key==='bbva'||key==='salut')&&apps[key]){
        openApp(key);
        return;
      }
      baseOpenLink(key);
    };
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-messaging]');
    if(!button)return;
    event.preventDefault();
    openApp(button.dataset.messaging);
  });

  addPersonalLinks();
})();