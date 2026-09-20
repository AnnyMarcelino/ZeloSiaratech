const express = require('express');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.use(auth);


// Listar vínculos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        v.*,
        p.nome AS paciente_nome,
        u.nome AS usuario_nome,
        u.email AS usuario_email
       FROM vinculos_cuidado v
       JOIN usuarios p
         ON p.id = v.paciente_id
       JOIN usuarios u
         ON u.id = v.usuario_id
       WHERE v.paciente_id = $1
          OR v.usuario_id = $1
       ORDER BY v.id DESC`,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (e) {
    console.error('Erro ao consultar vínculos:', e);

    res.status(500).json({
      error: 'Erro ao consultar vínculos.'
    });
  }
});


// Solicitar vínculo
router.post('/request', async (req, res) => {
  try {
    const email = String(
      req.body?.email || ''
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: 'Informe o e-mail.'
      });
    }

    if (
      ![
        'cuidador',
        'responsavel',
        'profissional'
      ].includes(req.user.tipo)
    ) {
      return res.status(403).json({
        error: 'Este perfil não solicita vínculos.'
      });
    }

    const patient = await db.query(
      `SELECT id
       FROM usuarios
       WHERE email = $1
         AND tipo = 'paciente'
       LIMIT 1`,
      [email]
    );

    if (!patient.rows.length) {
      return res.status(404).json({
        error: 'Paciente não encontrado.'
      });
    }

    const pacienteId = patient.rows[0].id;

    const permissoes = {
      leitura: true,
      escrita: false
    };

    const result = await db.query(
      `INSERT INTO vinculos_cuidado
        (
          paciente_id,
          usuario_id,
          papel,
          permissoes,
          status
        )
       VALUES ($1, $2, $3, $4::jsonb, 'pendente')
       ON CONFLICT (paciente_id, usuario_id, papel)
       DO UPDATE SET
         status = 'pendente',
         permissoes = EXCLUDED.permissoes
       RETURNING *`,
      [
        pacienteId,
        req.user.id,
        req.user.tipo,
        JSON.stringify(permissoes)
      ]
    );

    await audit({
      usuarioId: req.user.id,
      acao: 'SOLICITAR_VINCULO',
      entidade: 'vinculos_cuidado',
      entidadeId: result.rows[0].id,
      ip: req.ip
    });

    res.status(201).json({
      message: 'Solicitação enviada.',
      vinculo: result.rows[0]
    });

  } catch (e) {
    console.error('Erro ao solicitar vínculo:', e);

    res.status(500).json({
      error: 'Erro ao solicitar vínculo.'
    });
  }
});


// Atualizar vínculo
router.patch('/:id', async (req, res) => {
  try {
    const status = req.body?.status;

    if (!['ativo', 'revogado'].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido.'
      });
    }

    const result = await db.query(
      `SELECT *
       FROM vinculos_cuidado
       WHERE id = $1
       LIMIT 1`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'Vínculo não encontrado.'
      });
    }

    const vinculo = result.rows[0];

    if (
      Number(vinculo.paciente_id) !==
      Number(req.user.id)
    ) {
      return res.status(403).json({
        error: 'Somente o paciente pode autorizar este vínculo.'
      });
    }

    const permissoes =
      req.body.permissoes || {
        leitura: true,
        escrita: false
      };

    const updated = await db.query(
      `UPDATE vinculos_cuidado
       SET
         status = $1,
         permissoes = $2::jsonb
       WHERE id = $3
       RETURNING *`,
      [
        status,
        JSON.stringify(permissoes),
        req.params.id
      ]
    );

    await audit({
      usuarioId: req.user.id,
      acao: 'ATUALIZAR_VINCULO',
      entidade: 'vinculos_cuidado',
      entidadeId: req.params.id,
      ip: req.ip
    });

    res.json({
      message: 'Vínculo atualizado.',
      vinculo: updated.rows[0]
    });

  } catch (e) {
    console.error('Erro ao atualizar vínculo:', e);

    res.status(500).json({
      error: 'Erro ao atualizar vínculo.'
    });
  }
});


module.exports = router;
