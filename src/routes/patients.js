const express = require('express');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { accessiblePatients } = require('../utils/access');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const ids = await accessiblePatients(req.user);

    if (!ids.length) {
      return res.json([]);
    }

    const placeholders = ids
      .map((_, index) => `$${index + 1}`)
      .join(',');

    const result = await db.query(
      `SELECT id, nome, email, tipo, status, criado_em
       FROM usuarios
       WHERE id IN (${placeholders})
       ORDER BY nome`,
      ids
    );

    res.json(result.rows);

  } catch (e) {
    console.error('Erro ao listar pacientes:', e);

    res.status(500).json({
      error: 'Erro ao listar pacientes.'
    });
  }
});


router.get('/me', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nome, email, tipo, status, criado_em
       FROM usuarios
       WHERE id = $1`,
      [req.user.id]
    );

    res.json(result.rows[0]);

  } catch (e) {
    console.error('Erro ao consultar usuário:', e);

    res.status(500).json({
      error: 'Erro ao consultar usuário.'
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const ids = await accessiblePatients(req.user);
    const pacienteId = Number(req.params.id);

    if (!ids.includes(pacienteId)) {
      return res.status(403).json({
        error: 'Sem acesso.'
      });
    }

    const result = await db.query(
      `SELECT id, nome, email, tipo, status, criado_em
       FROM usuarios
       WHERE id = $1`,
      [pacienteId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'Paciente não encontrado.'
      });
    }

    res.json(result.rows[0]);

  } catch (e) {
    console.error('Erro ao consultar paciente:', e);

    res.status(500).json({
      error: 'Erro ao consultar paciente.'
    });
  }
});


module.exports = router;
