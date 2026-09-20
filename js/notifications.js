
/* Zelo — PASSO 9
   Central de notificações e lembretes baseada nos dados do localStorage.
*/
(function () {
  const KEY = "zelo_notifications";

  function read(key, fallback=[]) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function dateValue(item) {
    const raw = item.date || item.data || "";
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function buildNotifications() {
    const notifications = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    const meds = read("zelo_medications");
    meds.forEach((m, i) => {
      notifications.push({
        id:`med-${m.id ?? i}`,
        type:"medication",
        icon:"💊",
        title:"Medicamento em acompanhamento",
        text:`${m.name || "Medicamento"}${m.dosage ? " — " + m.dosage : ""}`,
        meta:m.time ? `Horário: ${m.time}` : "Confira o horário do medicamento.",
        priority:"normal"
      });
    });

    const appointments = read("zelo_appointments");
    appointments.forEach((a, i) => {
      const d = dateValue(a);
      let priority="normal", meta=a.time ? `${a.date || ""} às ${a.time}` : (a.date || "Data não informada");
      if (d) {
        const diff=Math.ceil((d-today)/86400000);
        if (diff < 0) priority="attention";
        else if (diff <= 3) priority="important";
      }
      notifications.push({
        id:`app-${a.id ?? i}`,
        type:"appointment",
        icon:"📅",
        title:"Consulta agendada",
        text:a.type || a.title || "Consulta",
        meta,
        priority
      });
    });

    const exams = read("zelo_exams");
    exams.forEach((e, i) => {
      notifications.push({
        id:`exam-${e.id ?? i}`,
        type:"exam",
        icon:"🧪",
        title:"Exame registrado",
        text:e.name || e.title || "Exame",
        meta:e.date ? `Data: ${e.date}` : "Acompanhe o resultado do exame.",
        priority:e.report || e.laudo ? "important" : "normal"
      });
    });

    const evolution = read("zelo_evolution");
    evolution.slice(-5).reverse().forEach((e, i) => {
      notifications.push({
        id:`evo-${e.id ?? i}`,
        type:"evolution",
        icon:"🩺",
        title:"Nova evolução clínica",
        text:e.description || e.type || "Registro clínico atualizado",
        meta:e.date ? `Registrado em ${e.date}` : "Atualização clínica",
        priority:"normal"
      });
    });

    return notifications;
  }

  function render() {
    const box=document.querySelector("#notification-list");
    if (!box) return;
    const data=buildNotifications();
    if (!data.length) {
      box.innerHTML=`<div class="empty-notifications">
        <span>✓</span><strong>Tudo em dia</strong>
        <p>Nenhum lembrete precisa da sua atenção agora.</p>
      </div>`;
      return;
    }
    box.innerHTML=data.map(n=>`
      <article class="notification-card ${n.priority}">
        <div class="notification-icon">${n.icon}</div>
        <div class="notification-body">
          <span class="notification-type">${esc(n.title)}</span>
          <h3>${esc(n.text)}</h3>
          <p>${esc(n.meta)}</p>
        </div>
        <button class="notification-dismiss" data-id="${esc(n.id)}" aria-label="Ocultar">×</button>
      </article>
    `).join("");

    box.querySelectorAll(".notification-dismiss").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const hidden=read(KEY);
        hidden.push(btn.dataset.id);
        localStorage.setItem(KEY, JSON.stringify([...new Set(hidden)]));
        btn.closest(".notification-card").remove();
      });
    });
  }

  function init() {
    render();
    window.addEventListener("storage", render);
  }

  window.ZeloNotifications={render, buildNotifications};
  document.addEventListener("DOMContentLoaded", init);
})();
