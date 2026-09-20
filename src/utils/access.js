const db = require('../config/db');

async function accessiblePatients(user) {
  if (user.tipo === 'paciente') {
    return [user.id];
  }

  const result = await db.query(
    `SELECT paciente_id
     FROM vinculos_cuidado
     WHERE usuario_id = $1
       AND status = 'ativo'`,
    [user.id]
  );

  return result.rows.map(row => Number(row.paciente_id));
}

async function canAccessPatient(user, pacienteId, write = false) {
  pacienteId = Number(pacienteId);

  if (!pacienteId) {
    return false;
  }

  if (user.tipo === 'paciente') {
    return user.id === pacienteId && !write;
  }

  const result = await db.query(
    `SELECT permissoes
     FROM vinculos_cuidado
     WHERE paciente_id = $1
       AND usuario_id = $2
       AND status = 'ativo'
     LIMIT 1`,
    [pacienteId, user.id]
  );

  if (!result.rows.length) {
    return false;
  }

  if (!write) {
    return true;
  }

  const permissoes = result.rows[0].permissoes;

  if (!permissoes) {
    return false;
  }

  if (typeof permissoes === 'object') {
    return (
      permissoes.escrita === true ||
      permissoes.write === true ||
      permissoes.editar === true
    );
  }

  return false;
}

module.exports = {
  accessiblePatients,
  canAccessPatient
};
