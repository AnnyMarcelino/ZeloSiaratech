
(function(){
const $=s=>document.querySelector(s);
function read(k,f=[]){try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
const meds=()=>read("zelo_medications"), apps=()=>read("zelo_appointments"), exams=()=>read("zelo_exams"), evo=()=>read("zelo_evolution");

const ps=$("#patientSummary");
if(ps) ps.innerHTML=[["💊",meds().length,"Medicamentos"],["📅",apps().length,"Consultas"],["🧪",exams().length,"Exames"],["↺",evo().length,"Evoluções"]].map(x=>`<div class="summary-card"><strong>${x[0]} ${x[1]}</strong><span>${x[2]}</span></div>`).join("");
const na=$("#nextAppointment");
if(na){let a=apps()[0];na.innerHTML=a?`<div class="next-app"><b>${esc(a.type||"Consulta")}</b><strong>${esc(a.date||"")}</strong><span>${esc(a.time||"")} · ${esc(a.place||"Local não informado")}</span></div>`:`<p class="muted">Nenhuma consulta cadastrada.</p>`}
const ml=$("#medList");
if(ml) ml.innerHTML=meds().slice(0,4).map(m=>`<div class="mini-row"><span>💊</span><b>${esc(m.name)}</b><small>${esc(m.time||"Horário não informado")}</small></div>`).join("")||'<p class="muted">Nenhum medicamento.</p>';

const patientData=[
["Maria da Silva","Acompanhamento contínuo","acessibilidade visual"],
["João Ferreira","Retorno","tratamento em acompanhamento"],
["Luciana Alves","Exame recente","revisão pendente"],
["Pedro Martins","Acompanhamento","orientações atualizadas"]
];
function renderPatients(q=""){let el=$("#patients");if(!el)return;el.innerHTML=patientData.filter(p=>p.join(" ").toLowerCase().includes(q.toLowerCase())).map(p=>`<a class="patient-row" href="paciente-detalhe.html"><span class="patient-avatar">${p[0][0]}</span><span><b>${p[0]}</b><small>${p[1]} · ${p[2]}</small></span><span>›</span></a>`).join("")||'<p class="muted">Nenhum paciente encontrado.</p>'}
renderPatients(); $("#patientFilter")?.addEventListener("input",e=>renderPatients(e.target.value));

const cp=$("#clinicalPreview");
if(cp){let all=[...meds().map(x=>({t:"Medicamento",d:x.name+" · "+(x.dose||"")})),...apps().map(x=>({t:"Consulta",d:(x.type||"Consulta")+" · "+(x.date||"")})),...exams().map(x=>({t:"Exame",d:x.name+" · "+(x.date||"")})),...evo().map(x=>({t:"Evolução",d:x.description||x.type||"Registro"}))];cp.innerHTML=all.slice(0,7).map(x=>`<div class="clinical-line"><span></span><div><small>${esc(x.t)}</small><b>${esc(x.d)}</b></div></div>`).join("")||'<p class="muted">Sem registros.</p>'}

const tasks=["Conferir medicamento das 08:00","Conferir medicamento das 14:00","Conferir medicamento das 20:00","Verificar próxima consulta","Acompanhar hidratação","Registrar observação do dia"];
const rt=$("#routine"), rp=$("#routineProgress");
function drawRoutine(){if(!rt)return;let done=read("zelo_routine",[]);rt.innerHTML=tasks.map((t,i)=>`<label class="routine-item ${done.includes(i)?"done":""}"><input type="checkbox" data-i="${i}" ${done.includes(i)?"checked":""}><span><b>${t}</b><small>${i<3?"Rotina de medicamento":"Rotina de cuidado"}</small></span></label>`).join("");rt.querySelectorAll("input").forEach(c=>c.onchange=()=>{let d=read("zelo_routine",[]);d=c.checked?[...new Set([...d,+c.dataset.i])]:d.filter(x=>x!==+c.dataset.i);localStorage.setItem("zelo_routine",JSON.stringify(d));drawRoutine()});if(rp){let n=done.length;rp.querySelector("b").textContent=`${n} de ${tasks.length} concluídas`;rp.querySelector("i").style.width=`${n/tasks.length*100}%`}}
drawRoutine();

$("#speakPatient")?.addEventListener("click",()=>{if(!("speechSynthesis"in window))return alert("Leitura por voz não disponível.");speechSynthesis.cancel();let u=new SpeechSynthesisUtterance("Paciente Maria da Silva. Acompanhamento contínuo. Necessidades: texto ampliado, leitura por voz e orientações simples.");u.lang="pt-BR";u.rate=.9;speechSynthesis.speak(u)});

const settings=[["largeText","zelo_large_text"],["contrast","zelo_contrast"],["voice","zelo_voice"],["simpleMode","zelo_simple"]];
settings.forEach(([id,key])=>{let el=$("#"+id);if(!el)return;el.checked=localStorage.getItem(key)==="1";el.onchange=()=>localStorage.setItem(key,el.checked?"1":"0")});
if(localStorage.getItem("zelo_large_text")==="1")document.documentElement.style.setProperty("--font-scale","1.12");
if(localStorage.getItem("zelo_contrast")==="1")document.body.classList.add("high-contrast");
$("#globalSearch")?.addEventListener("keydown",e=>{if(e.key==="Enter"){let q=e.target.value.toLowerCase();let map=[["medicamento","medicamentos.html"],["consulta","consultas.html"],["exame","exames.html"],["histórico","historico.html"],["notifica","notificacoes.html"],["paciente","pacientes.html"],["orienta","orientacoes.html"]];let hit=map.find(x=>q.includes(x[0]));if(hit)location.href=hit[1]}});

})();
