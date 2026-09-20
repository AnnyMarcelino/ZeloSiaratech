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
      return res.json({
        medicamentos: [],
        consultas: []
      });
    }

    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');

    const medicamentos = await db.query(
      `SELECT id, paciente_id, nome, horario
       FROM medicamentos
       WHERE paciente_id IN (${placeholders})
       ORDER BY horario`,
      ids
    );

    const consultas = await db.query(
      `SELECT id, paciente_id, data_hora, tipo, local, status
       FROM consultas
       WHERE paciente_id IN (${placeholders})
         AND status IN ('agendada', 'confirmada')
       ORDER BY data_hora
       LIMIT 20`,
      ids
    );

    res.json({
      medicamentos: medicamentos.rows,
      consultas: consultas.rows
    });

  } catch (e) {
    console.error('Erro ao carregar notificações:', e);

    res.status(500).json({
      error: 'Erro ao carregar notificações.'
    });
  }
});

module.exports = router;
