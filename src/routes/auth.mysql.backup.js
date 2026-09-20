const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const db=require('../config/db');
const {auth}=require('../middleware/auth');
const audit=require('../utils/audit');
require('dotenv').config();
const router=express.Router();

router.post('/register',async(req,res)=>{
  try{
    const {nome,email,senha,tipo='paciente'}=req.body;
    if(!nome||!email||!senha) return res.status(400).json({error:'Nome, e-mail e senha são obrigatórios.'});
    if(!['paciente','profissional','cuidador','responsavel'].includes(tipo)) return res.status(400).json({error:'Tipo de usuário inválido.'});
    if(senha.length<8) return res.status(400).json({error:'A senha deve ter pelo menos 8 caracteres.'});
    const [exists]=await db.execute('SELECT id FROM usuarios WHERE email=?',[email.trim().toLowerCase()]);
    if(exists.length) return res.status(409).json({error:'E-mail já cadastrado.'});
    const hash=await bcrypt.hash(senha,12);
    const [r]=await db.execute('INSERT INTO usuarios (nome,email,senha_hash,tipo) VALUES (?,?,?,?)',[nome.trim(),email.trim().toLowerCase(),hash,tipo]);
    await audit({usuarioId:r.insertId,acao:'CRIAR_USUARIO',entidade:'usuarios',entidadeId:r.insertId,ip:req.ip});
    res.status(201).json({id:r.insertId,nome,email:email.trim().toLowerCase(),tipo});
  }catch(e){res.status(500).json({error:'Erro ao criar usuário.',detail:process.env.NODE_ENV==='development'?e.message:undefined});}
});

router.post('/login',async(req,res)=>{
  try{
    const {email,senha}=req.body;
    if(!email||!senha) return res.status(400).json({error:'E-mail e senha são obrigatórios.'});
    const [rows]=await db.execute('SELECT * FROM usuarios WHERE email=? LIMIT 1',[email.trim().toLowerCase()]);
    if(!rows.length || rows[0].status!=='ativo') return res.status(401).json({error:'Credenciais inválidas.'});
    const user=rows[0];
    const ok=await bcrypt.compare(senha,user.senha_hash);
    if(!ok) return res.status(401).json({error:'Credenciais inválidas.'});
    const token=jwt.sign({sub:user.id,tipo:user.tipo},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'8h'});
    await db.execute('UPDATE usuarios SET ultimo_login=NOW() WHERE id=?',[user.id]);
    await audit({usuarioId:user.id,acao:'LOGIN',entidade:'usuarios',entidadeId:user.id,ip:req.ip});
    res.json({token,usuario:{id:user.id,nome:user.nome,email:user.email,tipo:user.tipo}});
  }catch(e){res.status(500).json({error:'Erro ao entrar.',detail:process.env.NODE_ENV==='development'?e.message:undefined});}
});

router.get('/me',auth,(req,res)=>res.json({usuario:req.user}));
module.exports=router;
