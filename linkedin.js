(()=>{
  if(typeof defaults==='undefined'||typeof labels==='undefined')return;

  defaults.linkedin='https://www.linkedin.com/in/marcmonferrer/';
  labels.linkedin='Marc\'s LinkedIn';

  if(typeof links!=='undefined'){
    links={...defaults,...links};
  }

  const profilePhoto='data:image/webp;base64,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';
  const privacy=document.querySelector('.privacy');

  if(privacy&&!document.querySelector('.linkedin-section')){
    privacy.insertAdjacentHTML('beforebegin',`
      <section class="linkedin-section" aria-labelledby="linkedinTitle">
        <div class="linkedin-kicker">
          <span class="linkedin-mini-logo" aria-hidden="true">in</span>
          <span>PROFESSIONAL PROFILE</span>
        </div>
        <article class="linkedin-profile-card">
          <div class="linkedin-cover">
            <span>AI CONSULTING · ACCESSIBILITY · WEB</span>
          </div>
          <div class="linkedin-profile-body">
            <div class="linkedin-identity">
              <img class="linkedin-avatar" src="${profilePhoto}" alt="Marc Monferrer">
              <div>
                <h3 id="linkedinTitle">Marc Monferrer</h3>
                <p>AI Consultant &amp; Front-End Developer</p>
                <small>Barcelona, Catalonia, Spain · Catalan · Spanish · English</small>
              </div>
            </div>
            <p class="linkedin-about">I turn real ideas and needs into practical solutions using AI, automation and web development, with a particular focus on accessibility and functional diversity.</p>
            <div class="linkedin-tags" aria-label="Specialties">
              <span>AI Consulting</span>
              <span>Web &amp; automation</span>
              <span>Accessibility</span>
            </div>
            <div class="linkedin-actions">
              <button class="linkedin-primary" data-linkedin>View LinkedIn profile ↗</button>
              <button class="linkedin-secondary" data-open="email">Contact by email</button>
            </div>
          </div>
        </article>
      </section>`);
  }

  const version=document.querySelector('footer span:first-child');
  if(version)version.textContent='JARVIS HQ · v1.7';

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
