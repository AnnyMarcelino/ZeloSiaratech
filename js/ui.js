/* Zelo UI — identidade visual, ícones, temas e acessibilidade. Não toca no backend. */
(function(){
  const sprite='assets/icons.svg';
  const icons={
    '⌂':'home','💊':'pill','◷':'calendar','▣':'lab','↺':'history','✦':'spark','🩺':'doctor','♡':'care','⚙':'settings','🔔':'bell','⌕':'search','←':'back','→':'arrow','›':'arrow','⇄':'arrow','↪':'arrow','🔊':'volume','👁':'circle','◐':'circle','📅':'calendar','🧪':'lab','👥':'users','✚':'plus','✓':'check','↗':'arrow'
  };
  function svg(name, cls='ui-icon'){
    const el=document.createElement('span'); el.className=cls; el.setAttribute('aria-hidden','true');
    el.innerHTML=`<svg viewBox="0 0 24 24"><use href="${sprite}#${name}"></use></svg>`; return el;
  }
  function logo(cls='zelo-logo-full'){
    const img=document.createElement('img'); img.className=cls; img.src='assets/zelo-logo-exact.png'; img.alt='Zelo — Tenha cuidado. Tenha zelo.'; return img;
  }
  function replaceTextNode(node){
    const text=node.nodeValue; if(!text) return;
    const keys=Object.keys(icons); if(!keys.some(k=>text.includes(k))) return;
    const frag=document.createDocumentFragment(); let rest=text;
    while(rest){
      let best=null,idx=Infinity; for(const key of keys){const i=rest.indexOf(key);if(i>=0&&i<idx){idx=i;best=key;}}
      if(best===null){frag.append(rest);break;} if(idx) frag.append(rest.slice(0,idx)); frag.append(svg(icons[best])); rest=rest.slice(idx+best.length);
    }
    node.replaceWith(frag);
  }
  function scan(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||['SCRIPT','STYLE','TEXTAREA','INPUT'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(replaceTextNode);
    root.querySelectorAll?.('[data-icon]').forEach(el=>{const name=el.dataset.icon;el.replaceChildren(svg(name));});
  }
  function theme(){return localStorage.getItem('zelo-theme')||'blue'}
  function applyTheme(name){document.documentElement.dataset.theme=name;localStorage.setItem('zelo-theme',name);document.querySelectorAll('.theme-option').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme===name?'true':'false'));}
  function applyPrefs(){
    const p=JSON.parse(localStorage.getItem('zelo-a11y')||'{}');
    document.documentElement.style.setProperty('--font-scale',p.largeText?'1.12':'1');
    document.body.classList.toggle('high-contrast',!!p.contrast); document.body.classList.toggle('simple-mode',!!p.simpleMode); document.body.classList.toggle('reduced-motion',!!p.reducedMotion);
  }
  function speak(){
    if(!('speechSynthesis' in window)) return;
    const selection=window.getSelection()?.toString(); const text=selection||document.querySelector('main')?.innerText||document.body.innerText;
    speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text.slice(0,3000)));
  }
  function toggleA11y(key){const p=JSON.parse(localStorage.getItem('zelo-a11y')||'{}');p[key]=!p[key];localStorage.setItem('zelo-a11y',JSON.stringify(p));applyPrefs();}
  function addA11yDock(){
    if(document.querySelector('.accessibility-dock')) return;
    const dock=document.createElement('div');dock.className='accessibility-dock';dock.innerHTML=`<button class="accessibility-trigger" aria-label="Abrir acessibilidade" aria-expanded="false">◐</button><div class="accessibility-menu" role="menu"><button data-a11y="largeText">A+ Texto ampliado</button><button data-a11y="contrast">◐ Alto contraste</button><button data-a11y="simpleMode">Interface simplificada</button><button data-a11y="reducedMotion">Reduzir animações</button><button data-speak="1">🔊 Ler esta página</button></div>`;
    document.body.appendChild(dock); const trigger=dock.querySelector('.accessibility-trigger'); trigger.addEventListener('click',()=>{const open=dock.classList.toggle('open');trigger.setAttribute('aria-expanded',open)});
    dock.querySelectorAll('[data-a11y]').forEach(b=>b.addEventListener('click',()=>toggleA11y(b.dataset.a11y)));dock.querySelector('[data-speak]').addEventListener('click',speak);
  }
  function addThemes(){document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.themeChoice)));}
  document.addEventListener('DOMContentLoaded',()=>{
    applyTheme(theme());applyPrefs();scan(document.body);addA11yDock();addThemes();
    const observer=new MutationObserver(m=>{observer.disconnect();for(const x of m)for(const n of x.addedNodes){if(n.nodeType===3)replaceTextNode(n);else if(n.nodeType===1)scan(n)}observer.observe(document.body,{childList:true,subtree:true});});
    observer.observe(document.body,{childList:true,subtree:true});
  });
  window.ZeloUI={svg,logo,applyTheme,applyPrefs};
})();
