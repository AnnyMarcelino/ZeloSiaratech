const root=document.documentElement,body=document.body;let fontScale=1;
document.querySelector('#increaseFont')?.addEventListener('click',()=>{if(fontScale<1.3){fontScale=+(fontScale+.1).toFixed(1);root.style.setProperty('--font-scale',fontScale)}});
document.querySelector('#decreaseFont')?.addEventListener('click',()=>{if(fontScale>.8){fontScale=+(fontScale-.1).toFixed(1);root.style.setProperty('--font-scale',fontScale)}});
document.querySelector('#highContrast')?.addEventListener('click',()=>body.classList.toggle('high-contrast'));
document.querySelector('#readPage')?.addEventListener('click',()=>{if(!('speechSynthesis'in window))return alert('Seu navegador não oferece leitura de texto.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(document.querySelector('.roles-main')?.innerText||document.querySelector('main')?.innerText||'Zelo');u.lang='pt-BR';u.rate=.9;speechSynthesis.speak(u)});

document.addEventListener('DOMContentLoaded',()=>{
  const user=window.ZeloAPI?.getUser();
  document.querySelectorAll('.role-big').forEach(card=>{
    const role=card.dataset.role;
    const allowed=user?.tipo==='responsavel' ? role==='cuidador' : role===user?.tipo;
    if(!allowed){card.style.opacity='.5';card.setAttribute('aria-disabled','true');card.addEventListener('click',e=>e.preventDefault());}
    else card.addEventListener('click',()=>sessionStorage.setItem('zeloRole',role));
  });
});
