# Estatísticas Do Projeto - StudyFlow

Data do levantamento: 2026-07-07
Base do levantamento: checkout local `studyflow_alt`

## Critérios De Contagem

- Documentação: ficheiros Markdown (`.md`) dentro de `docs/`, incluindo `docs/planificacao/` e este ficheiro.
- Ficheiros da app: ficheiros próprios dentro de `real_dev/api` e `real_dev/web`, incluindo código, configs, `package.json`, `package-lock.json`, `.env.example`, cron e README técnico de testes.
- Código estrito: subconjunto dos ficheiros da app com extensões `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css` e `.html`.
- Exclusões da app: `node_modules`, `dist`, `coverage`, `playwright-report`, `test-results`, caches, `.DS_Store`, `.env` local e outros artefactos gerados ou específicos da máquina.
- Linha contabilizada: linha física de ficheiro. Linhas em branco e comentários contam, porque representam linhas reais mantidas no projeto.
- Backend: `real_dev/api`.
- Frontend: `real_dev/web`.

## Documentação

| Categoria                            |                                           Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------------------------------ | -----------------------------------------------: | --------: | -----: | -----------------: |
| Total de documentação e planificação |                                   `docs/**/*.md` |       168 | 111850 |             665.77 |
| Documentação geral                   | `docs/**/*.md`, excluindo `docs/planificacao/**` |         9 |   1798 |             199.78 |
| Planificação                         |                      `docs/planificacao/**/*.md` |       159 | 110052 |             692.15 |

A maior parte da documentação textual do projeto está na planificação. A planificação representa `159` dos `168` ficheiros Markdown contabilizados.

## Código

### Ficheiros Da App

| Área         |                          Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------ | ------------------------------: | --------: | -----: | -----------------: |
| Total da app | `real_dev/api` + `real_dev/web` |       581 |  69905 |             120.32 |
| Backend      |                  `real_dev/api` |       451 |  52050 |             115.41 |
| Frontend     |                  `real_dev/web` |       130 |  17855 |             137.35 |

Esta contagem inclui os ficheiros de suporte que fazem parte do projeto, como `package-lock.json`, `package.json`, `tsconfig.json`, `nest-cli.json`, `.env.example`, `ops/backup-daily.cron` e `tests/e2e/README.md`.

Os ficheiros auxiliares próprios representam `11` ficheiros e `12113` linhas: `6` ficheiros / `9302` linhas no backend e `5` ficheiros / `2811` linhas no frontend.

### Código Estrito

| Área                    |                          Âmbito | Ficheiros | Linhas de código | Média por ficheiro |
| ----------------------- | ------------------------------: | --------: | ---------------: | -----------------: |
| Total de código estrito | `real_dev/api` + `real_dev/web` |       570 |            57792 |             101.39 |
| Backend                 |                  `real_dev/api` |       445 |            42748 |              96.06 |
| Frontend                |                  `real_dev/web` |       125 |            15044 |             120.35 |

## Código Por Extensão

| Extensão |     Área | Ficheiros | Linhas |
| -------- | -------: | --------: | -----: |
| `.ts`    |  Backend |       441 |  42111 |
| `.mjs`   |  Backend |         3 |    617 |
| `.cjs`   |  Backend |         1 |     20 |
| `.tsx`   | Frontend |        78 |   9199 |
| `.ts`    | Frontend |        43 |   5757 |
| `.css`   | Frontend |         1 |     46 |
| `.js`    | Frontend |         2 |     30 |
| `.html`  | Frontend |         1 |     12 |

## Funções E Estrutura Interna

A contagem de funções foi feita por AST com o parser de TypeScript, sobre ficheiros `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` e `.cjs`. A métrica "funções" inclui declarações `function`, métodos de classes, construtores e arrow functions. Também inclui callbacks de testes, porque são funções reais mantidas no codebase.

| Métrica                             | Total | Backend | Frontend |
| ----------------------------------- | ----: | ------: | -------: |
| Funções / construções function-like |  2861 |    1909 |      952 |
| Declarações `function`              |   682 |     272 |      410 |
| Arrow functions                     |  1493 |     951 |      542 |
| Métodos de classes                  |   565 |     565 |        0 |
| Construtores                        |   121 |     121 |        0 |
| Classes                             |   305 |     305 |        0 |

## Testes E Código Fonte

| Métrica                   | Total | Backend | Frontend |
| ------------------------- | ----: | ------: | -------: |
| Ficheiros dentro de `src` |   547 |     444 |      103 |
| Linhas dentro de `src`    | 55626 |   42728 |    12898 |
| Ficheiros de teste        |   115 |      97 |       18 |
| Linhas de teste           | 15721 |   13666 |     2055 |

As linhas de teste representam `22.49%` das linhas dos ficheiros próprios da app. As linhas dentro de `src` representam `79.57%` das linhas dos ficheiros próprios da app.

## Leitura Rápida

- O projeto tem `168` ficheiros Markdown de documentação e planificação.
- A documentação e planificação somam `111850` linhas.
- A app em `real_dev` tem `581` ficheiros próprios, incluindo código e auxiliares do projeto.
- Esses ficheiros próprios da app somam `69905` linhas.
- Dentro desses ficheiros, o código estrito soma `570` ficheiros e `57792` linhas.
- O codebase tem `2861` funções/construções function-like contabilizadas por AST.
- O backend expõe `132` handlers HTTP Nest em `57` controllers.
- Existem `115` ficheiros de teste, com `15721` linhas.
- O backend concentra `77.62%` dos ficheiros próprios da app e `74.46%` das linhas da app.
- O frontend concentra `22.38%` dos ficheiros próprios da app e `25.54%` das linhas da app.
