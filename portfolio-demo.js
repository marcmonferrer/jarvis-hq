(()=>{
  'use strict';

  const STORAGE_KEY='jarvis-hq-portfolio-demo-v1';
  const priorityList=document.getElementById('demoPriorityList');
  const note=document.getElementById('demoNote');
  const progress=document.getElementById('demoProgress');
  const saveStatus=document.getElementById('demoSaveStatus');
  const characterCount=document.getElementById('demoCharacterCount');
  const suggestion=document.getElementById('briefSuggestion');
  const toast=document.getElementById('demoToast');

  const blankState=()=>({
    priorities:[
      {text:'',done:false},
      {text:'',done:false},
      {text:'',done:false}
    ],
    note:'',
    updatedAt:Date.now()
  });

  function readState(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!parsed||!Array.isArray(parsed.priorities))return blankState();
      return {
        priorities:Array.from({length:3},(_,index)=>({
          text:typeof parsed.priorities[index]?.text==='string'?parsed.priorities[index].text.slice(0,160):'',
          done:Boolean(parsed.priorities[index]?.done&&parsed.priorities[index]?.text)
        })),
        note:typeof parsed.note==='string'?parsed.note.slice(0,800):'',
        updatedAt:Number.isFinite(parsed.updatedAt)?parsed.updatedAt:Date.now()
      };
    }catch{
      return blankState();
    }
  }

  let state=readState();
  let saveTimer;
  let toastTimer;

  function showToast(message){
    if(!toast)return;
    toast.textContent=message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer=window.setTimeout(()=>toast.classList.remove('show'),2300);
  }

  function queueSave(){
    window.clearTimeout(saveTimer);
    if(saveStatus)saveStatus.textContent='Saving…';
    saveTimer=window.setTimeout(()=>{
      try{
        state.updatedAt=Date.now();
        localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
        if(saveStatus)saveStatus.textContent='Saved locally';
      }catch{
        if(saveStatus)saveStatus.textContent='Unable to save';
      }
    },260);
  }

  function updateProgress(){
    const complete=state.priorities.filter(item=>item.done&&item.text.trim()).length;
    if(progress){
      progress.textContent=`${complete} of 3 complete`;
      progress.style.color=complete===3?'#caffea':'';
      progress.style.borderColor=complete===3?'rgba(85,230,165,.26)':'';
      progress.style.background=complete===3?'rgba(85,230,165,.08)':'';
    }
  }

  function updateSuggestion(){
    if(!suggestion)return;
    const active=state.priorities.find(item=>item.text.trim()&&!item.done)
      ||state.priorities.find(item=>item.text.trim());
    if(!active){
      suggestion.textContent='Add a priority to receive a suggestion.';
      return;
    }
    const snippets=[
      `Start with “${active.text.trim()}” and define the smallest visible first step.`,
      `Block 25 focused minutes for “${active.text.trim()}” before opening another module.`,
      `Turn “${active.text.trim()}” into one deliverable and one next action.`
    ];
    suggestion.textContent=snippets[Math.floor(Math.random()*snippets.length)];
  }

  function renderPriorities(){
    if(!priorityList)return;
    const placeholders=[
      'Most important outcome',
      'One project-moving action',
      'One delivery or follow-up task'
    ];
    priorityList.replaceChildren();

    state.priorities.forEach((item,index)=>{
      const row=document.createElement('div');
      row.className=`demo-priority-item${item.done?' done':''}`;

      const toggle=document.createElement('button');
      toggle.type='button';
      toggle.textContent='✓';
      toggle.disabled=!item.text.trim();
      toggle.setAttribute('aria-pressed',String(item.done));
      toggle.setAttribute('aria-label',`Mark priority ${index+1} ${item.done?'not complete':'complete'}`);

      const input=document.createElement('input');
      input.type='text';
      input.maxLength=160;
      input.autocomplete='off';
      input.value=item.text;
      input.placeholder=placeholders[index];
      input.setAttribute('aria-label',`Priority ${index+1}`);

      toggle.addEventListener('click',()=>{
        if(!item.text.trim())return;
        item.done=!item.done;
        row.classList.toggle('done',item.done);
        toggle.setAttribute('aria-pressed',String(item.done));
        toggle.setAttribute('aria-label',`Mark priority ${index+1} ${item.done?'not complete':'complete'}`);
        updateProgress();
        updateSuggestion();
        queueSave();
      });

      input.addEventListener('input',()=>{
        item.text=input.value;
        if(!item.text.trim())item.done=false;
        row.classList.toggle('done',item.done);
        toggle.disabled=!item.text.trim();
        toggle.setAttribute('aria-pressed',String(item.done));
        updateProgress();
        updateSuggestion();
        queueSave();
      });

      row.append(toggle,input);
      priorityList.append(row);
    });
  }

  if(note){
    note.value=state.note;
    note.addEventListener('input',()=>{
      state.note=note.value;
      if(characterCount)characterCount.textContent=`${note.value.length} / 800`;
      queueSave();
    });
  }

  document.getElementById('resetDemoBrief')?.addEventListener('click',()=>{
    const hasContent=state.note.trim()||state.priorities.some(item=>item.text.trim());
    if(hasContent&&!window.confirm('Clear the demo priorities and note?'))return;
    state=blankState();
    if(note)note.value='';
    renderPriorities();
    if(characterCount)characterCount.textContent='0 / 800';
    updateProgress();
    updateSuggestion();
    queueSave();
    showToast('Demo brief reset');
  });

  document.getElementById('generateSuggestion')?.addEventListener('click',()=>{
    updateSuggestion();
    showToast('New copilot suggestion generated');
  });

  const modules={
    planning:{
      index:'MODULE 01',icon:'✓',title:'Daily Planning',accent:'#ff8a36',
      description:'Turn an open-ended day into a short, visible plan with priorities, quick capture and progress feedback.',
      features:['Three outcome-based priorities','Daily quick-capture note','Local progress tracking'],
      example:'Plan the day in under 60 seconds.'
    },
    projects:{
      index:'MODULE 02',icon:'◇',title:'Project Spaces',accent:'#ff477e',
      description:'Group objectives, decisions, resources and next actions around each active initiative.',
      features:['Dedicated project context','Visible next-step tracking','Reusable workflow templates'],
      example:'Move from idea to tested prototype without losing context.'
    },
    knowledge:{
      index:'MODULE 03',icon:'⌁',title:'Knowledge',accent:'#9f62ff',
      description:'Create a structured home for research, learning plans, references and AI-assisted synthesis.',
      features:['Topic-based knowledge spaces','Learning paths and summaries','Fast return to trusted references'],
      example:'Turn scattered information into a usable knowledge system.'
    },
    markets:{
      index:'MODULE 04',icon:'↗',title:'Market Demo',accent:'#55e6a5',
      description:'Demonstrate market-context cards with invented symbols and clearly simulated values.',
      features:['Fictional symbols and company names','Simulated prices and movements','No real holdings or balance data'],
      example:'Explore a market interface without implying real prices or financial advice.'
    },
    sports:{
      index:'MODULE 05',icon:'◉',title:'Sports Briefing',accent:'#73a8ff',
      description:'Present selected public schedules and cached match information in a compact briefing.',
      features:['Curated public favourites','Cached public-data fallback','Clear unavailable states'],
      example:'Review the next fixtures without leaving the command center.'
    },
    communication:{
      index:'MODULE 06',icon:'✉',title:'Communication Flow',accent:'#ffb15c',
      description:'Illustrate message-to-action workflows with invented senders, services and content.',
      features:['Fictional messages only','No live account links','No credentials or account identifiers'],
      example:'Move a simulated message into a clear next action.'
    }
  };

  const moduleDetail=document.getElementById('moduleDetail');
  function selectModule(key){
    const data=modules[key];
    if(!data)return;
    document.querySelectorAll('.module-card').forEach(card=>card.classList.toggle('active',card.dataset.module===key));
    document.getElementById('moduleIcon').textContent=data.icon;
    document.getElementById('moduleIndex').textContent=data.index;
    document.getElementById('moduleTitle').textContent=data.title;
    document.getElementById('moduleDescription').textContent=data.description;
    document.getElementById('moduleFeatures').innerHTML=data.features.map(item=>`<li>${item}</li>`).join('');
    document.getElementById('moduleExample').innerHTML=`<small>EXAMPLE</small><strong>${data.example}</strong>`;
    moduleDetail?.style.setProperty('--detail-accent',data.accent);
  }

  document.getElementById('moduleGrid')?.addEventListener('click',event=>{
    const button=event.target.closest('[data-module]');
    if(button)selectModule(button.dataset.module);
  });

  const promptResponses={
    plan:{
      title:'Focused daily plan',
      text:'Start with one high-value outcome, protect a short focus block, and defer low-impact work until the main result is visible.',
      steps:['Choose one measurable outcome for the next 90 minutes.','Define the smallest action that produces visible progress.','Schedule a brief review before switching modules.']
    },
    project:{
      title:'Clarify the next project step',
      text:'Reduce the project to the next decision that unlocks movement. Avoid building additional scope before that decision is tested.',
      steps:['State the current project objective in one sentence.','Identify the assumption with the highest uncertainty.','Create the smallest test that can confirm or reject it.']
    },
    learn:{
      title:'Create a learning path',
      text:'Organize the topic into foundation, practice and application so each learning session produces something usable.',
      steps:['Define the practical skill you want to gain.','Select one foundational resource and one exercise.','Apply the idea in a small project or explanation.']
    },
    decision:{
      title:'Compare two decisions',
      text:'Separate reversible from irreversible consequences, then compare value, effort, risk and learning potential.',
      steps:['List the decision criteria before judging the options.','Score each option using the same evidence.','Choose the option with the best downside protection and learning value.']
    }
  };

  document.querySelector('.ai-prompt-list')?.addEventListener('click',event=>{
    const button=event.target.closest('[data-prompt]');
    if(!button)return;
    const data=promptResponses[button.dataset.prompt];
    if(!data)return;
    document.querySelectorAll('[data-prompt]').forEach(item=>item.classList.toggle('active',item===button));
    document.getElementById('aiResponseTitle').textContent=data.title;
    document.getElementById('aiResponseText').textContent=data.text;
    document.getElementById('aiResponseSteps').innerHTML=data.steps.map(step=>`<li>${step}</li>`).join('');
  });

  document.getElementById('shareDemo')?.addEventListener('click',async()=>{
    const data={
      title:'JARVIS HQ · Portfolio Demo',
      text:'A premium privacy-first command center designed by Marc Monferrer.',
      url:'https://marcmonferrer.github.io/jarvis-hq/'
    };
    try{
      if(navigator.share)await navigator.share(data);
      else{
        await navigator.clipboard.writeText(data.url);
        showToast('Portfolio link copied');
      }
    }catch(error){
      if(error.name!=='AbortError')showToast('Unable to share');
    }
  });

  document.querySelectorAll('.demo-mobile-nav a').forEach(link=>{
    link.addEventListener('click',()=>{
      const menu=link.closest('details');
      if(menu)menu.open=false;
    });
  });

  const sections=[...document.querySelectorAll('main section[id],main[id]')];
  const navLinks=[...document.querySelectorAll('.demo-nav a')];
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      const id=visible.target.id||'top';
      navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${id}`));
    },{rootMargin:'-20% 0px -65%',threshold:[.05,.25,.5]});
    sections.forEach(section=>observer.observe(section));
  }

  renderPriorities();
  if(characterCount)characterCount.textContent=`${state.note.length} / 800`;
  updateProgress();
  updateSuggestion();
  selectModule('planning');
})();
