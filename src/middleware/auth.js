const jwt = require('jsonwebtoken');
const db = require('../config/db');

require('dotenv').config();

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não informado.'
      });
    }

    const token = header.slice(7);

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const result = await db.query(
      `SELECT id, nome, email, tipo, status
       FROM usuarios
       WHERE id = $1
       LIMIT 1`,
      [payload.sub]
    );

    if (
      !result.rows.length ||
      result.rows[0].status !== 'ativo'
    ) {
      return res.status(401).json({
        error: 'Usuário inválido ou inativo.'
      });
    }

    req.user = result.rows[0];

    next();

  } catch (err) {
    console.error('Erro de autenticação:', err);

    return res.status(401).json({
      error: 'Token inválido ou expirado.'
    });
  }
}

function roles(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.user.tipo)) {
      return res.status(403).json({
        error: 'Permissão insuficiente.'
      });
    }

    next();
  };
}

module.exports = {
  auth,
  roles
};
