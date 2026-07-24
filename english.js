(()=>{
  if(typeof labels==='undefined'||typeof areas==='undefined'||typeof routineGroups==='undefined')return;

  document.documentElement.lang='en';

  Object.assign(labels,{
    command:'Command Center',
    consulting:'AI Consulting',
    finances:'Marc & Jarvis | Finance',
    ideas:'Ideas & Projects',
    learning:'Learning & Culture',
    mundo:'Mundo Deportivo',
    as:'AS',
    gmailPersonal:'Personal Gmail',
    gmailConsulting:'AI Consulting Gmail',
    youtube:'YouTube',
    tradeRepublic:'Trade Republic',
    netflix:'Netflix',
    hbo:'HBO Max',
    disney:'Disney+',
    cat3:'3Cat',
    porra:'The Pool — Portfolio',
    github:"Marc's GitHub",
    email:'AI Consulting Email',
    prime:'Prime Video',
    instagram:"Marc's Instagram",
    threads:"Marc's Threads",
    amazon:'Amazon Shopping',
    bbva:'BBVA Spain',
    salut:'La Meva Salut',
    linkedin:"Marc's LinkedIn"
  });

  const areaCopy={
    consulting:{title:'AI Consulting',desc:'Clients, proposals, automation and business opportunities.',tag:'BUSINESS'},
    finances:{title:'Finance',desc:'Markets, investments, strategy and calm decision-making.',tag:'WEALTH'},
    ideas:{title:'Ideas & Projects',desc:'Apps, experiments, MVPs and AI-powered brainstorming.',tag:'BUILD'},
    learning:{title:'Learning',desc:'Books, history, opera, culture and new skills.',tag:'CULTURE'}
  };

  areas.forEach(area=>Object.assign(area,areaCopy[area.key]||{}));

  routineGroups.forEach(group=>{
    const keys=group.items.map(item=>item.key);
    if(keys.includes('mundo')){
      group.title='Sports News';
      group.items.forEach(item=>{
        if(item.key==='mundo')item.sub='Sports news and analysis';
        if(item.key==='as')item.sub='News, scores and results';
      });
    }else if(keys.includes('gmailPersonal')){
      group.title='Email';
      group.items.forEach(item=>{
        if(item.key==='gmailPersonal')item.sub='Main inbox';
        if(item.key==='gmailConsulting')item.sub='Professional inbox';
      });
    }else if(keys.includes('youtube')){
      group.title='Video & Content';
      group.items.forEach(item=>{
        if(item.key==='youtube')item.sub='YouTube';
        if(item.key==='cat3')item.sub='3Cat';
      });
    }else if(keys.includes('tradeRepublic')){
      group.title='Finance';
      group.items.forEach(item=>{
        if(item.key==='tradeRepublic')item.sub='Portfolio and savings';
        if(item.key==='bbva')item.sub='Accounts, cards and online banking';
      });
    }else if(keys.includes('netflix')){
      group.title='Streaming';
      group.items.forEach(item=>{
        if(item.key==='prime')item.sub='Prime Video';
      });
    }else if(keys.includes('salut')){
      group.title='Health';
      group.items.forEach(item=>{
        if(item.key==='salut')item.sub='Medical information, appointments and services';
      });
    }
  });

  const quickCopy={
    command:'Organization, tasks and daily life',
    porra:'Published portfolio project',
    github:'Repositories and technical projects',
    email:'marcmonferrer.ai@gmail.com'
  };
  if(typeof quick!=='undefined'){
    quick.forEach(item=>{if(quickCopy[item.key])item.sub=quickCopy[item.key];});
  }

  if(typeof render==='function')render();

  document.querySelectorAll('.card').forEach((card,index)=>{
    const button=card.querySelector('.open');
    if(button&&areas[index])button.setAttribute('aria-label',`Open ${areas[index].title}`);
  });

  const translateText=(selector,text)=>{
    const node=document.querySelector(selector);
    if(node)node.textContent=text;
  };

  translateText('.messaging-dock .whatsapp .messaging-copy small','DIRECT MESSAGING');
  translateText('.messaging-dock .telegram .messaging-copy small','DIRECT MESSAGING');
  document.querySelector('.messaging-dock')?.setAttribute('aria-label','Direct messaging');
  document.querySelector('.messaging-dock .whatsapp')?.setAttribute('aria-label','Open WhatsApp');
  document.querySelector('.messaging-dock .telegram')?.setAttribute('aria-label','Open Telegram');

  const socialDock=document.querySelector('.social-dock');
  if(socialDock){
    socialDock.setAttribute('aria-label',"Marc's social profiles");
    socialDock.querySelectorAll('.social-copy small').forEach(node=>node.textContent='SOCIAL PROFILE');
    socialDock.querySelector('.instagram')?.setAttribute('aria-label',"Open Marc's Instagram");
    socialDock.querySelector('.threads')?.setAttribute('aria-label',"Open Marc's Threads");
  }

  const shoppingDock=document.querySelector('.shopping-dock');
  if(shoppingDock){
    shoppingDock.setAttribute('aria-label','Shopping');
    shoppingDock.querySelector('.shopping-link')?.setAttribute('aria-label','Open Amazon Shopping');
    translateText('.shopping-copy small','SHOPPING');
    translateText('.shopping-copy em','Open the app or Amazon.es');
  }

  const oldShare=document.getElementById('share');
  if(oldShare){
    const shareButton=oldShare.cloneNode(true);
    oldShare.replaceWith(shareButton);
    shareButton.title='Share';
    shareButton.setAttribute('aria-label','Share JARVIS HQ');
    shareButton.addEventListener('click',async()=>{
      const data={
        title:'JARVIS HQ',
        text:"Marc's personal command center",
        url:'https://marcmonferrer.github.io/jarvis-hq/share.html'
      };
      try{
        if(navigator.share)await navigator.share(data);
        else{
          await navigator.clipboard.writeText(data.url);
          showToast('Link copied');
        }
      }catch(error){
        if(error.name!=='AbortError')showToast('Unable to share');
      }
    });
  }

  if(typeof showToast==='function'){
    const originalShowToast=showToast;
    const directTranslations={
      'Configura primer aquest enllaç':'Configure this link first',
      'Enllaços desats en aquest dispositiu':'Links saved on this device',
      'No s’han pogut desar al navegador':'The browser could not save the links',
      'Valors restablerts':'Default values restored',
      'Enllaç copiat':'Link copied',
      'No s’ha pogut compartir':'Unable to share'
    };

    showToast=function(text){
      let translated=directTranslations[text]||text;
      translated=translated.replace(/^Revisa l’enllaç de /,'Check the link for ');
      originalShowToast(translated);
    };
  }

  const now=new Date();
  const hour=now.getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const greetingNode=document.getElementById('greeting');
  const todayNode=document.getElementById('today');
  if(greetingNode)greetingNode.textContent=`${greeting}, Marc`;
  if(todayNode)todayNode.textContent=new Intl.DateTimeFormat('en-US',{
    weekday:'long',month:'long',day:'numeric'
  }).format(now);

  const version=document.querySelector('footer span:first-child');
  if(version)version.textContent='JARVIS HQ · v1.7';
})();
