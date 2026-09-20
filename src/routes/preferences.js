const express = require('express');
const db = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);


// Buscar preferências
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM preferencias_usuario
       WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.json({
        usuario_id: req.user.id,
        fonte_ampliada: false,
        alto_contraste: false,
        leitura_voz: false,
        interface_simplificada: false
      });
    }

    res.json(result.rows[0]);

  } catch (e) {
    console.error('Erro ao carregar preferências:', e);

    res.status(500).json({
      error: 'Erro ao carregar preferências.'
    });
  }
});


// Salvar preferências
router.put('/', async (req, res) => {
  try {
    const allowed = [
      'fonte_ampliada',
      'alto_contraste',
      'leitura_voz',
      'interface_simplificada'
    ];

    const values = allowed.map(
      key => Boolean(req.body?.[key])
    );

    const result = await db.query(
      `INSERT INTO preferencias_usuario
        (
          usuario_id,
          fonte_ampliada,
          alto_contraste,
          leitura_voz,
          interface_simplificada
        )
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (usuario_id)
       DO UPDATE SET
         fonte_ampliada = EXCLUDED.fonte_ampliada,
         alto_contraste = EXCLUDED.alto_contraste,
         leitura_voz = EXCLUDED.leitura_voz,
         interface_simplificada = EXCLUDED.interface_simplificada
       RETURNING *`,
      [
        req.user.id,
        ...values
      ]
    );

    res.json(result.rows[0]);

  } catch (e) {
    console.error('Erro ao salvar preferências:', e);

    res.status(500).json({
      error: 'Erro ao salvar preferências.'
    });
  }
});


module.exports = router;
