(function(){
 const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
 const user=()=>ZeloAPI.getUser();
 const msg=(text,type='ok')=>{let e=document.getElementById('pageMessage');if(e){e.className=`page-message ${type}`;e.textContent=text;e.hidden=false;setTimeout(()=>e.hidden=true,3500)}};
 const fmtDate=v=>{if(!v)return '';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleDateString('pt-BR')};
 const fmtDateTime=v=>{if(!v)return '';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString('pt-BR')};
 async function init(type,opts={}){
  const list=document.getElementById(opts.listId);const form=document.getElementById(opts.formId);if(!list)return;
  async function render(){try{const rows=await ZeloAPI.list(type);list.innerHTML=rows.map(opts.card).join('')||'<p class="empty-state">Nenhum registro encontrado.</p>'; if(opts.after)opts.after(rows)}catch(e){list.innerHTML=`<p class="empty-state">${esc(e.message)}</p>`}}
  form?.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());try{await ZeloAPI.create(type,data);form.reset();msg('Registro salvo com sucesso.');render()}catch(err){msg(err.message,'error')}});
  list.addEventListener('click',async e=>{const b=e.target.closest('[data-delete]');if(!b)return;if(!confirm('Remover este registro?'))return;try{await ZeloAPI.remove(type,b.dataset.delete);msg('Registro removido.');render()}catch(err){msg(err.message,'error')}});
  await render(); return render;
 }
 window.ZeloClinical={init,esc,fmtDate,fmtDateTime,msg};
})();
