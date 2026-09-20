const express=require('express');
const db=require('../config/db');
const {auth}=require('../middleware/auth');
const audit=require('../utils/audit');
const {canAccessPatient, accessiblePatients}=require('../utils/access');
const router=express.Router();

const configs={
 medicamentos:{table:'medicamentos',fields:['nome','dose','horario','frequencia','observacoes'],required:['nome'],order:'id DESC'},
 consultas:{table:'consultas',fields:['data_hora','tipo','local','profissional','status','observacoes'],required:['data_hora'],order:'data_hora DESC'},
 exames:{table:'exames',fields:['nome','data_realizacao','status','laudo','observacoes'],required:['nome'],order:'data_realizacao DESC, id DESC'},
 evolucoes:{table:'evolucoes_clinicas',fields:['data_hora','tipo','descricao'],required:['descricao'],order:'data_hora DESC, id DESC'},
 procedimentos:{table:'procedimentos',fields:['nome','data_hora','descricao','status'],required:['nome'],order:'data_hora DESC, id DESC'},
 orientacoes:{table:'orientacoes',fields:['titulo','conteudo','ativa'],required:['titulo','conteudo'],order:'id DESC'}
};
const clean = v => v === '' ? null : v;
function config(type){return configs[type]||null;}

router.use(auth);
router.get('/:type',async(req,res)=>{
 try{
  const c=config(req.params.type); if(!c) return res.status(404).json({error:'Recurso não encontrado.'});
  const ids=await accessiblePatients(req.user);
  if(!ids.length) return res.json([]);
  const placeholders=ids.map(()=>'?').join(',');
  const [rows]=await db.execute(`SELECT * FROM ${c.table} WHERE paciente_id IN (${placeholders}) ORDER BY ${c.order}`,ids);
  res.json(rows);
 }catch(e){res.status(500).json({error:'Erro ao consultar registros.'});}
});

router.post('/:type',async(req,res)=>{
 try{
  const c=config(req.params.type); if(!c) return res.status(404).json({error:'Recurso não encontrado.'});
  const pacienteId=Number(req.body?.paciente_id || (req.user.tipo==='paciente'?req.user.id:0));
  if(['evolucoes','procedimentos','orientacoes'].includes(req.params.type) && req.user.tipo!=='profissional') return res.status(403).json({error:'Somente profissionais podem registrar este tipo de informação.'});
  if(!pacienteId) return res.status(400).json({error:'paciente_id é obrigatório.'});
  if(!await canAccessPatient(req.user,pacienteId,true)) return res.status(403).json({error:'Você não possui acesso de escrita para este paciente.'});
  for(const f of c.required){if(req.body[f]===undefined || req.body[f]===null || String(req.body[f]).trim()==='') return res.status(400).json({error:`Campo obrigatório: ${f}.`});}
  const fields=c.fields.filter(f=>Object.prototype.hasOwnProperty.call(req.body,f));
  if(req.params.type==='evolucoes' && req.user.tipo==='profissional') { fields.push('profissional_id'); req.body.profissional_id=req.user.id; }
  const cols=['paciente_id',...fields]; const vals=[pacienteId,...fields.map(f=>clean(req.body[f]))];
  const marks=cols.map(()=>'?').join(',');
  const [r]=await db.execute(`INSERT INTO ${c.table} (${cols.join(',')}) VALUES (${marks})`,vals);
  await audit({usuarioId:req.user.id,acao:'CRIAR',entidade:c.table,entidadeId:r.insertId,ip:req.ip});
  const [rows]=await db.execute(`SELECT * FROM ${c.table} WHERE id=?`,[r.insertId]); res.status(201).json(rows[0]);
 }catch(e){res.status(500).json({error:'Erro ao criar registro.',detail:process.env.NODE_ENV==='development'?e.message:undefined});}
});

router.patch('/:type/:id',async(req,res)=>{
 try{
  const c=config(req.params.type); if(!c)return res.status(404).json({error:'Recurso não encontrado.'});
  const [found]=await db.execute(`SELECT * FROM ${c.table} WHERE id=? LIMIT 1`,[req.params.id]);
  if(!found.length)return res.status(404).json({error:'Registro não encontrado.'});
  if(!await canAccessPatient(req.user,found[0].paciente_id,true))return res.status(403).json({error:'Sem permissão.'});
  const fields=c.fields.filter(f=>Object.prototype.hasOwnProperty.call(req.body,f));
  if(!fields.length)return res.status(400).json({error:'Nenhum campo válido enviado.'});
  const sets=fields.map(f=>`${f}=?`).join(', '), vals=fields.map(f=>clean(req.body[f]));
  vals.push(req.params.id); await db.execute(`UPDATE ${c.table} SET ${sets} WHERE id=?`,vals);
  await audit({usuarioId:req.user.id,acao:'ATUALIZAR',entidade:c.table,entidadeId:req.params.id,ip:req.ip});
  const [rows]=await db.execute(`SELECT * FROM ${c.table} WHERE id=?`,[req.params.id]);res.json(rows[0]);
 }catch(e){res.status(500).json({error:'Erro ao atualizar registro.'});}
});

router.delete('/:type/:id',async(req,res)=>{
 try{
  const c=config(req.params.type);if(!c)return res.status(404).json({error:'Recurso não encontrado.'});
  const [rows]=await db.execute(`SELECT paciente_id FROM ${c.table} WHERE id=?`,[req.params.id]);
  if(!rows.length)return res.status(404).json({error:'Registro não encontrado.'});
  if(!await canAccessPatient(req.user,rows[0].paciente_id,true))return res.status(403).json({error:'Sem permissão.'});
  await db.execute(`DELETE FROM ${c.table} WHERE id=?`,[req.params.id]);await audit({usuarioId:req.user.id,acao:'EXCLUIR',entidade:c.table,entidadeId:req.params.id,ip:req.ip});res.status(204).send();
 }catch(e){res.status(500).json({error:'Erro ao excluir registro.'});}
});
module.exports=router;
