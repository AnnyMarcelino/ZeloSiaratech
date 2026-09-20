const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

async function auth(req,res,next){
  try{
    const header=req.headers.authorization || '';
    if(!header.startsWith('Bearer ')) return res.status(401).json({error:'Token não informado.'});
    const token=header.slice(7);
    const payload=jwt.verify(token,process.env.JWT_SECRET);
    const [rows]=await db.execute('SELECT id,nome,email,tipo,status FROM usuarios WHERE id=? LIMIT 1',[payload.sub]);
    if(!rows.length || rows[0].status!=='ativo') return res.status(401).json({error:'Usuário inválido ou inativo.'});
    req.user=rows[0];
    next();
  }catch(err){return res.status(401).json({error:'Token inválido ou expirado.'});}
}
function roles(...allowed){return (req,res,next)=>{if(!allowed.includes(req.user.tipo))return res.status(403).json({error:'Permissão insuficiente.'});next();};}
module.exports={auth,roles};
