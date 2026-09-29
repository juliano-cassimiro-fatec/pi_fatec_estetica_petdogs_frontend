# PetDogs Frontend

Interface React/TypeScript da Estética PetDogs. O frontend usa a API existente do backend para autenticação, autorização e recuperação de senha; não implementa regras de JWT, SMTP ou redefinição no navegador.

## Execução

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` caso precise apontar a aplicação para uma API fora do proxy local.
3. Execute `npm run dev`.

Os comandos disponíveis são:

- `npm run dev`: inicia o Vite em desenvolvimento;
- `npm run build`: executa a verificação TypeScript e gera o bundle de produção;
- `npm run typecheck`: verifica os tipos TypeScript;
- `npm run lint`: executa o ESLint;
- `npm run format:check`: valida a formatação;
- `npm run check`: executa todas as verificações de qualidade e o build.

## Configuração e integração com o backend

Use `VITE_API_URL` para configurar a URL base da API, incluindo o prefixo `/api/v1`:

```env
VITE_API_URL=http://localhost:3001/api/v1
```

Se ela não for definida em desenvolvimento, o cliente usa `/api/v1` e o proxy do Vite encaminha as requisições para o backend local. Os endereços padrão são:

- Backend: <http://localhost:3001>
- API: <http://localhost:3001/api/v1>
- Swagger: <http://localhost:3001/api/docs>

Variáveis do frontend são públicas no bundle. **Nunca** coloque `JWT_SECRET`, `SMTP_USER`, `SMTP_PASSWORD` ou `MONGO_URI` em `.env` deste projeto. A configuração de Gmail/SMTP e a assinatura do JWT pertencem somente ao backend.

## Autenticação

- Login usa `POST /auth/login` e cadastro usa `POST /auth/register`.
- Após login ou cadastro, a sessão devolvida pela API é armazenada no navegador. O token JWT é acrescentado apenas às requisições autenticadas.
- Ao iniciar a aplicação, uma sessão armazenada é validada em `GET /auth/me`; até essa validação, rotas privadas não são renderizadas.
- Uma resposta `401` limpa a sessão e bloqueia novamente as rotas protegidas. Respostas `403` exibem a mensagem de permissão sem encerrar a sessão.
- O logout remove token e usuário armazenado, atualiza o contexto de autenticação e redireciona para o login.
- Atualmente `/app/dashboard` é protegida. A interface respeita os papéis retornados pela API (`admin`, `profissional` e `cliente`), mas o backend continua sendo a autoridade de autorização.

## Recuperação de senha

1. Na tela de login, selecione **Esqueci minha senha**.
2. Em `/forgot-password`, informe o e-mail. O frontend chama `POST /auth/forgot-password` com `{ "email": "..." }` e sempre apresenta uma confirmação genérica quando a solicitação é aceita.
3. O backend processa a solicitação e envia o e-mail usando sua configuração de Gmail/SMTP.
4. O usuário abre o link recebido, que aponta para `/reset-password?token=...`.
5. Em `/reset-password`, informa e confirma a nova senha. O frontend chama `POST /auth/reset-password` com `{ "token": "...", "password": "..." }`.
6. Se o token for inválido, expirado ou já utilizado, a tela orienta o usuário a solicitar um novo link. Em caso de sucesso, o usuário é redirecionado para o login; não há login automático.

Os endpoints de recuperação, login e cadastro são públicos. O token de recuperação permanece somente no parâmetro recebido e não é persistido nem registrado em logs.
