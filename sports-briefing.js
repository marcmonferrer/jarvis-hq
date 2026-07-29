(()=>{
  'use strict';

  const roots=[...document.querySelectorAll('[data-sports-briefing]')];
  if(!roots.length)return;

  const cacheKey='jarvis-hq-sports-cache-v1';
  const configUrl='sports-favourites.json';
  const feedUrl='sports-data.json';
  const fallbackConfig={
    featured:{key:'fc-barcelona',name:'FC Barcelona',short:'FCB',sport:'Football',accent:'#a50044'},
    compact:[
      {key:'flyers',name:'Philadelphia Flyers',short:'PHI',sport:'NHL',accent:'#f74902'},
      {key:'eagles',name:'Philadelphia Eagles',short:'PHI',sport:'NFL',accent:'#004c54'},
      {key:'sixers',name:'Philadelphia 76ers',short:'PHI',sport:'NBA',accent:'#006bb6'},
      {key:'phillies',name:'Philadelphia Phillies',short:'PHI',sport:'MLB',accent:'#e81828'}
    ]
  };

  function escapeHtml(value){
    return String(value??'')
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  function readCache(){
    try{return JSON.parse(localStorage.getItem(cacheKey)||'null');}
    catch{return null;}
  }

  function writeCache(value){
    try{localStorage.setItem(cacheKey,JSON.stringify(value));}
    catch{}
  }

  function formatDate(value,timeZone){
    if(!value)return null;
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return null;
    return new Intl.DateTimeFormat('en-GB',{
      weekday:'short',day:'numeric',month:'short',timeZone
    }).format(date);
  }

  function formatTime(value,timeZone){
    if(!value)return null;
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return null;
    return new Intl.DateTimeFormat('en-GB',{
      hour:'2-digit',minute:'2-digit',hour12:false,timeZone
    }).format(date);
  }

  function placeLabel(event){
    if(event?.home_away==='home')return 'Home';
    if(event?.home_away==='away')return 'Away';
    if(event?.home_away==='neutral')return 'Neutral venue';
    return null;
  }

  function resultText(event){
    if(!event)return 'No verified recent result';
    const result=event.result||'';
    const score=Number.isFinite(event.team_score)&&Number.isFinite(event.opponent_score)
      ?`${event.team_score}–${event.opponent_score}`
      :'Score unavailable';
    return `${result?`${result} `:''}${score} vs ${escapeHtml(event.opponent)}`;
  }

  function resultClass(event){
    if(event?.result==='W')return 'win';
    if(event?.result==='L')return 'loss';
    return 'draw';
  }

  function eventMeta(event,timeZone,{includeVenue=true}={}){
    if(!event)return '';
    const items=[
      event.competition&&`<span>${escapeHtml(event.competition)}</span>`,
      event.date&&`<span>${escapeHtml(formatDate(event.date,timeZone)||'Date unavailable')}</span>`,
      includeVenue&&event.venue&&`<span>${escapeHtml(event.venue)}</span>`
    ].filter(Boolean);
    return items.join('');
  }

  function fixtureCard(event,index,timeZone){
    if(!event){
      return `<article class="sports-fixture">
        <div class="sports-fixture-index"><b>NEXT ${index}</b><small>UNCONFIRMED</small></div>
        <strong class="sports-opponent">Fixture not scheduled</strong>
        <span class="sports-when">No verified date is available yet.</span>
        <div class="sports-meta"><span>Updates automatically when published.</span></div>
      </article>`;
    }
    const date=formatDate(event.date,timeZone);
    const time=formatTime(event.date,timeZone);
    const place=placeLabel(event);
    return `<article class="sports-fixture">
      <div class="sports-fixture-index"><b>NEXT ${index}</b><small>${escapeHtml(place||'FIXTURE')}</small></div>
      <strong class="sports-opponent">${escapeHtml(event.opponent)}</strong>
      <span class="sports-when">${escapeHtml(date||'Date unavailable')}${time?` · ${escapeHtml(time)}`:''}</span>
      <div class="sports-meta">
        ${event.competition?`<span>${escapeHtml(event.competition)}</span>`:''}
        ${event.venue?`<span>${escapeHtml(event.venue)}</span>`:'<span>Venue not announced</span>'}
      </div>
    </article>`;
  }

  function featuredCard(config,data){
    if(!data)return unavailableCard(config.name);
    const status=escapeHtml(data.status||'Status unavailable');
    const offSeason=/off-season/i.test(data.status||'');
    const latest=data.latest;
    return `<article class="sports-featured" style="--team-accent:${escapeHtml(config.accent)}">
      <div class="sports-featured-head">
        <div class="sports-identity">
          <span class="sports-badge">${escapeHtml(config.short)}</span>
          <div><small>FEATURED · ${escapeHtml(config.sport)}</small><h4>${escapeHtml(config.name)}</h4></div>
        </div>
        <span class="sports-state${offSeason?' off-season':''}">${status}</span>
      </div>
      <div class="sports-featured-grid">
        <article class="sports-latest">
          <div>
            <span class="sports-kicker">LATEST RESULT</span>
            <strong class="sports-latest-score ${resultClass(latest)}">${resultText(latest)}</strong>
            <div class="sports-meta">${eventMeta(latest,'Europe/Madrid')}</div>
          </div>
          <div class="sports-meta"><span>${latest?.home_away?escapeHtml(placeLabel(latest)):''}</span></div>
        </article>
        <div class="sports-fixtures">
          ${fixtureCard(data.next?.[0],1,'Europe/Madrid')}
          ${fixtureCard(data.next?.[1],2,'Europe/Madrid')}
        </div>
      </div>
    </article>`;
  }

  function compactEvent(label,event,isLatest=false){
    if(!event){
      return `<div class="sports-event-row"><small>${label}</small><strong>${isLatest?'No verified recent result':'No game currently scheduled'}</strong><span>Updates when official data is available.</span></div>`;
    }
    const date=formatDate(event.date,'America/New_York');
    const time=formatTime(event.date,'America/New_York');
    const headline=isLatest
      ?resultText(event)
      :`${placeLabel(event)==='Home'?'vs':'@'} ${escapeHtml(event.opponent)}`;
    return `<div class="sports-event-row">
      <small>${label}</small>
      <strong>${headline}</strong>
      <span>${escapeHtml(date||'Date unavailable')}${!isLatest&&time?` · ${escapeHtml(time)} ET`:''}${event.venue?` · ${escapeHtml(event.venue)}`:''}</span>
    </div>`;
  }

  function compactCard(config,data){
    if(!data)return unavailableCard(config.name,true,config.accent);
    const offSeason=/off-season/i.test(data.status||'');
    const record=data.record||'—';
    const standing=data.standing||(/off-season/i.test(data.status||'')?'Final standing unavailable':'Standing unavailable');
    return `<article class="sports-team-card" style="--team-accent:${escapeHtml(config.accent)}">
      <div class="sports-team-head">
        <span class="sports-badge">${escapeHtml(config.short)}</span>
        <span class="sports-league">${escapeHtml(config.sport)}</span>
      </div>
      <h4>${escapeHtml(config.name)}</h4>
      <span class="sports-team-status">${escapeHtml(data.status||'Status unavailable')}</span>
      <div class="sports-record">
        <strong>${escapeHtml(record)}</strong>
        <small>${escapeHtml(data.record_season?`${data.record_season}${offSeason?' final':''}`:'RECORD')}</small>
        <span>${escapeHtml(standing)}</span>
      </div>
      <div class="sports-team-events">
        ${compactEvent('LATEST',data.latest,true)}
        ${compactEvent('NEXT GAME',data.next,false)}
      </div>
    </article>`;
  }

  function unavailableCard(name,compact=false,accent='var(--pink)'){
    if(compact){
      return `<article class="sports-team-card" style="--team-accent:${escapeHtml(accent)}">
        <span class="sports-league">DATA UNAVAILABLE</span>
        <h4>${escapeHtml(name)}</h4>
        <span class="sports-team-status">Live sports data could not be verified.</span>
        <div class="sports-unavailable"><div><strong>Unable to load</strong><span>No result or fixture has been assumed.</span></div></div>
      </article>`;
    }
    return `<article class="sports-unavailable"><div><strong>${escapeHtml(name)}</strong><span>Live sports data is unavailable. No result or fixture has been assumed.</span></div></article>`;
  }

  function freshness(generatedAt,cached){
    const date=new Date(generatedAt);
    if(Number.isNaN(date.getTime()))return cached?'Saved sports data':'Sports data loaded';
    const hours=Math.max(0,Math.round((Date.now()-date.getTime())/3600000));
    if(hours<1)return cached?'Saved less than an hour ago':'Updated less than an hour ago';
    return `${cached?'Saved':'Updated'} ${hours}h ago`;
  }

  function render(config,feed,{cached=false}={}){
    const teams=feed?.teams||{};
    roots.forEach(root=>{
      root.innerHTML=`
        ${featuredCard(config.featured,teams[config.featured.key])}
        <div class="sports-compact-grid">
          ${config.compact.map(team=>compactCard(team,teams[team.key])).join('')}
        </div>
        <div class="sports-feed-note">
          <span>${escapeHtml(freshness(feed?.generated_at,cached))} · Public schedules and results only.</span>
          <button type="button" data-sports-refresh>Refresh</button>
        </div>`;
    });
    document.querySelectorAll('[data-sports-refresh]').forEach(button=>button.addEventListener('click',refresh));
  }

  function renderUnavailable(config){
    roots.forEach(root=>{
      root.innerHTML=`
        ${unavailableCard(config.featured.name)}
        <div class="sports-compact-grid">${config.compact.map(team=>unavailableCard(team.name,true,team.accent)).join('')}</div>
        <div class="sports-feed-note"><span>Sports data is temporarily unavailable. No values have been invented.</span><button type="button" data-sports-refresh>Retry</button></div>`;
    });
    document.querySelectorAll('[data-sports-refresh]').forEach(button=>button.addEventListener('click',refresh));
  }

  async function fetchJson(url){
    const response=await fetch(`${url}?ts=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`${url} returned ${response.status}`);
    return response.json();
  }

  let refreshing=false;
  async function refresh(){
    if(refreshing)return;
    refreshing=true;
    roots.forEach(root=>root.setAttribute('aria-busy','true'));
    let config;
    try{
      config=await fetchJson(configUrl);
      const feed=await fetchJson(feedUrl);
      if(!feed?.teams||!config?.featured||!Array.isArray(config?.compact))throw new Error('Invalid sports feed');
      writeCache({config,feed});
      render(config,feed);
    }catch{
      const cached=readCache();
      if(cached?.config&&cached?.feed)render(cached.config,cached.feed,{cached:true});
      else renderUnavailable(config?.featured&&Array.isArray(config?.compact)?config:fallbackConfig);
    }finally{
      refreshing=false;
      roots.forEach(root=>root.setAttribute('aria-busy','false'));
    }
  }

  refresh();
})();
