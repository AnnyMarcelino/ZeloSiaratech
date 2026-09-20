# Zelo — Backend + MySQL

## 1. Pré-requisitos
- Node.js 20+ recomendado
- MySQL 8+

## 2. Instalar dependências
```bash
npm install
```

## 3. Criar banco
Entre no MySQL:
```bash
sudo mysql
```
Depois:
```sql
SOURCE /CAMINHO/DO/PROJETO/database/schema.sql;
```
O arquivo cria o banco `zelo` e o usuário `zelo_app`.

## 4. Configurar ambiente
```bash
cp .env.example .env
nano .env
```
Troque principalmente `DB_PASSWORD` e `JWT_SECRET`.

## 5. Rodar
```bash
npm start
```
Durante desenvolvimento:
```bash
npm run dev
```

API: http://localhost:3000/api
Health: http://localhost:3000/api/health

## Endpoints iniciais
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/medicamentos`
- POST `/api/medicamentos`
- DELETE `/api/medicamentos/:id`
- GET/POST/DELETE `/api/consultas`
- GET/POST/DELETE `/api/exames`
- GET/POST/DELETE `/api/evolucoes`

Envie o JWT como:
`Authorization: Bearer SEU_TOKEN`

## Importante
Este é o primeiro esqueleto funcional do backend. Ele já usa hash de senha, JWT, permissões por tipo de usuário, pool MySQL, Helmet, CORS e auditoria básica. Antes de qualquer uso real em saúde, ainda precisam ser implementados revisão de autorização por vínculo, validação rigorosa, rate limiting, gestão de sessão/token, proteção contra abuso, logs seguros, backup, criptografia adequada em repouso/trânsito e requisitos legais/organizacionais aplicáveis.
