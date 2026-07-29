(()=>{
  'use strict';

  const stylesheet=document.createElement('link');
  stylesheet.rel='stylesheet';
  stylesheet.href='portfolio-scenario.css';
  document.head.appendChild(stylesheet);

  const caseStudy=document.getElementById('case-study');
  if(!caseStudy)return;

  const scenario=document.createElement('section');
  scenario.className='demo-section scenario-section';
  scenario.id='live-scenario';
  scenario.setAttribute('aria-labelledby','scenario-title');
  scenario.innerHTML=`
    <div class="demo-section-head">
      <div><small>FULLY FICTIONAL LIVE ENVIRONMENT</small><h2 id="scenario-title">Meet Alex Morgan’s JARVIS HQ</h2></div>
      <span class="demo-pill scenario-disclaimer">No real person, account or service</span>
    </div>

    <article class="scenario-persona">
      <div class="scenario-persona-main">
        <span class="scenario-avatar" aria-hidden="true">AM</span>
        <div class="scenario-persona-copy">
          <small>FICTIONAL SAMPLE PROFILE</small>
          <h3>Alex Morgan</h3>
          <p id="scenarioRole">Fictional product consultant coordinating client work and prototype delivery.</p>
          <div class="scenario-persona-meta">
            <span>Demo City</span><span>Product consultant</span><span>4 fictional projects</span><span id="scenarioAgentMeta">3 simulated agents online</span>
          </div>
        </div>
      </div>
      <div class="scenario-mode" aria-label="Fictional dashboard mode">
        <button type="button" class="active" data-scenario-mode="studio">Studio mode</button>
        <button type="button" data-scenario-mode="focus">Focus mode</button>
      </div>
    </article>

    <div class="scenario-summary" aria-label="Fictional daily summary">
      <article><small>NEXT EVENT · FICTIONAL</small><strong id="scenarioNextEvent">09:30</strong><span id="scenarioNextLabel">Project strategy workshop</span></article>
      <article><small>DEMO INBOX</small><strong id="scenarioUnread">7</strong><span>Invented messages</span></article>
      <article><small>SIMULATED AGENTS</small><strong id="scenarioAgentCount">3</strong><span>Demo-only workflows</span></article>
      <article><small>DEMO STATUS</small><strong id="scenarioPriorityStatus">2 / 4</strong><span id="scenarioPriorityLabel">Fictional tasks completed</span></article>
    </div>

    <div class="scenario-dashboard">
      <div class="scenario-column">
        <article class="demo-panel scenario-panel">
          <div class="scenario-panel-head">
            <div><small class="scenario-label">FICTIONAL QUICK ACCESS</small><h3>Alex’s simulated launchpad</h3></div>
            <span class="scenario-count">8 demo services</span>
          </div>
          <div class="scenario-shortcuts">
            <button class="scenario-shortcut" style="--shortcut:#55e6a5" type="button" data-demo-launch="Orbit Messages"><span>O</span><strong>Orbit Messages</strong><small>Fictional team chat</small><b>DEMO</b></button>
            <button class="scenario-shortcut" style="--shortcut:#73a8ff" type="button" data-demo-launch="Northstar Mail"><span>✉</span><strong>Northstar Mail</strong><small>Fictional work inbox</small><b>DEMO</b></button>
            <button class="scenario-shortcut" style="--shortcut:#ff8a36" type="button" data-demo-launch="Atlas Schedule"><span>17</span><strong>Atlas Schedule</strong><small>Fictional project calendar</small><b>DEMO</b></button>
            <button class="scenario-shortcut" style="--shortcut:#9f62ff" type="button" data-demo-launch="Cedar Files"><span>△</span><strong>Cedar Files</strong><small>Fictional project library</small><b>DEMO</b></button>
            <button class="scenario-shortcut" style="--shortcut:#ff477e" type="button" data-demo-launch="Orbit Tasks"><span>✓</span><strong>Orbit Tasks</strong><small>Fictional task board</small><b>DEMO</b></button>
            <button class="scenario-shortcut" style="--shortcut:#55e6a5" type="button" data-demo-launch="Nova Markets"><span>↗</span><strong>Nova Markets</strong><small>Simulated market feed</small><b>DEMO</b></button>
            <button class="scenario-shortcut" style="--shortcut:#f2c94c" type="button" data-demo-launch="Beacon Brief"><span>B</span><strong>Beacon Brief</strong><small>Invented industry digest</small><b>DEMO</b></button>
            <button class="scenario-shortcut" style="--shortcut:#ff5d5d" type="button" data-demo-launch="Signal Review"><span>S</span><strong>Signal Review</strong><small>Fictional research queue</small><b>DEMO</b></button>
          </div>
        </article>

        <article class="demo-panel scenario-panel">
          <div class="scenario-panel-head">
            <div><small class="scenario-label">SIMULATED AI OPERATIONS</small><h3>Specialized demo agents</h3></div>
            <span class="scenario-count" id="agentSummary">3 active</span>
          </div>
          <div class="agent-grid" id="scenarioAgents">
            <article class="agent-card active" data-agent="Inbox Agent">
              <div class="agent-card-top"><span class="agent-icon">✉</span><span class="agent-state">Active</span></div>
              <h4>Inbox Agent</h4><p>Triages invented messages and surfaces fictional replies.</p><button type="button">Pause agent</button>
            </article>
            <article class="agent-card active" data-agent="Market Watch">
              <div class="agent-card-top"><span class="agent-icon">↗</span><span class="agent-state">Active</span></div>
              <h4>Market Watch</h4><p>Monitors invented symbols and simulated price movements.</p><button type="button">Pause agent</button>
            </article>
            <article class="agent-card active" data-agent="Research Scout">
              <div class="agent-card-top"><span class="agent-icon">⌁</span><span class="agent-state">Active</span></div>
              <h4>Research Scout</h4><p>Prepares a fictional project research brief.</p><button type="button">Pause agent</button>
            </article>
            <article class="agent-card" data-agent="Schedule Agent">
              <div class="agent-card-top"><span class="agent-icon">◷</span><span class="agent-state">Paused</span></div>
              <h4>Schedule Agent</h4><p>Demonstrates focus-window suggestions using sample events.</p><button type="button">Activate agent</button>
            </article>
          </div>
          <div class="agent-log" id="agentLog" aria-live="polite">08:12 · Inbox Agent found two fictional messages for review.</div>
        </article>

        <article class="demo-panel scenario-panel">
          <div class="scenario-panel-head">
            <div><small class="scenario-label">FICTIONAL WORKFLOW</small><h3>One operating layer throughout a demo day</h3></div>
            <span class="scenario-count">Sample timeline</span>
          </div>
          <div class="scenario-timeline">
            <article class="timeline-step" style="--step:#ff8a36"><time>08:00</time><strong>Morning brief</strong><p>Sample priorities, messages and project signals are combined.</p></article>
            <article class="timeline-step" style="--step:#ff477e"><time>09:30</time><strong>Project workshop</strong><p>Fictional project context is ready for review.</p></article>
            <article class="timeline-step" style="--step:#9f62ff"><time>12:15</time><strong>Agent review</strong><p>Alex approves two simulated drafts.</p></article>
            <article class="timeline-step" style="--step:#55e6a5"><time>16:30</time><strong>Market brief</strong><p>Invented movements illustrate a decision-support pattern.</p></article>
            <article class="timeline-step" style="--step:#73a8ff"><time>17:00</time><strong>Focus review</strong><p>The demo switches to a distraction-free delivery view.</p></article>
          </div>
        </article>
      </div>

      <div class="scenario-column">
        <article class="demo-panel scenario-panel">
          <div class="scenario-panel-head">
            <div><small class="scenario-label">FICTIONAL UNIFIED INBOX</small><h3>Needs attention</h3></div>
            <span class="scenario-count" id="inboxCount">4 items</span>
          </div>
          <div class="scenario-list" id="scenarioInbox">
            <article class="scenario-message"><span class="message-icon">MC</span><div><strong>Maya Chen · Revised proposal</strong><small>Invented client · Northstar Mail</small></div><button type="button" aria-label="Dismiss fictional message">✓</button></article>
            <article class="scenario-message"><span class="message-icon">NM</span><div><strong>Nova Markets · Demo alert</strong><small>Simulated notification · NOVA +1.8%</small></div><button type="button" aria-label="Dismiss fictional message">✓</button></article>
            <article class="scenario-message"><span class="message-icon">⌁</span><div><strong>Research Scout · Brief ready</strong><small>Fictional project · 6 sample sources summarized</small></div><button type="button" aria-label="Dismiss fictional message">✓</button></article>
            <article class="scenario-message"><span class="message-icon">◷</span><div><strong>Atlas Schedule · Workshop soon</strong><small>Fictional event · Demo room prepared</small></div><button type="button" aria-label="Dismiss fictional message">✓</button></article>
          </div>
        </article>

        <article class="demo-panel scenario-panel">
          <div class="scenario-panel-head">
            <div><small class="scenario-label">FICTIONAL TASKS</small><h3>Execution queue</h3></div>
            <span class="scenario-count" id="taskCount">2 / 4 complete</span>
          </div>
          <div class="scenario-list" id="scenarioTasks">
            <label class="scenario-task done"><input type="checkbox" checked><span><strong>Review workshop brief</strong><small>Fictional Project Atlas</small></span><time class="task-time">08:45</time></label>
            <label class="scenario-task done"><input type="checkbox" checked><span><strong>Approve sample draft</strong><small>Prepared by simulated Inbox Agent</small></span><time class="task-time">09:00</time></label>
            <label class="scenario-task"><input type="checkbox"><span><strong>Send revised demo proposal</strong><small>Fictional Project Atlas</small></span><time class="task-time">11:30</time></label>
            <label class="scenario-task"><input type="checkbox"><span><strong>Review mobile prototype</strong><small>Fictional Project Nova</small></span><time class="task-time">16:00</time></label>
          </div>
        </article>

        <article class="demo-panel scenario-panel">
          <div class="scenario-panel-head">
            <div><small class="scenario-label">FICTIONAL VALUE SNAPSHOT</small><h3>Simulated demo balances</h3></div>
            <span class="scenario-count">Not real financial data</span>
          </div>
          <div class="finance-grid">
            <article class="finance-item"><small>ORBIT OPERATING · DEMO</small><strong>$12,480</strong><span>Invented available balance</span></article>
            <article class="finance-item positive"><small>NOVA INDEX · DEMO</small><strong>$28,760</strong><span>Simulated +1.8% movement</span></article>
            <article class="finance-item"><small>PROJECT BUDGET · DEMO</small><strong>$4,100 / $6,000</strong><div class="budget-track"><i style="width:68%"></i></div></article>
            <article class="finance-item"><small>DEMO NEXT ACTION</small><strong>None</strong><span>Illustration only · not financial advice</span></article>
          </div>
        </article>

        <article class="demo-panel scenario-panel">
          <div class="scenario-panel-head">
            <div><small class="scenario-label">FICTIONAL SIGNALS</small><h3>Sample briefing cards</h3></div>
            <span class="scenario-count">No external links</span>
          </div>
          <div class="news-grid">
            <button class="news-card" type="button" data-demo-launch="Beacon Business"><small>BEACON BUSINESS · DEMO</small><strong>Invented market context</strong><span>Open demo ↗</span></button>
            <button class="news-card" type="button" data-demo-launch="Signal Technology"><small>SIGNAL TECHNOLOGY · DEMO</small><strong>Invented product and AI news</strong><span>Open demo ↗</span></button>
            <button class="news-card" type="button" data-demo-launch="Orbit Sport"><small>ORBIT SPORT · DEMO</small><strong>Invented sports analysis</strong><span>Open demo ↗</span></button>
            <button class="news-card" type="button" data-demo-launch="Cedar Learning"><small>CEDAR LEARNING · DEMO</small><strong>Fictional learning queue</strong><span>Open demo ↗</span></button>
          </div>
        </article>
      </div>
    </div>
  `;

  caseStudy.parentNode.insertBefore(scenario,caseStudy);

  const desktopNav=document.querySelector('.demo-nav');
  const desktopCase=desktopNav?.querySelector('a[href="#case-study"]');
  if(desktopNav&&desktopCase){
    const link=document.createElement('a');
    link.href='#live-scenario';
    link.innerHTML='<span>◉</span>Live scenario';
    desktopNav.insertBefore(link,desktopCase);
  }

  const mobileNav=document.querySelector('.demo-mobile-nav nav');
  const mobileCase=mobileNav?.querySelector('a[href="#case-study"]');
  if(mobileNav&&mobileCase){
    const link=document.createElement('a');
    link.href='#live-scenario';
    link.textContent='Live scenario';
    mobileNav.insertBefore(link,mobileCase);
  }

  const toast=document.getElementById('demoToast');
  let toastTimer;
  function showScenarioToast(message){
    if(!toast)return;
    toast.textContent=message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer=window.setTimeout(()=>toast.classList.remove('show'),2400);
  }

  scenario.addEventListener('click',event=>{
    const demoLaunch=event.target.closest('[data-demo-launch]');
    if(demoLaunch){
      showScenarioToast(`${demoLaunch.dataset.demoLaunch} is fictional and has no external account.`);
      return;
    }

    const dismiss=event.target.closest('.scenario-message button');
    if(dismiss){
      dismiss.closest('.scenario-message').classList.add('hidden');
      const remaining=scenario.querySelectorAll('.scenario-message:not(.hidden)').length;
      document.getElementById('inboxCount').textContent=`${remaining} ${remaining===1?'item':'items'}`;
      document.getElementById('scenarioUnread').textContent=String(Math.max(0,remaining+3));
      showScenarioToast('Fictional item cleared');
      return;
    }

    const agentButton=event.target.closest('.agent-card button');
    if(agentButton){
      const card=agentButton.closest('.agent-card');
      const isActive=card.classList.toggle('active');
      card.querySelector('.agent-state').textContent=isActive?'Active':'Paused';
      agentButton.textContent=isActive?'Pause agent':'Activate agent';
      const activeCount=scenario.querySelectorAll('.agent-card.active').length;
      document.getElementById('agentSummary').textContent=`${activeCount} active`;
      document.getElementById('scenarioAgentCount').textContent=String(activeCount);
      document.getElementById('scenarioAgentMeta').textContent=`${activeCount} simulated agents online`;
      document.getElementById('agentLog').textContent=`Now · ${card.dataset.agent} ${isActive?'activated':'paused'} in the demo.`;
      showScenarioToast(`${card.dataset.agent} ${isActive?'activated':'paused'}`);
      return;
    }

    const modeButton=event.target.closest('[data-scenario-mode]');
    if(modeButton){
      scenario.querySelectorAll('[data-scenario-mode]').forEach(button=>button.classList.toggle('active',button===modeButton));
      const focus=modeButton.dataset.scenarioMode==='focus';
      document.getElementById('scenarioRole').textContent=focus
        ?'Fictional focus mode hides non-essential modules for uninterrupted prototype delivery.'
        :'Fictional product consultant coordinating client work and prototype delivery.';
      document.getElementById('scenarioNextEvent').textContent=focus?'14:00':'09:30';
      document.getElementById('scenarioNextLabel').textContent=focus?'Prototype delivery block':'Project strategy workshop';
      document.getElementById('scenarioPriorityLabel').textContent=focus?'Focus tasks completed':'Fictional tasks completed';
      showScenarioToast(`${focus?'Focus':'Studio'} mode selected`);
    }
  });

  scenario.querySelectorAll('#scenarioTasks input').forEach(input=>{
    input.addEventListener('change',()=>{
      input.closest('.scenario-task').classList.toggle('done',input.checked);
      const tasks=[...scenario.querySelectorAll('#scenarioTasks input')];
      const complete=tasks.filter(item=>item.checked).length;
      document.getElementById('taskCount').textContent=`${complete} / ${tasks.length} complete`;
      document.getElementById('scenarioPriorityStatus').textContent=`${complete} / ${tasks.length}`;
    });
  });
})();
