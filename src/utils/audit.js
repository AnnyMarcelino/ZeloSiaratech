const db = require('../config/db');

async function audit({
  usuarioId = null,
  acao,
  entidade,
  entidadeId = null,
  ip = null
}) {
  try {
    await db.query(
      `INSERT INTO auditoria
        (usuario_id, acao, entidade, entidade_id, ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        usuarioId,
        acao,
        entidade,
        entidadeId,
        ip
      ]
    );
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

module.exports = audit;
