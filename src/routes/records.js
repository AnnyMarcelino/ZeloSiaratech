const express = require('express');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const audit = require('../utils/audit');
const {
  canAccessPatient,
  accessiblePatients
} = require('../utils/access');

const router = express.Router();

const configs = {
  medicamentos: {
    table: 'medicamentos',
    fields: [
      'nome',
      'dose',
      'horario',
      'frequencia',
      'observacoes'
    ],
    required: ['nome'],
    order: 'id DESC'
  },

  consultas: {
    table: 'consultas',
    fields: [
      'data_hora',
      'tipo',
      'local',
      'profissional',
      'status',
      'observacoes'
    ],
    required: ['data_hora'],
    order: 'data_hora DESC'
  },

  exames: {
    table: 'exames',
    fields: [
      'nome',
      'data_realizacao',
      'status',
      'laudo',
      'observacoes'
    ],
    required: ['nome'],
    order: 'data_realizacao DESC NULLS LAST, id DESC'
  },

  evolucoes: {
    table: 'evolucoes_clinicas',
    fields: [
      'data_hora',
      'tipo',
      'descricao'
    ],
    required: ['descricao'],
    order: 'data_hora DESC, id DESC'
  },

  procedimentos: {
    table: 'procedimentos',
    fields: [
      'nome',
      'data_hora',
      'descricao',
      'status'
    ],
    required: ['nome'],
    order: 'data_hora DESC NULLS LAST, id DESC'
  },

  orientacoes: {
    table: 'orientacoes',
    fields: [
      'titulo',
      'conteudo',
      'ativa'
    ],
    required: ['titulo', 'conteudo'],
    order: 'id DESC'
  }
};

const clean = value => value === '' ? null : value;

function config(type) {
  return configs[type] || null;
}

router.use(auth);


// GET
router.get('/:type', async (req, res) => {
  try {
    const c = config(req.params.type);

    if (!c) {
      return res.status(404).json({
        error: 'Recurso não encontrado.'
      });
    }

    const ids = await accessiblePatients(req.user);

    if (!ids.length) {
      return res.json([]);
    }

    const placeholders = ids
      .map((_, index) => `$${index + 1}`)
      .join(',');

    const result = await db.query(
      `SELECT *
       FROM ${c.table}
       WHERE paciente_id IN (${placeholders})
       ORDER BY ${c.order}`,
      ids
    );

    res.json(result.rows);

  } catch (e) {
    console.error('Erro ao consultar registros:', e);

    res.status(500).json({
      error: 'Erro ao consultar registros.'
    });
  }
});


// POST
router.post('/:type', async (req, res) => {
  try {
    const c = config(req.params.type);

    if (!c) {
      return res.status(404).json({
        error: 'Recurso não encontrado.'
      });
    }

    const pacienteId = Number(
      req.body?.paciente_id ||
      (req.user.tipo === 'paciente' ? req.user.id : 0)
    );

    if (
      ['evolucoes', 'procedimentos', 'orientacoes']
        .includes(req.params.type) &&
      req.user.tipo !== 'profissional'
    ) {
      return res.status(403).json({
        error: 'Somente profissionais podem registrar este tipo de informação.'
      });
    }

    if (!pacienteId) {
      return res.status(400).json({
        error: 'paciente_id é obrigatório.'
      });
    }

    if (
      !await canAccessPatient(
        req.user,
        pacienteId,
        true
      )
    ) {
      return res.status(403).json({
        error: 'Você não possui acesso de escrita para este paciente.'
      });
    }

    for (const field of c.required) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        String(req.body[field]).trim() === ''
      ) {
        return res.status(400).json({
          error: `Campo obrigatório: ${field}.`
        });
      }
    }

    const fields = c.fields.filter(field =>
      Object.prototype.hasOwnProperty.call(
        req.body,
        field
      )
    );

    if (
      req.params.type === 'evolucoes' &&
      req.user.tipo === 'profissional'
    ) {
      fields.push('profissional_id');
      req.body.profissional_id = req.user.id;
    }

    if (
      req.params.type === 'procedimentos' &&
      req.user.tipo === 'profissional'
    ) {
      fields.push('profissional_id');
      req.body.profissional_id = req.user.id;
    }

    if (
      req.params.type === 'orientacoes' &&
      req.user.tipo === 'profissional'
    ) {
      fields.push('profissional_id');
      req.body.profissional_id = req.user.id;
    }

    const columns = [
      'paciente_id',
      ...fields
    ];

    const values = [
      pacienteId,
      ...fields.map(field =>
        clean(req.body[field])
      )
    ];

    const placeholders = values
      .map((_, index) => `$${index + 1}`)
      .join(',');

    const result = await db.query(
      `INSERT INTO ${c.table}
       (${columns.join(',')})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );

    const created = result.rows[0];

    await audit({
      usuarioId: req.user.id,
      acao: 'CRIAR',
      entidade: c.table,
      entidadeId: created.id,
      ip: req.ip
    });

    res.status(201).json(created);

  } catch (e) {
    console.error('Erro ao criar registro:', e);

    res.status(500).json({
      error: 'Erro ao criar registro.',
      detail:
        process.env.NODE_ENV === 'development'
          ? e.message
          : undefined
    });
  }
});


// PATCH
router.patch('/:type/:id', async (req, res) => {
  try {
    const c = config(req.params.type);

    if (!c) {
      return res.status(404).json({
        error: 'Recurso não encontrado.'
      });
    }

    const found = await db.query(
      `SELECT *
       FROM ${c.table}
       WHERE id = $1
       LIMIT 1`,
      [req.params.id]
    );

    if (!found.rows.length) {
      return res.status(404).json({
        error: 'Registro não encontrado.'
      });
    }

    const record = found.rows[0];

    if (
      !await canAccessPatient(
        req.user,
        record.paciente_id,
        true
      )
    ) {
      return res.status(403).json({
        error: 'Sem permissão.'
      });
    }

    const fields = c.fields.filter(field =>
      Object.prototype.hasOwnProperty.call(
        req.body,
        field
      )
    );

    if (!fields.length) {
      return res.status(400).json({
        error: 'Nenhum campo válido enviado.'
      });
    }

    const sets = fields
      .map(
        (field, index) =>
          `${field} = $${index + 1}`
      )
      .join(', ');

    const values = fields.map(field =>
      clean(req.body[field])
    );

    values.push(req.params.id);

    await db.query(
      `UPDATE ${c.table}
       SET ${sets}
       WHERE id = $${values.length}`,
      values
    );

    await audit({
      usuarioId: req.user.id,
      acao: 'ATUALIZAR',
      entidade: c.table,
      entidadeId: req.params.id,
      ip: req.ip
    });

    const updated = await db.query(
      `SELECT *
       FROM ${c.table}
       WHERE id = $1`,
      [req.params.id]
    );

    res.json(updated.rows[0]);

  } catch (e) {
    console.error('Erro ao atualizar registro:', e);

    res.status(500).json({
      error: 'Erro ao atualizar registro.'
    });
  }
});


// DELETE
router.delete('/:type/:id', async (req, res) => {
  try {
    const c = config(req.params.type);

    if (!c) {
      return res.status(404).json({
        error: 'Recurso não encontrado.'
      });
    }

    const result = await db.query(
      `SELECT paciente_id
       FROM ${c.table}
       WHERE id = $1`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: 'Registro não encontrado.'
      });
    }

    if (
      !await canAccessPatient(
        req.user,
        result.rows[0].paciente_id,
        true
      )
    ) {
      return res.status(403).json({
        error: 'Sem permissão.'
      });
    }

    await db.query(
      `DELETE FROM ${c.table}
       WHERE id = $1`,
      [req.params.id]
    );

    await audit({
      usuarioId: req.user.id,
      acao: 'EXCLUIR',
      entidade: c.table,
      entidadeId: req.params.id,
      ip: req.ip
    });

    res.status(204).send();

  } catch (e) {
    console.error('Erro ao excluir registro:', e);

    res.status(500).json({
      error: 'Erro ao excluir registro.'
    });
  }
});


module.exports = router;
