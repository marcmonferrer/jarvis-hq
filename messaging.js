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
    }
  };

  function openMessagingApp(key){
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

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-messaging]');
    if(!button)return;
    event.preventDefault();
    openMessagingApp(button.dataset.messaging);
  });
})();
