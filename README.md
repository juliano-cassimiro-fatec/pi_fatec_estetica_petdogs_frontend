# PetDogs Frontend

Interface web da Estética PetDogs, construída com React, TypeScript, Vite e Tailwind CSS.

## Executar localmente

```bash
npm install
npm run dev
```

A API é acessada pela URL definida em `VITE_API_URL`. Sem essa variável, o frontend usa `/api/v1`; durante o desenvolvimento, o Vite encaminha esse caminho para `http://localhost:3001`.

Copie `.env_example` para `.env` apenas quando precisar sobrescrever a URL padrão. Variáveis `VITE_*` são públicas no bundle e não devem conter segredos.

## Cadastro com verificação de e-mail

O cadastro usa o fluxo de OTP exposto pelo backend: envia o e-mail para
`POST /auth/otp/send`, valida o código de seis dígitos em `POST /auth/otp/verify`
e inclui o `verificationToken` devolvido na chamada a `POST /auth/register`.
Assim, a tela só libera nome e senha depois que o endereço foi verificado.

As credenciais do provedor de e-mail e o segredo que assina o token de
verificação pertencem exclusivamente ao ambiente do backend. Não adicione
`ONESIGNAL_APP_ID`, `ONESIGNAL_API_KEY` ou `OTP_VERIFICATION_SECRET` neste
projeto: toda variável `VITE_*` pode ser lida por quem acessa a aplicação.

## Verificações

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Testes end-to-end

Os testes Playwright ficam em um projeto independente na pasta [`e2e`](./e2e). Consulte o README desse diretório para instalar os navegadores e executar os cenários localmente. O workflow de CI executa lint, testes unitários, typecheck, build e os testes E2E em cada pull request.
