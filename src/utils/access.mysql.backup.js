const db = require('../config/db');

async function canAccessPatient(user, pacienteId, write = false) {
  if (!pacienteId) return false;
  if (Number(user.id) === Number(pacienteId)) return user.tipo === 'paciente';
  if (!['profissional','cuidador','responsavel'].includes(user.tipo)) return false;
  const [rows] = await db.execute(
    `SELECT id, permissoes FROM vinculos_cuidado
     WHERE paciente_id=? AND usuario_id=? AND papel=? AND status='ativo' LIMIT 1`,
    [pacienteId, user.id, user.tipo]
  );
  if (!rows.length) return false;
  if (!write) return true;
  try {
    const p = typeof rows[0].permissoes === 'string' ? JSON.parse(rows[0].permissoes) : (rows[0].permissoes || {});
    return p.escrita !== false;
  } catch { return true; }
}

async function accessiblePatients(user) {
  if (user.tipo === 'paciente') return [Number(user.id)];
  if (!['profissional','cuidador','responsavel'].includes(user.tipo)) return [];
  const [rows] = await db.execute(
    `SELECT paciente_id FROM vinculos_cuidado WHERE usuario_id=? AND papel=? AND status='ativo'`,
    [user.id, user.tipo]
  );
  return rows.map(r => Number(r.paciente_id));
}
module.exports = { canAccessPatient, accessiblePatients };
