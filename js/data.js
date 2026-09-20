const ZELO_STORE={medications:"zelo_medications",appointments:"zelo_appointments",exams:"zelo_exams",evolution:"zelo_evolution"};
const demo={medications:[{id:1,name:"Losartana 50 mg",dose:"1 comprimido",time:"08:00",status:"Ativo"}],appointments:[{id:1,date:"24/09/2026",time:"14:30",type:"Retorno",place:"Clínica da Família",status:"Agendada"}],exams:[{id:1,name:"Hemograma completo",date:"16/09/2026",status:"Laudo disponível"}],evolution:[]};
function getItems(t){let r=localStorage.getItem(ZELO_STORE[t]);if(r)return JSON.parse(r);localStorage.setItem(ZELO_STORE[t],JSON.stringify(demo[t]||[]));return demo[t]||[]}
function saveItems(t,a){localStorage.setItem(ZELO_STORE[t],JSON.stringify(a))}
function nextId(a){return a.length?Math.max(...a.map(x=>Number(x.id)||0))+1:1}
function renderCollection(t,id,fn){const e=document.getElementById(id);if(e)e.innerHTML=getItems(t).map(fn).join("")||'<p class="empty-state">Nenhum registro encontrado.</p>'}
function removeItem(t,id,render){saveItems(t,getItems(t).filter(x=>String(x.id)!==String(id)));render()}
function formStore(formId,type,fields,render){const f=document.getElementById(formId);if(!f)return;f.addEventListener("submit",e=>{e.preventDefault();let a=getItems(type),x={id:nextId(a)};fields.forEach(k=>x[k]=f.elements[k].value.trim());a.unshift(x);saveItems(type,a);f.reset();render()})}
window.ZeloData={getItems,saveItems,renderCollection,removeItem,formStore};