/* ZELO — PASSO 5 / navegação, busca e notificações */
(function(){
 const path=location.pathname.split('/').pop()||'index.html';
 const role=document.body.classList.contains('professional')?'professional':document.body.classList.contains('caregiver')?'caregiver':'patient';
 const links={
 patient:[['paciente.html','⌂','Visão geral'],['medicamentos.html','💊','Medicamentos'],['consultas.html','◷','Consultas'],['exames.html','▣','Exames'],['orientacoes.html','✦','Orientações'],['historico.html','↺','Histórico clínico']],
 professional:[['profissional.html','⌂','Visão geral'],['pacientes.html','♙','Meus pacientes'],['agenda-profissional.html','◷','Agenda'],['exames-profissional.html','▣','Exames e laudos'],['evolucao.html','↗','Evolução clínica'],['procedimentos.html','✚','Procedimentos']],
 caregiver:[['cuidador.html','⌂','Visão geral'],['rotina.html','✓','Rotina de cuidados'],['medicamentos.html','💊','Medicamentos'],['consultas.html','◷','Consultas'],['exames.html','▣','Exames'],['orientacoes.html','✦','Orientações']]
 };
 const names={patient:'Paciente',professional:'Profissional',caregiver:'Cuidador'};
 const shell=document.createElement('aside'); shell.className='zelo-sidebar';
 shell.innerHTML=`<a class="zelo-side-brand" href="${links[role][0][0]}"><img class="side-logo" src="assets/zelo-logo-exact.png" alt="Zelo — Tenha cuidado. Tenha zelo."></a><div class="zelo-nav-label">${names[role].toUpperCase()}</div><nav class="zelo-nav">${links[role].map(x=>`<a href="${x[0]}" class="${x[0]===path?'active':''}"><span class="ico" data-icon="${({home:'home', '💊':'pill','◷':'calendar','▣':'lab','✦':'spark','↺':'history','♙':'users','↗':'arrow','✚':'plus','✓':'check'}[x[1]]||'circle')}"></span>${x[2]}</a>`).join('')}</nav><div class="zelo-side-bottom"><a href="perfis.html">⇄ Trocar espaço</a><a href="login.html">↪ Sair</a></div>`;
 document.body.prepend(shell);
 const header=document.querySelector('.dash-header');
 if(header){
   const brand=header.querySelector('.dash-brand'); if(brand) brand.style.display='none';
   const search=document.createElement('div'); search.className='zelo-top-search'; search.innerHTML='<span>⌕</span><input aria-label="Buscar no Zelo" placeholder="Buscar no Zelo..." autocomplete="off"><div class="zelo-search-results"></div>';
   const actions=header.querySelector('.dash-actions'); header.insertBefore(search,actions);
   const input=search.querySelector('input'), results=search.querySelector('.zelo-search-results');
   const searchable=links[role];
   input.addEventListener('input',()=>{const q=input.value.toLowerCase().trim(); if(!q){results.classList.remove('open');return;} const found=searchable.filter(x=>x[2].toLowerCase().includes(q)); results.innerHTML=found.length?found.map(x=>`<a href="${x[0]}">${x[1]} &nbsp; ${x[2]}</a>`).join(''):'<a href="#">Nenhum módulo encontrado</a>'; results.classList.add('open');});
   document.addEventListener('click',e=>{if(!search.contains(e.target)) results.classList.remove('open')});
   const notification=header.querySelector('.notification');
   if(notification){const panel=document.createElement('div');panel.className='zelo-notice-panel';panel.innerHTML='<h3>Notificações</h3><div class="zelo-notice"><b>Próxima consulta</b>24 de setembro · 14:30</div><div class="zelo-notice"><b>Exame para acompanhar</b>Há resultado aguardando atenção.</div><div class="zelo-notice"><b>Privacidade</b>Seu acesso é controlado pelas permissões do seu perfil.</div>';document.body.appendChild(panel);notification.addEventListener('click',e=>{e.stopPropagation();panel.classList.toggle('open')});document.addEventListener('click',e=>{if(!panel.contains(e.target)&&e.target!==notification)panel.classList.remove('open')})}
   const chip=header.querySelector('.user-chip'); if(chip){chip.style.cursor='pointer'; const menu=document.createElement('div');menu.className='zelo-profile-menu';menu.innerHTML='<a href="#">Meu perfil</a><a href="#">Preferências</a><a href="perfis.html">Trocar espaço</a><a href="login.html">Sair</a>';chip.appendChild(menu);chip.addEventListener('click',e=>{e.stopPropagation();menu.classList.toggle('open')});document.addEventListener('click',()=>menu.classList.remove('open'))}
 }
})();
