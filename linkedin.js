(()=>{
  if(typeof defaults==='undefined'||typeof labels==='undefined')return;

  defaults.linkedin='https://www.linkedin.com/in/marcmonferrer/';
  labels.linkedin='LinkedIn de Marc';

  if(typeof links!=='undefined'){
    links={...defaults,...links};
  }

  const privacy=document.querySelector('.privacy');
  if(privacy&&!document.querySelector('.linkedin-section')){
    privacy.insertAdjacentHTML('beforebegin',`
      <section class="linkedin-section" aria-labelledby="linkedinTitle">
        <div class="linkedin-kicker">
          <span class="linkedin-mini-logo" aria-hidden="true">in</span>
          <span>PERFIL PROFESSIONAL</span>
        </div>
        <article class="linkedin-profile-card">
          <div class="linkedin-cover">
            <span>AI CONSULTING · ACCESSIBILITAT · WEB</span>
          </div>
          <div class="linkedin-profile-body">
            <div class="linkedin-identity">
              <div class="linkedin-avatar" aria-hidden="true">MM</div>
              <div>
                <h3 id="linkedinTitle">Marc Monferrer</h3>
                <p>AI Consultant &amp; Front-End Developer</p>
                <small>Barcelona, Catalunya · Català · Castellà · English</small>
              </div>
            </div>
            <p class="linkedin-about">Transformo idees i necessitats reals en solucions pràctiques amb IA, automatització i desenvolupament web, amb una mirada especial a l’accessibilitat i la diversitat funcional.</p>
            <div class="linkedin-tags" aria-label="Especialitats">
              <span>AI Consulting</span>
              <span>Web &amp; automatització</span>
              <span>Accessibilitat</span>
            </div>
            <div class="linkedin-actions">
              <button class="linkedin-primary" data-linkedin>Veure el perfil a LinkedIn ↗</button>
              <button class="linkedin-secondary" data-open="email">Contactar per correu</button>
            </div>
          </div>
        </article>
      </section>`);
  }

  const version=document.querySelector('footer span:first-child');
  if(version)version.textContent='JARVIS HQ · v1.6';

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-linkedin]');
    if(!button)return;
    event.preventDefault();

    const url=(typeof links!=='undefined'&&links.linkedin)||defaults.linkedin;
    if(/Android/i.test(navigator.userAgent)){
      const parsed=new URL(url);
      const destination=`${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
      const fallback=encodeURIComponent(url);
      window.location.href=`intent://${destination}#Intent;scheme=https;package=com.linkedin.android;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${fallback};end`;
      return;
    }

    const link=document.createElement('a');
    link.href=url;
    link.target='_blank';
    link.rel='noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
})();
