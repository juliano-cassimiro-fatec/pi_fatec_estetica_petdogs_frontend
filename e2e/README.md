# PetDogs E2E

Projeto separado para os testes end-to-end do frontend, executados com Playwright no Chromium. As chamadas da API são interceptadas nos próprios cenários, portanto o backend não precisa estar em execução.

## Cobertura

- navegação pelas páginas públicas e proteção das rotas privadas;
- login com sucesso, falha de autenticação e encerramento da sessão;
- criação, leitura e edição de serviços, profissionais, clientes e pets;
- criação, leitura, edição e cancelamento de agendamentos pelo cliente;
- exclusão dos registros de teste somente no fim do fluxo, respeitando a ordem das dependências.

O cenário `crud-flow.spec.ts` usa uma API em memória que preserva os dados entre as navegações. Além de validar a interface e os payloads, ele verifica programaticamente que nenhuma exclusão acontece antes das operações de criação, consulta, edição e cancelamento.

## Execução local

Na raiz do repositório, instale a aplicação e o projeto de testes:

```bash
npm ci
npm --prefix e2e ci
npx --prefix e2e playwright install chromium
npm --prefix e2e test
```

O Playwright inicia o Vite automaticamente na porta `4173`. Para depuração visual, use `npm --prefix e2e run test:headed` ou `npm --prefix e2e run test:ui`.
