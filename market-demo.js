(()=>{
  'use strict';

  const root=document.querySelector('[data-market-demo]');
  if(!root)return;

  const escapeHtml=value=>String(value).replace(/[&<>"']/g,character=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[character]);

  function showUnavailable(){
    root.setAttribute('aria-busy','false');
    root.innerHTML=`
      <div class="market-demo-error">
        <div><strong>Fictional market demo unavailable</strong><span>The rest of JARVIS HQ remains available.</span></div>
      </div>`;
  }

  fetch('fictional-market-data.json',{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data=>{
      if(data?.fictional!==true||!Array.isArray(data.assets))throw new Error('Unsafe market data');
      const cards=data.assets.map(asset=>{
        const change=Number(asset.change_percent);
        const direction=change<0?'negative':'';
        const prefix=change>0?'+':'';
        return `
          <article class="market-demo-card">
            <header>
              <span class="market-demo-symbol">${escapeHtml(asset.symbol)} · DEMO</span>
              <span class="market-demo-change ${direction}">${prefix}${change.toFixed(1)}%</span>
            </header>
            <h3>${escapeHtml(asset.name)}</h3>
            <strong>${Number(asset.value).toFixed(2)} pts</strong>
            <footer>Simulated value · not a real security</footer>
          </article>`;
      }).join('');

      root.setAttribute('aria-busy','false');
      root.innerHTML=`
        <div class="market-demo-heading">
          <div><small>FICTIONAL DATASET</small><p>${escapeHtml(data.disclaimer)}</p></div>
          <span class="market-demo-badge">SIMULATION ONLY</span>
        </div>
        <div class="market-demo-grid">${cards}</div>`;
    })
    .catch(showUnavailable);
})();
