const db=require('../config/db');
async function audit({usuarioId,acao,entidade,entidadeId,ip}){
  await db.execute('INSERT INTO auditoria (usuario_id,acao,entidade,entidade_id,ip) VALUES (?,?,?,?,?)',[usuarioId,acao,entidade,entidadeId||null,ip||null]);
}
module.exports=audit;
