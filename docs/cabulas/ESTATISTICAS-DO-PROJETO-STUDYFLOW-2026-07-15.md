# Estatísticas Do Projeto - StudyFlow

Data do levantamento: 2026-07-15
Base do levantamento: checkout local `studyflow_alt`

## Critérios De Contagem

- Documentação: ficheiros Markdown (`.md`) dentro de `docs/`, incluindo `docs/planificacao/`, `docs/evidence/`, `docs/cabulas/` e este ficheiro.
- Ficheiros da app: ficheiros próprios dentro de `real_dev/api` e `real_dev/web`, incluindo código, configs, `package.json`, `package-lock.json`, `.env.example`, scripts, testes, assets e evidências técnicas guardadas dentro de `real_dev`.
- Código estrito: subconjunto dos ficheiros da app com extensões `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.css`, `.html`, `.prisma` e `.sql`.
- Exclusões da app: `node_modules`, `dist`, `coverage`, `playwright-report`, `test-results`, caches, `.DS_Store`, `.env` local, `.env.local` e a árvore de instalação duplicada `real_dev/web/real_dev/`.
- Linha contabilizada: linha física de ficheiro. Linhas em branco e comentários contam, porque representam linhas reais mantidas no projeto.
- Ficheiros binários: contam como ficheiros da app, mas não acrescentam linhas; neste levantamento existem seis PDF de seed no backend e um PNG no frontend.
- Ficheiros de teste: ficheiros em diretórios `test`, `tests`, `__tests__` ou `e2e`, e nomes com `.spec.`, `.test.` ou `.node-test.`.
- Backend: `real_dev/api`.
- Frontend: `real_dev/web`.

## Documentação

| Categoria                            |                                           Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------------------------------ | -----------------------------------------------: | --------: | -----: | -----------------: |
| Total de documentação e planificação |                                   `docs/**/*.md` |       179 | 115675 |             646.23 |
| Documentação geral                   | `docs/**/*.md`, excluindo `docs/planificacao/**` |        18 |   3624 |             201.33 |
| Planificação                         |                      `docs/planificacao/**/*.md` |       161 | 112051 |             695.97 |

A maior parte da documentação textual do projeto está na planificação. A planificação representa `161` dos `179` ficheiros Markdown contabilizados, ou seja, `89.94%` dos ficheiros e `96.87%` das linhas de documentação.

## Código

### Ficheiros Da App

| Área         |                          Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------ | ------------------------------: | --------: | -----: | -----------------: |
| Total da app | `real_dev/api` + `real_dev/web` |       918 | 155984 |             169.92 |
| Backend      |                  `real_dev/api` |       651 | 108960 |             167.37 |
| Frontend     |                  `real_dev/web` |       267 |  47024 |             176.12 |

Esta contagem inclui os ficheiros de suporte que fazem parte do projeto, como `package-lock.json`, `package.json`, `tsconfig.json`, `.env.example`, scripts de validação, assets de seed e evidências técnicas dentro de `real_dev`.

Os ficheiros auxiliares próprios representam `24` ficheiros e `16043` linhas: `15` ficheiros / `10657` linhas no backend e `9` ficheiros / `5386` linhas no frontend.

### Código Estrito

| Área                    |                          Âmbito | Ficheiros | Linhas de código | Média por ficheiro |
| ----------------------- | ------------------------------: | --------: | ---------------: | -----------------: |
| Total de código estrito | `real_dev/api` + `real_dev/web` |       894 |           139941 |             156.53 |
| Backend                 |                  `real_dev/api` |       636 |            98303 |             154.56 |
| Frontend                |                  `real_dev/web` |       258 |            41638 |             161.39 |

## Código Por Extensão

| Extensão |     Área | Ficheiros | Linhas |
| -------- | -------: | --------: | -----: |
| `.ts`    |  Backend |       628 |  97239 |
| `.mjs`   |  Backend |         7 |   1044 |
| `.cjs`   |  Backend |         1 |     20 |
| `.tsx`   | Frontend |       180 |  28738 |
| `.ts`    | Frontend |        70 |  12228 |
| `.mjs`   | Frontend |         4 |    455 |
| `.js`    | Frontend |         2 |     34 |
| `.css`   | Frontend |         1 |    171 |
| `.html`  | Frontend |         1 |     12 |

## Funções E Estrutura Interna

A contagem de funções foi feita por AST com o parser de TypeScript, sobre ficheiros `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` e `.cjs`. A métrica "funções" inclui declarações `function`, function expressions, métodos, construtores e arrow functions. Também inclui callbacks de testes, porque são funções reais mantidas no codebase.

| Métrica                             | Total | Backend | Frontend |
| ----------------------------------- | ----: | ------: | -------: |
| Funções / construções function-like |  8159 |    4713 |     3446 |
| Declarações `function`              |  1541 |     634 |      907 |
| Function expressions                |     2 |       1 |        1 |
| Arrow functions                     |  5133 |    2612 |     2521 |
| Métodos                             |  1319 |    1304 |       15 |
| Construtores                        |   164 |     162 |        2 |
| Classes                             |   423 |     418 |        5 |

## Testes E Código Fonte

| Métrica                   | Total | Backend | Frontend |
| ------------------------- | ----: | ------: | -------: |
| Ficheiros dentro de `src` |   859 |     635 |      224 |
| Linhas dentro de `src`    | 134513 |   98283 |    36230 |
| Ficheiros de teste        |   248 |     163 |       85 |
| Linhas de teste           | 43883 |   31867 |    12016 |

As linhas de teste representam `28.13%` das linhas dos ficheiros próprios da app. As linhas dentro de `src` representam `86.24%` das linhas dos ficheiros próprios da app.

## Leitura Rápida

- O projeto tem `179` ficheiros Markdown de documentação e planificação.
- A documentação e planificação somam `115675` linhas.
- A app em `real_dev` tem `918` ficheiros próprios, incluindo código, auxiliares e sete assets binários do projeto.
- Os ficheiros textuais próprios da app somam `155984` linhas; os sete binários contam apenas no total de ficheiros.
- Dentro desses ficheiros, o código estrito soma `894` ficheiros e `139941` linhas.
- O codebase tem `8159` funções/construções function-like contabilizadas por AST.
- Existem `248` ficheiros de teste, com `43883` linhas.
- O backend concentra `70.92%` dos ficheiros próprios da app e `69.85%` das linhas da app.
- O frontend concentra `29.08%` dos ficheiros próprios da app e `30.15%` das linhas da app.
