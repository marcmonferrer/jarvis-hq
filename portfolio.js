(()=>{
  const assets=[
    {
      key:'fidelity',
      name:'Fidelity MSCI World',
      short:'FW',
      symbol:'IE00BYX5NX33.SG',
      quoteUrl:'https://finance.yahoo.com/quote/IE00BYX5NX33.SG/',
      detail:'Core index fund'
    },
    {
      key:'ftse',
      name:'FTSE All-World',
      short:'FT',
      symbol:'VWCE.DE',
      quoteUrl:'https://finance.yahoo.com/quote/VWCE.DE/',
      detail:'Global ETF'
    },
    {
      key:'nasdaq',
      name:'Nasdaq-100',
      short:'NQ',
      symbol:'SXRV.DE',
      quoteUrl:'https://finance.yahoo.com/quote/SXRV.DE/',
      detail:'Technology ETF'
    },
    {
      key:'spacex',
      name:'SpaceX Exposure',
      short:'SX',
      symbol:'DXYZ',
      quoteUrl:'https://finance.yahoo.com/quote/DXYZ/',
      detail:'Indirect · Destiny Tech100'
    }
  ];

  const cacheKey='jarvis-hq-market-cache-v1';
  const quoteState=new Map();
  let refreshButton;
  let updatedLabel;

  function readCache(){
    try{return JSON.parse(localStorage.getItem(cacheKey)||'{}');}
    catch{return {};}
  }

  function writeCache(cache){
    try{localStorage.setItem(cacheKey,JSON.stringify(cache));}
    catch{}
  }

  function formatTime(unixSeconds){
    if(!Number.isFinite(unixSeconds))return '';
    try{
      return new Intl.DateTimeFormat('en-GB',{
        hour:'2-digit',
        minute:'2-digit',
        timeZone:'Europe/Madrid'
      }).format(new Date(unixSeconds*1000));
    }catch{return '';}
  }

  function directionFor(percent){
    if(percent>.005)return 'up';
    if(percent<-.005)return 'down';
    return 'flat';
  }

  function formatPercent(percent){
    if(!Number.isFinite(percent))return '—';
    const direction=directionFor(percent);
    const marker=direction==='up'?'▲ +':direction==='down'?'▼ −':'• ';
    return `${marker}${Math.abs(percent).toFixed(2)}%`;
  }

  function statusText(data){
    if(data.source==='cache')return `Saved data · ${formatTime(data.timestamp)}`;
    if(data.marketState==='REGULAR')return `Market open · ${formatTime(data.timestamp)}`;
    if(data.marketState==='PRE')return `Pre-market · ${formatTime(data.timestamp)}`;
    if(data.marketState==='POST')return `After hours · ${formatTime(data.timestamp)}`;
    return `Last session · ${formatTime(data.timestamp)}`;
  }

  function getCard(asset){
    return document.querySelector(`[data-market-card="${asset.key}"]`);
  }

  function applyData(asset,data){
    const card=getCard(asset);
    if(!card)return;

    const direction=directionFor(data.percent);
    card.className=`market-card ${direction}`;
    card.querySelector('.market-change').textContent=formatPercent(data.percent);
    card.querySelector('.market-status').textContent=statusText(data);
    card.setAttribute('aria-label',`${asset.name}: ${data.percent>=0?'up':'down'} ${Math.abs(data.percent).toFixed(2)} percent today. Open market quote.`);
    quoteState.set(asset.key,data);
    updateTimestamp();
  }

  function applyError(asset){
    const card=getCard(asset);
    if(!card)return;
    card.className='market-card error';
    card.querySelector('.market-change').textContent='—';
    card.querySelector('.market-status').textContent='Data unavailable';
    card.setAttribute('aria-label',`${asset.name}: market data unavailable.`);
  }

  function updateTimestamp(){
    if(!updatedLabel)return;
    const live=[...quoteState.values()].filter(item=>item.source==='live');
    const cached=[...quoteState.values()].filter(item=>item.source==='cache');

    if(live.length){
      const newest=Math.max(...live.map(item=>item.timestamp||0));
      updatedLabel.textContent=`Updated ${formatTime(newest)}`;
      return;
    }

    if(cached.length){
      updatedLabel.textContent='Showing saved data';
      return;
    }

    updatedLabel.textContent='Waiting for market data';
  }

  function calculateFromResult(result){
    const meta=result?.meta||{};
    const closes=(result?.indicators?.quote?.[0]?.close||[]).filter(value=>Number.isFinite(value));

    let current=Number(meta.regularMarketPrice);
    let previous=Number(meta.chartPreviousClose ?? meta.previousClose);

    if(!Number.isFinite(current)&&closes.length)current=closes.at(-1);
    if(!Number.isFinite(previous)&&closes.length>1)previous=closes.at(-2);

    if(!Number.isFinite(current)||!Number.isFinite(previous)||previous===0){
      throw new Error('Incomplete quote data');
    }

    const timestamp=Number(meta.regularMarketTime)||Number(result?.timestamp?.at(-1))||Math.floor(Date.now()/1000);

    return {
      percent:((current-previous)/previous)*100,
      price:current,
      previous,
      currency:meta.currency||'',
      timestamp,
      marketState:meta.marketState||'CLOSED',
      source:'live'
    };
  }

  async function fetchFromHost(asset,host){
    const url=`https://${host}/v8/finance/chart/${encodeURIComponent(asset.symbol)}?interval=1d&range=5d&includePrePost=false&events=div%2Csplits`;
    const response=await fetch(url,{cache:'no-store',mode:'cors'});
    if(!response.ok)throw new Error(`Quote request failed: ${response.status}`);
    const payload=await response.json();
    const result=payload?.chart?.result?.[0];
    if(!result)throw new Error(payload?.chart?.error?.description||'No quote returned');
    return calculateFromResult(result);
  }

  async function fetchQuote(asset){
    try{return await fetchFromHost(asset,'query1.finance.yahoo.com');}
    catch{return fetchFromHost(asset,'query2.finance.yahoo.com');}
  }

  async function loadAsset(asset,cache){
    const saved=cache[asset.key];
    if(saved&&Number.isFinite(saved.percent)){
      applyData(asset,{...saved,source:'cache'});
    }

    try{
      const data=await fetchQuote(asset);
      cache[asset.key]={...data,savedAt:Date.now()};
      writeCache(cache);
      applyData(asset,data);
    }catch{
      if(!saved)applyError(asset);
    }
  }

  async function refreshAll(){
    if(refreshButton){
      refreshButton.classList.add('loading');
      refreshButton.disabled=true;
    }

    const cache=readCache();
    await Promise.allSettled(assets.map(asset=>loadAsset(asset,cache)));

    if(refreshButton){
      refreshButton.classList.remove('loading');
      refreshButton.disabled=false;
    }
  }

  function openQuote(asset){
    const link=document.createElement('a');
    link.href=asset.quoteUrl;
    link.target='_blank';
    link.rel='noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function mount(){
    const financeCard=[...document.querySelectorAll('.routine-card')].find(card=>{
      return card.querySelector('.routine-head h4')?.textContent.trim()==='Finance';
    });
    if(!financeCard||financeCard.querySelector('.portfolio-today'))return;

    financeCard.querySelector('.app-list')?.insertAdjacentHTML('afterend',`
      <section class="portfolio-today" aria-labelledby="portfolioTodayTitle">
        <div class="portfolio-today-head">
          <div class="portfolio-today-title">
            <small>PORTFOLIO TODAY</small>
            <strong id="portfolioTodayTitle">Daily market movement</strong>
          </div>
          <button class="portfolio-refresh" type="button" aria-label="Refresh market data" title="Refresh market data">↻</button>
        </div>
        <div class="portfolio-grid">
          ${assets.map(asset=>`
            <button class="market-card loading" type="button" data-market-card="${asset.key}" aria-label="Loading ${asset.name} market data">
              <span class="market-card-top">
                <span class="market-badge">${asset.short}</span>
                <span class="market-symbol">${asset.symbol}</span>
              </span>
              <span class="market-name">${asset.name}</span>
              <span class="market-change">Loading</span>
              <span class="market-status">${asset.detail}</span>
            </button>`).join('')}
        </div>
        <div class="portfolio-note">
          <span>Market movement, not personal P/L.</span>
          <span class="portfolio-updated">Waiting for market data</span>
        </div>
      </section>`);

    refreshButton=financeCard.querySelector('.portfolio-refresh');
    updatedLabel=financeCard.querySelector('.portfolio-updated');

    refreshButton?.addEventListener('click',refreshAll);
    assets.forEach(asset=>{
      getCard(asset)?.addEventListener('click',()=>openQuote(asset));
    });

    const version=document.querySelector('footer span:first-child');
    if(version)version.textContent='JARVIS HQ · v1.8';

    refreshAll();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
