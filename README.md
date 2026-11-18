# Estética PetDogs — frontend

Aplicação React, TypeScript e Vite. Requer Node.js 24 e npm.

```bash
npm ci
npm run dev
```

Em desenvolvimento, o Vite encaminha `/api` para `http://localhost:3001`. A variável `VITE_API_URL` pode definir outra URL de API antes da compilação.

## Verificações e testes

```bash
npm run check
npx tsc --noEmit -p playwright/tsconfig.json
npm run test:coverage
npx playwright install chromium
npm run test:e2e
```

Os testes unitários ficam ao lado dos arquivos em `src/` e usam Vitest; o relatório inclui todos os arquivos executáveis de `src/` e fica em `coverage/`. Os casos usam identificadores CT independentes neste repositório. Os testes Playwright ficam em `playwright/`; os de `public/` simulam as respostas da API, enquanto os de `fullstack/` usam API e banco reais. Para depuração interativa dos testes públicos, use `npm run test:e2e:ui`. Os rastros de falhas são mantidos em `test-results/`.

Para executar os testes reais de interface, API e banco:

1. Posicione o backend ao lado deste diretório, em `../pi_fatec_estetica_petdogs_backend`, ou informe seu caminho absoluto em `BACKEND_DIR`.
2. No backend, execute `npm ci` e `npm run build`.
3. No frontend, execute `npx playwright install chromium` e `npm run test:fullstack`.

Essa suíte inicia uma API em porta temporária, um frontend na porta 4174 e um MongoDB temporário em loopback; a primeira execução baixa o binário do MongoDB. O backend usa credenciais fictícias e um diretório temporário, sem ler o `.env` do projeto. SMTP não é configurado: os testes não validam a entrega real de e-mails. Os dados e processos de teste são removidos ao término normal.

## CI e imagem de produção

O GitHub Actions verifica ESLint, Prettier, compilação, cobertura unitária e os dois conjuntos Playwright em pushes e pull requests. Para o teste real, obtém o backend público na branch `main`; a variável de repositório `BACKEND_REF` permite selecionar outra revisão publicada. Os relatórios de cobertura e os rastros de falha ficam disponíveis como artefatos. A meta de 100% ainda não é exigida, pois a cobertura atual está abaixo dela.

Os relatórios HTML do Playwright e da cobertura são guardados como artefatos em cada execução. Após sucesso na branch padrão, são publicados no GitHub Pages; os arquivos de anexos e rastros do Playwright não são publicados, mas textos e logs incorporados ao HTML são públicos. As páginas podem conter nomes de testes, erros e trechos de código, portanto os testes devem usar apenas dados fictícios. É necessário configurar o GitHub Pages para usar GitHub Actions como origem.

Os valores locais de ambiente podem ser armazenados como Actions Secrets, mas não são usados automaticamente pelos testes isolados nem pela publicação da imagem. `VITE_API_URL` é uma configuração pública embutida no frontend, não uma credencial; valores de produção devem ser configurados explicitamente quando houver implantação da aplicação.

Após o sucesso em um push para a branch padrão, publica `ghcr.io/<dono>/<repositorio>:latest` e uma tag com o SHA do commit. O pacote pode ser privado por padrão: ajuste sua visibilidade ou autentique-se no GHCR para baixá-lo. A publicação não implanta a imagem em um servidor.

Para gerar a imagem localmente, use `docker build -f Dockerfile.production -t petdogs-frontend .`. O Nginx serve a aplicação na porta 80 e encaminha `/api/` e `/uploads/` para `BACKEND_URL`, cujo padrão é `http://backend:3001`. Conecte os contêineres à mesma rede e configure `BACKEND_URL` com a origem HTTP da API, sem barra final, quando necessário. O backend precisa estar acessível quando o Nginx iniciar. O `Dockerfile` original continua destinado ao desenvolvimento.
