const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const audit = require('../utils/audit');

require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, tipo = 'paciente' } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: 'Nome, e-mail e senha são obrigatórios.'
      });
    }

    if (!['paciente', 'profissional', 'cuidador', 'responsavel'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de usuário inválido.'
      });
    }

    if (senha.length < 8) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 8 caracteres.'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const exists = await db.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [emailNormalizado]
    );

    if (exists.rows.length) {
      return res.status(409).json({
        error: 'E-mail já cadastrado.'
      });
    }

    const hash = await bcrypt.hash(senha, 12);

    const result = await db.query(
      `INSERT INTO usuarios
        (nome, email, senha_hash, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, tipo`,
      [
        nome.trim(),
        emailNormalizado,
        hash,
        tipo
      ]
    );

    const user = result.rows[0];

    await audit({
      usuarioId: user.id,
      acao: 'CRIAR_USUARIO',
      entidade: 'usuarios',
      entidadeId: user.id,
      ip: req.ip
    });

    res.status(201).json(user);

  } catch (e) {
    console.error('Erro no cadastro:', e);

    res.status(500).json({
      error: 'Erro ao criar usuário.',
      detail: process.env.NODE_ENV === 'development'
        ? e.message
        : undefined
    });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios.'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const result = await db.query(
      `SELECT *
       FROM usuarios
       WHERE email = $1
       LIMIT 1`,
      [emailNormalizado]
    );

    if (
      !result.rows.length ||
      result.rows[0].status !== 'ativo'
    ) {
      return res.status(401).json({
        error: 'Credenciais inválidas.'
      });
    }

    const user = result.rows[0];

    const ok = await bcrypt.compare(
      senha,
      user.senha_hash
    );

    if (!ok) {
      return res.status(401).json({
        error: 'Credenciais inválidas.'
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        tipo: user.tipo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    );

    await db.query(
      `UPDATE usuarios
       SET ultimo_login = NOW(),
           atualizado_em = NOW()
       WHERE id = $1`,
      [user.id]
    );

    await audit({
      usuarioId: user.id,
      acao: 'LOGIN',
      entidade: 'usuarios',
      entidadeId: user.id,
      ip: req.ip
    });

    res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      }
    });

  } catch (e) {
    console.error('Erro no login:', e);

    res.status(500).json({
      error: 'Erro ao entrar.',
      detail: process.env.NODE_ENV === 'development'
        ? e.message
        : undefined
    });
  }
});


router.get('/me', auth, (req, res) => {
  res.json({
    usuario: req.user
  });
});


module.exports = router;
