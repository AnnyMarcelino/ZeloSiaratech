# Zelo — versão final de desenvolvimento

Plataforma web de continuidade do cuidado com três espaços: paciente, profissional e cuidador/responsável.

## O que está funcionando
- Cadastro e login reais com MySQL + JWT.
- Senhas com hash bcrypt.
- Controle por perfil.
- Vínculos de cuidado com aprovação do paciente.
- CRUD persistente de medicamentos, consultas e exames.
- Histórico clínico e evoluções profissionais.
- Procedimentos e orientações profissionais.
- Lista de pacientes conforme vínculos ativos.
- Preferências de acessibilidade salvas por conta.
- Central de lembretes.
- Auditoria de operações de dados.
- Interface web responsiva e acessível.

## Rodar
```bash
cd ~/Zelo-completo-backend
npm install
npm start
```
Abra `http://localhost:3000`.

## Fluxo de demonstração
1. Crie uma conta paciente.
2. Crie uma conta profissional ou cuidador em outro navegador/aba anônima.
3. No perfil profissional/cuidador, abra Configurações e solicite vínculo usando o e-mail do paciente.
4. Entre como paciente e autorize o vínculo.
5. Volte ao profissional/cuidador e atualize a página.
6. O paciente passa a aparecer somente para o perfil autorizado.

## Integrações futuras
GOV.BR, SUS, operadoras, laboratórios, notificações push e armazenamento de laudos podem ser conectados posteriormente por APIs oficiais. A aplicação não afirma ter essas integrações sem credenciais/ambiente oficial.

## Segurança
Esta versão é adequada para demonstração e desenvolvimento. Antes de uso real com dados de saúde, ainda devem ser implementados HTTPS obrigatório, gestão segura de segredos, rate limiting, política de sessão/CSRF adequada ao ambiente, proteção adicional contra XSS, backups, retenção/exclusão de dados, monitoramento, revisão de permissões, testes de segurança e requisitos LGPD.
