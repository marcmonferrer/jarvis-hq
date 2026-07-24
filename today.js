(()=>{
  const STORAGE_KEY='jarvis-hq-today-brief-v1';
  const TIME_ZONE='Europe/Madrid';
  const PRIORITY_COUNT=3;
  const MAX_SAVED_DAYS=14;
  const placeholders=[
    'Most important outcome',
    'One task that moves a project forward',
    'One personal or admin task'
  ];

  const priorityList=document.getElementById('priorityList');
  const notes=document.getElementById('briefNotes');
  const progress=document.getElementById('briefProgress');
  const dateLabel=document.getElementById('briefDate');
  const saveStatus=document.getElementById('briefSaveStatus');
  const characterCount=document.getElementById('briefCharacterCount');
  const resetButton=document.getElementById('briefReset');

  if(!priorityList||!notes||!progress||!dateLabel||!saveStatus||!characterCount||!resetButton)return;

  let saveTimer;
  let statusTimer;

  function dateKey(date=new Date()){
    const parts=new Intl.DateTimeFormat('en-GB',{
      timeZone:TIME_ZONE,
      year:'numeric',
      month:'2-digit',
      day:'2-digit'
    }).formatToParts(date);
    const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function blankDay(){
    return {
      priorities:Array.from({length:PRIORITY_COUNT},()=>({text:'',done:false})),
      note:'',
      updatedAt:Date.now()
    };
  }

  function normalizeDay(value){
    const fallback=blankDay();
    if(!value||typeof value!=='object')return fallback;
    const priorities=Array.from({length:PRIORITY_COUNT},(_,index)=>{
      const item=Array.isArray(value.priorities)?value.priorities[index]:null;
      return {
        text:typeof item?.text==='string'?item.text.slice(0,180):'',
        done:Boolean(item?.done&&item?.text)
      };
    });
    return {
      priorities,
      note:typeof value.note==='string'?value.note.slice(0,1200):'',
      updatedAt:Number.isFinite(value.updatedAt)?value.updatedAt:Date.now()
    };
  }

  function readStore(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return parsed&&typeof parsed==='object'&&parsed.days&&typeof parsed.days==='object'
        ?parsed
        :{days:{}};
    }catch{
      return {days:{}};
    }
  }

  function writeStore(store){
    const entries=Object.entries(store.days||{})
      .sort((a,b)=>(b[1]?.updatedAt||0)-(a[1]?.updatedAt||0))
      .slice(0,MAX_SAVED_DAYS);
    const trimmed={days:Object.fromEntries(entries)};
    localStorage.setItem(STORAGE_KEY,JSON.stringify(trimmed));
  }

  const today=dateKey();
  const store=readStore();
  let day=normalizeDay(store.days[today]);

  function setSaveStatus(text,state=''){
    saveStatus.textContent=text;
    saveStatus.dataset.state=state;
  }

  function queueSave(){
    window.clearTimeout(saveTimer);
    window.clearTimeout(statusTimer);
    setSaveStatus('Saving…','saving');
    saveTimer=window.setTimeout(()=>{
      try{
        day.updatedAt=Date.now();
        store.days[today]=day;
        writeStore(store);
        setSaveStatus('Saved locally','saved');
      }catch{
        setSaveStatus('Unable to save','error');
      }
      statusTimer=window.setTimeout(()=>{
        if(saveStatus.dataset.state==='saved')saveStatus.dataset.state='';
      },1800);
    },300);
  }

  function updateProgress(){
    const complete=day.priorities.filter(item=>item.done&&item.text.trim()).length;
    progress.textContent=`${complete} of ${PRIORITY_COUNT} complete`;
    progress.classList.toggle('complete',complete===PRIORITY_COUNT);
  }

  function updateCharacterCount(){
    characterCount.textContent=`${notes.value.length} / 1200`;
  }

  function renderPriorities(){
    priorityList.replaceChildren();

    day.priorities.forEach((item,index)=>{
      const row=document.createElement('div');
      row.className=`priority-item${item.done?' done':''}`;

      const toggle=document.createElement('button');
      toggle.type='button';
      toggle.className='priority-toggle';
      toggle.setAttribute('aria-pressed',String(item.done));
      toggle.setAttribute('aria-label',`Mark priority ${index+1} ${item.done?'not complete':'complete'}`);
      toggle.disabled=!item.text.trim();
      toggle.innerHTML='<span aria-hidden="true">✓</span>';

      const input=document.createElement('input');
      input.type='text';
      input.maxLength=180;
      input.value=item.text;
      input.placeholder=placeholders[index];
      input.setAttribute('aria-label',`Priority ${index+1}`);
      input.autocomplete='off';

      toggle.addEventListener('click',()=>{
        if(!item.text.trim())return;
        item.done=!item.done;
        row.classList.toggle('done',item.done);
        toggle.setAttribute('aria-pressed',String(item.done));
        toggle.setAttribute('aria-label',`Mark priority ${index+1} ${item.done?'not complete':'complete'}`);
        updateProgress();
        queueSave();
      });

      input.addEventListener('input',()=>{
        item.text=input.value;
        if(!item.text.trim())item.done=false;
        row.classList.toggle('done',item.done);
        toggle.disabled=!item.text.trim();
        toggle.setAttribute('aria-pressed',String(item.done));
        toggle.setAttribute('aria-label',`Mark priority ${index+1} ${item.done?'not complete':'complete'}`);
        updateProgress();
        queueSave();
      });

      row.append(toggle,input);
      priorityList.append(row);
    });
  }

  notes.value=day.note;
  notes.addEventListener('input',()=>{
    day.note=notes.value;
    updateCharacterCount();
    queueSave();
  });

  resetButton.addEventListener('click',()=>{
    const hasContent=day.note.trim()||day.priorities.some(item=>item.text.trim());
    if(hasContent&&!window.confirm('Clear today’s priorities and note?'))return;
    day=blankDay();
    notes.value='';
    renderPriorities();
    updateCharacterCount();
    updateProgress();
    queueSave();
    if(typeof showToast==='function')showToast('Today’s brief has been reset');
  });

  dateLabel.textContent=new Intl.DateTimeFormat('en-US',{
    timeZone:TIME_ZONE,
    weekday:'long',
    month:'long',
    day:'numeric'
  }).format(new Date());

  renderPriorities();
  updateProgress();
  updateCharacterCount();
  setSaveStatus('Saved locally');

  const version=document.querySelector('footer span:first-child');
  if(version)version.textContent='JARVIS HQ · v1.9';
})();
