# ZELO — PROJETO COMPLETO

Este projeto mantém o FRONT-END e o BACK-END dentro da mesma pasta.

## Estrutura

zelo/
├── index.html
├── style.css
├── script.js
├── package.json
├── server.js
├── .env.example
├── .gitignore
├── README.md
├── src/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   ├── routes/health.js
│   ├── routes/records.js
│   └── utils/audit.js
└── database/
    ├── schema.sql
    └── seed.sql

## Como iniciar

1. Abra esta pasta no VS Code.
2. Abra o terminal dentro dela.
3. Instale as dependências:

npm install

4. Crie o banco MySQL executando:

SOURCE /caminho/para/o/projeto/database/schema.sql;

5. Crie o arquivo .env:

cp .env.example .env

6. Edite o .env com os dados do seu MySQL.

7. Inicie:

npm start

Para desenvolvimento:

npm run dev

## Teste

Abra:

http://localhost:3000

E para verificar o servidor:

http://localhost:3000/api/health

## Importante

Esta é a primeira base do backend. Antes de usar dados reais de saúde, ainda precisam ser implementados e revisados controles de autorização, integração completa com o front-end, validações, proteção contra abuso/rate limiting e outras medidas de segurança.
