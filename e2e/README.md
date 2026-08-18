# PetDogs E2E

Projeto separado para os testes end-to-end do frontend, executados com Playwright no Chromium. As chamadas de autenticação são interceptadas nos próprios cenários, portanto a API não precisa estar em execução.

## Execução local

Na raiz do repositório, instale a aplicação e o projeto de testes:

```bash
npm ci
npm --prefix e2e ci
npx --prefix e2e playwright install chromium
npm --prefix e2e test
```

O Playwright inicia o Vite automaticamente na porta `4173`. Para depuração visual, use `npm --prefix e2e run test:headed` ou `npm --prefix e2e run test:ui`.
