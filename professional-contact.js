(()=>{
  'use strict';

  const identity=Object.freeze({
    name:'Marc Monferrer',
    role:'AI Consultant & Front-End Developer',
    location:'Barcelona',
    email:'marcmonferrer.ai@gmail.com',
    linkedin:'https://www.linkedin.com/in/marcmonferrer/'
  });

  class MarcProfessionalFooter extends HTMLElement{
    connectedCallback(){
      if(this.dataset.ready)return;
      this.dataset.ready='true';
      const footer=document.createElement('footer');
      footer.className='professional-footer';

      const name=document.createElement('strong');
      name.textContent=identity.name;
      const role=document.createElement('span');
      role.textContent=`${identity.role} · ${identity.location}`;
      const email=document.createElement('a');
      email.href=`mailto:${identity.email}`;
      email.textContent=identity.email;
      const linkedin=document.createElement('a');
      linkedin.href=identity.linkedin;
      linkedin.target='_blank';
      linkedin.rel='noopener noreferrer';
      linkedin.textContent='LinkedIn ↗';

      footer.append(name,role,email,linkedin);
      this.replaceChildren(footer);
    }
  }

  if(!customElements.get('marc-professional-footer')){
    customElements.define('marc-professional-footer',MarcProfessionalFooter);
  }
})();
