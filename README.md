# PetDogs Frontend

Interface web da Estética PetDogs, construída com React, TypeScript, Vite e Tailwind CSS.

## Executar localmente

```bash
npm install
npm run dev
```

A API é acessada pela URL definida em `VITE_API_URL`. Sem essa variável, o frontend usa `/api/v1`; durante o desenvolvimento, o Vite encaminha esse caminho para `http://localhost:3001`.

Copie `.env_example` para `.env` apenas quando precisar sobrescrever a URL padrão. Variáveis `VITE_*` são públicas no bundle e não devem conter segredos.

## Verificações

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
