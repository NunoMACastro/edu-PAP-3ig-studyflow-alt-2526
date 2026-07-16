# StudyFlow — Guidelines de UI do frontend

## Metadados

- `doc_id`: `STUDYFLOW-FRONTEND-UI-GUIDELINES`
- `path`: `real_dev/docs/FRONTEND-UI-GUIDELINES.md`
- `scope`: `real_dev/web`
- `status`: `ativo`
- `last_updated`: `2026-07-12`
- `visual_direction`: `StudyFlow Calm Focus`

## 1. Objetivo e obrigatoriedade

Este documento é o contrato canónico para decisões visuais e de interação em
`real_dev/web`. Aplica-se a páginas, layouts, shell, estilos, Tailwind, componentes
visuais, formulários, estados visíveis, navegação, acessibilidade e comportamento
responsivo.

Qualquer agente cuja missão altere UI observável deve ler este ficheiro integralmente
antes de planear, auditar ou editar código. Uma tarefa mista também ativa esta regra
quando a parte frontend muda o que o utilizador vê ou como interage.

Correções exclusivamente funcionais, sem alteração visual ou de interação, não exigem
esta leitura. A existência de código frontend no scope não basta: o gatilho é uma
mudança de UI observável.

Se este documento estiver ausente ou inacessível, o trabalho de UI fica bloqueado. O
agente não deve inventar uma identidade visual ou reconstruir as regras a partir do
mockup.

## 2. Autoridade e precedência

Quando houver conflito, aplicar esta ordem:

1. API, permissões, contratos, validações e regras funcionais existentes;
2. este documento para decisões visuais e de interação;
3. componentes, tokens Tailwind, estilos e testes atuais como implementação concreta;
4. `mockup/` apenas como referência histórica de fluxo.

Este guia nunca autoriza alterar endpoints, payloads, autenticação, autorização,
cookies, DTOs, regras de domínio ou mensagens funcionais. A UI deve representar o
contrato existente sem o ampliar.

O mockup pode ajudar a compreender uma sequência ou intenção antiga, mas não é fonte
de verdade visual. Em caso de divergência, prevalecem Calm Focus, os componentes reais
e os comportamentos acessíveis atuais.

Código legado pode conter desvios anteriores a este contrato. A sua existência não
transforma o desvio num padrão autorizado. Quando uma missão tocar esse código, deve
alinhar o comportamento dentro do scope seguro ou registar `PASS_COM_DESVIOS` com a
regra afetada e a razão concreta para não o corrigir. Esta regra não autoriza um redesign
geral fora do pedido.

Fontes técnicas principais:

- [tokens Tailwind](../web/tailwind.config.js);
- [estilos base e classes semânticas](../web/src/styles.css);
- [Surface](../web/src/components/ui/Surface.tsx);
- [primitivas Calm Focus](../web/src/components/ui/CalmUi.tsx);
- [SidePanel](../web/src/components/ui/SidePanel.tsx);
- [shell autenticada](../web/src/components/layout/AppShell.tsx).

## 3. Direção visual StudyFlow Calm Focus

Calm Focus pretende uma interface leve, contínua e concentrada no conteúdo. A UI não
deve parecer uma grelha de caixas independentes nem usar decoração para compensar uma
hierarquia pouco clara.

Princípios obrigatórios:

- hierarquia editorial antes de contentores adicionais;
- contraste tonal antes de bordas fortes;
- uma ação principal claramente identificável por contexto;
- superfícies leves, com espaço para respirar e conteúdo agrupado semanticamente;
- informação densa apresentada por faixas, listas e secções, não por um cartão pesado
  para cada valor;
- ações secundárias disponíveis sem competir com a tarefa principal;
- estados vazios e erros explícitos, nunca áreas silenciosamente em branco;
- movimento discreto e sempre compatível com `prefers-reduced-motion`.

## 4. Paleta e tokens

A paleta autorizada é exclusivamente a definida em `tailwind.config.js`:

| Token | Valor | Utilização principal |
| --- | --- | --- |
| `studyflow-brand` | `#1473E6` | ação principal e foco de marca |
| `studyflow-brandHover` | `#0E65CC` | hover/active da ação principal |
| `studyflow-brandText` | `#66A8FF` | texto de destaque acessível |
| `studyflow-page` / `studyflow-navy` | `#0B161A` | fundo principal |
| `studyflow-card` / `studyflow-navyHover` | `#193138` | superfícies e hover tonal |
| `studyflow-border`, `studyflow-muted`, `studyflow-text` | `#E0E0E0` | texto, divisórias e contornos por opacidade |
| `studyflow-alert` | `#9E5252` | atenção e perigo |
| `studyflow-alertText` | `#FFFFFF` | texto sobre estados de alerta |

Regras:

- não adicionar novos hexadecimais, cores ad hoc ou bibliotecas de temas;
- criar variações apenas através das opacidades Tailwind existentes;
- não usar cor como único meio para comunicar estado;
- preservar contraste WCAG AA: `4.5:1` para texto normal e `3:1` para componentes,
  limites visuais e texto grande;
- atenção e perigo partilham a família visual existente, mas a copy e o papel semântico
  devem distinguir a gravidade real.

## 5. Tipografia, espaço e geometria

- Cada página deve ter exatamente um `h1`, normalmente fornecido por `PageHeader`.
- Secções internas usam `SectionHeader` e `h2`; cartões usam headings subordinados.
- Texto de apoio usa `text-sm`, `leading-6` e opacidade, sem reduzir legibilidade.
- Títulos e valores podem usar `tracking-tight`; eyebrows usam uppercase e tracking
  moderado, nunca em parágrafos longos.
- Usar a escala Tailwind existente para gaps e padding; evitar valores arbitrários sem
  necessidade mensurável.
- Superfícies usam contorno de `1px`, `rounded-xl` ou `rounded-2xl` — equivalentes ao
  intervalo visual de 12–16 px atualmente implementado.
- `border-2` e aninhamento repetido de caixas são proibidos nos ecrãs Calm Focus.
- Sombras servem para elevação real, como painéis, diálogos e superfícies elevadas; não
  devem ser aplicadas a todas as listas.
- `min-w-0`, quebra de palavras e truncagem com nome acessível completo são obrigatórios
  onde emails, URLs ou títulos longos possam provocar overflow.

## 6. Primitivas oficiais

### 6.1 `Surface`

Usar `Surface` quando o contentor precisa de semântica e hierarquia reutilizável.

Variantes existentes:

- `default`: superfície normal de secção;
- `elevated`: diálogo ou bloco que precisa de elevação adicional;
- `interactive`: cartão realmente acionável ou com ações associadas;
- `subtle`: agrupamento tonal leve.

Tons existentes: `neutral`, `brand`, `attention` e `danger`.

Não usar `interactive` apenas para obter hover num bloco estático. O conteúdo deve
continuar acessível por teclado e o hover nunca pode ser a única indicação de ação.

### 6.2 `PageHeader` e `SectionHeader`

- `PageHeader` apresenta o único título principal, descrição e ação de página opcional.
- `SectionHeader` apresenta título interno, descrição, eyebrow e ação contextual.
- Não repetir o título da página dentro de uma superfície imediatamente abaixo.
- A ação principal da página fica no `PageHeader`; ações de uma secção ficam no respetivo
  `SectionHeader`.

### 6.3 `Toolbar`

`Toolbar` agrupa pesquisa, filtros, ordenação e contagem numa região com `aria-label`.
Deve ser compacta, responsiva e ter uma ordem de teclado previsível. Não criar um cartão
separado para cada controlo.

### 6.4 `EmptyState`

Usar `EmptyState` quando uma lista ou recurso não tem conteúdo. Deve incluir título
curto, descrição útil quando necessária, ícone existente e CTA apenas quando existe uma
ação legítima. Resultados vazios de pesquisa devem explicar que o filtro não encontrou
correspondência; não devem sugerir criar dados se já existem dados ocultados pelo filtro.

Em painéis de espaço limitado, como a janela compacta do Assistente, pode ser usada a
variante `compact`. Esta reduz padding, ícone e tipografia sem remover a explicação útil;
não deve repetir CTAs que já estejam permanentemente disponíveis no dock do painel.

### 6.5 `StatusBadge`

Usar badges para estados concisos já existentes no domínio. Os tons não podem criar uma
classificação funcional nova. Badges não substituem texto explicativo quando o estado
exige contexto.

### 6.6 `MetricStrip`

Usar uma faixa de métricas integrada para dois a quatro valores relacionados. Evitar um
cartão independente por número. Os links em métricas devem ter destino útil e nome
compreensível fora do contexto visual.

### 6.7 `InlineNotice` e `AsyncStateBlock`

- `InlineNotice` representa informação, loading, sucesso, atenção e erro.
- Erros usam `tone="danger"` e `role="alert"`; os restantes estados usam `status` por
  defeito.
- `AsyncStateBlock` deve ser usado quando a página tem o ciclo loading/erro/vazio/dados.
- A mensagem pública vem do contrato atual e nunca revela stack traces, IDs sensíveis,
  tokens, cookies ou detalhes internos.

### 6.8 `SidePanel`

Usar `SidePanel` para criação e edição CRUD curta ou tarefa contextual focada.

Contrato atual obrigatório:

- largura máxima de `440px` em desktop e largura total em mobile;
- `role="dialog"`, `aria-modal`, título e descrição;
- autofocus no primeiro controlo ou em `initialFocusRef`;
- focus trap, fecho por `Escape` e backdrop;
- reposição de foco no elemento que abriu o painel;
- bloqueio de scroll com compensação da scrollbar;
- `closeDisabled` durante submissão;
- não fechar em erro de validação ou API;
- fechar apenas após sucesso quando esse for o comportamento do fluxo.

Hashes de criação existentes devem continuar a usar `useHashSidePanel` e permanecer
compatíveis com carregamento inicial e `hashchange`.

### 6.9 `IconTooltip`

`IconTooltip` é visual e tem `aria-hidden="true"`. O botão ou link que o contém deve ter
nome acessível próprio através de texto, `aria-label` ou conteúdo `sr-only`.

- Escolher `side="right"` na sidebar recolhida e `top`/`bottom` conforme o espaço.
- Escolher alinhamento que mantenha o tooltip dentro do viewport.
- Validar os ícones nas extremidades em desktop e mobile.
- Não usar `title` nativo como única explicação.
- Um tooltip nunca pode criar scroll horizontal nem ficar cortado fora do ecrã.

## 7. Escolha do padrão de interação

### Página ou workspace inline

Usar uma página ou workspace inline quando a atividade é longa, iterativa ou constitui a
tarefa principal: chat, IA, construtor de testes, quizzes, flashcards, perfil, voz,
privacidade e governança.

### `SidePanel`

Usar para CRUD curto: criar/editar áreas, rotinas, objetivos, salas, publicações,
projetos, notas, materiais, revisões, turmas e disciplinas.

### Modal central

Reservar para confirmação sensível ou configuração contextual que precisa de manter o
contexto de origem visível. Um modal deve oferecer as mesmas garantias de foco, teclado,
backdrop, scroll lock e reposição de foco do `SidePanel`.

Não abrir diálogos concorrentes. Não colocar um formulário CRUD curto permanentemente ao
lado da listagem quando pode ser aberto sob pedido.

## 8. Formulários e controlos

Os estilos base de `styles.css` aplicam-se a `input`, `textarea` e `select`, excluindo
checkbox, radio, file e controlos especiais.

- Altura base mínima: `min-h-11` (44 px).
- Usar `sf-field` para reforçar o padrão sem criar aliases paralelos.
- Labels visíveis e associação `htmlFor`/`id` são obrigatórias.
- Ajuda e erro usam IDs estáveis ligados por `aria-describedby`.
- Campos inválidos usam `aria-invalid`.
- Erros de cliente não substituem validação do backend.
- Loading/submissão desativa a ação e impede fecho quando perder dados for possível.
- Checkbox, radio e file mantêm dimensões próprias; nunca devem herdar largura total dos
  campos de texto.

Os `<select>` nativos variam entre browsers. Quando for necessária uma altura exata,
usar `height` explícita em vez de depender apenas de `min-height`, manter texto e padding
proporcionais e validar pelo menos Chromium, Firefox e WebKit/Safari. A configuração da
voz IA da turma usa atualmente `h-12` (48 px) como exceção contextual; isto não altera a
altura global dos restantes campos.

## 9. Ações, botões e ícones

- `sf-button-primary`: ação principal da página, secção ou formulário.
- `sf-button-secondary`: ação de suporte, alternativa ou contextual.
- `sf-icon-button`: ação compacta cujo nome acessível existe sem depender do ícone.
- Links navegam; botões executam ações ou alteram estado local.
- Usar labels com verbo: “Criar turma”, “Guardar”, “Gerir disciplinas”.
- Não criar duas ações visíveis com o mesmo destino e a mesma intenção, por exemplo um
  botão “Gerir disciplinas” acompanhado de um ícone que abre exatamente a mesma rota.
- Uma ação contextual pode mudar de acordo com o estado real, mas não deve esconder uma
  capacidade essencial sem alternativa acessível.
- Ações reveladas por hover devem aparecer também em `focus-within`/`focus-visible` e
  continuar disponíveis a leitores de ecrã.
- A cor de alerta é reservada a ações sensíveis ou destrutivas; não serve para criar
  destaque genérico.

## 10. Shell e navegação

- A sidebar desktop inicia recolhida e pode ser expandida durante a sessão.
- No estado recolhido, ícones mantêm nome acessível e tooltip à direita.
- `aria-current` identifica a rota ativa.
- O mobile usa cabeçalho compacto e menu sobreposto.
- O menu mobile fecha por `Escape`, clique exterior e navegação, restaurando o foco.
- Notificações, privacidade, identidade e logout permanecem acessíveis no rodapé da
  navegação.
- O skip link para o conteúdo principal é obrigatório.
- Não alterar destinos por papel nem regras de autorização para simplificar a UI.

### 10.1 Exceção canónica da experiência de aluno

O papel `STUDENT` usa `StudentShell`; professor e administrador conservam a shell
anterior. Para alunos, este contrato mais específico substitui as regras de sidebar
recolhida e menu mobile sobreposto:

- existem exatamente quatro destinos principais: `Hoje`, `Estudar`, `Em grupo` e
  `Plano`;
- a sidebar desktop permanece expandida e todos os ícones têm texto visível;
- mobile usa bottom navigation textual, com touch targets de 44 px e safe area;
- perfil, notificações, privacidade e saída pertencem ao menu de conta;
- a pesquisa do header herda o contexto da disciplina ou área presente na rota e usa
  `Todos os meus estudos` fora de um workspace;
- tabs de turma, disciplina, área, grupo e plano ficam representadas no URL;
- workspaces apresentam breadcrumb ou regresso, título, tabs e uma ação principal;
- cards de turma, disciplina, área, grupo e sala apresentam apenas uma ação primária;
- definições e arquivo não competem com a ação de estudar;
- nenhum formulário de aluno pede IDs técnicos quando a rota já identifica o contexto;
- bookmarks e notificações legacy são encaminhados para os destinos canónicos.

O ano de ensino não escolhe outra interface. Pode adaptar apenas linguagem, detalhe e
exemplos no executor governado de IA. A existência de `StudentProfile` conclui o
onboarding; adiar é uma preferência efémera da sessão do browser.

### 10.2 Assistente de estudo transversal do aluno

O `StudentShell` apresenta um launcher contextual do Assistente sem criar um quinto
destino principal. Este padrão substitui tabs dedicadas de IA nos workspaces do aluno:

- desktop usa launcher com ícone e texto e uma janela não modal ancorada ao canto;
- mobile usa touch target mínimo de 44 px acima da bottom navigation e abre sheet modal
  adaptativa, com fullscreen em viewports pequenos;
- a rota fornece apenas tipo e ID do contexto; labels, disponibilidade, fontes e
  permissões são sempre resolvidas pela API;
- páginas neutras apresentam um seletor por nomes legíveis, nunca campos de IDs;
- cada conversa mantém contexto imutável e a página completa reutiliza a mesma vista;
- a janela fecha por `Escape`, restitui foco e respeita `prefers-reduced-motion`;
- mensagens usam hierarquia tonal e citações compactas numa linha, sem grelhas de
  cartões por turno;
- histórico sem acesso atual é read-only e não apresenta links para fontes;
- não abrir o launcher sobre outro diálogo modal nem o duplicar na página dedicada.

## 11. Estados e conteúdo

Toda a página assíncrona deve representar, quando aplicável:

- loading;
- erro público controlado;
- dados;
- lista vazia;
- pesquisa sem resultados;
- submissão em curso;
- sucesso após mutação;
- indisponibilidade da sessão ou serviço.

403 e 404 usam `EmptyState`, `InlineNotice` ou `Surface` com ação de recuperação segura.
Não criar claims promocionais, mensagens de produto ou estados de domínio não suportados.
Preservar PT-PT, nomes acessíveis e mensagens públicas usadas pelos testes.

## 12. Responsividade e overflow

Viewports mínimos de QA:

- `320 × 720`;
- `375 × 812`;
- `768 × 1024`;
- `1440 × 900`.

Validar dados vazios e populados, títulos longos, emails, URLs extensos e listas densas.

Regras:

- zero scroll horizontal na página;
- tabelas densas podem usar `overflow-x-auto` no contentor local, não no documento;
- layouts começam numa coluna e ganham colunas apenas quando há largura útil;
- ações fazem wrap sem sobrepor conteúdo;
- superfícies e filhos flex/grid usam `min-w-0`;
- media, inputs e painéis nunca ultrapassam o viewport;
- o conteúdo principal deve continuar utilizável com a sidebar recolhida ou expandida.

## 13. Acessibilidade e movimento

- Navegação integral por teclado e foco sempre visível.
- Ordem de foco acompanha a ordem visual e semântica.
- Um único `h1`; headings internas sem saltos arbitrários.
- Regiões, toolbars, navegações e métricas têm nomes acessíveis.
- Estados dinâmicos usam `status` ou `alert` sem anúncios duplicados.
- Não depender apenas de cor, hover, posição ou ícone.
- Diálogos e painéis aplicam focus trap, `Escape`, backdrop, scroll lock e reposição de
  foco.
- Respeitar o bloco global `prefers-reduced-motion`; novas animações devem ter fallback.
- As páginas representativas devem ter zero findings Axe `serious` ou `critical`.

## 14. Fazer e não fazer

| Fazer | Não fazer |
| --- | --- |
| Usar `MetricStrip` para métricas relacionadas | Criar um cartão pesado por número |
| Usar `Toolbar` para pesquisa, ordem e contagem | Espalhar controlos por várias caixas |
| Usar `SidePanel` para criação CRUD curta | Manter o formulário sempre aberto junto da lista |
| Dar ao ícone um `aria-label` e tooltip contido | Depender do `title` ou de hover |
| Manter uma ação clara por destino | Duplicar botão e ícone para a mesma rota |
| Usar contorno de 1 px e contraste tonal | Usar `border-2` e caixas aninhadas |
| Preservar comportamento, labels e API | Introduzir copy ou regras funcionais durante o facelift |
| Validar 320/375/768/1440 e conteúdo longo | Validar apenas desktop com dados ideais |

## 15. Checklist obrigatória da missão de UI

Antes de editar:

- [ ] Li integralmente este documento.
- [ ] Identifiquei os componentes e padrões atuais que devo reutilizar.
- [ ] Confirmei rotas, nomes acessíveis, API e comportamento a preservar.
- [ ] Verifiquei alterações existentes no worktree e limitei o scope.

Durante a implementação:

- [ ] Não adicionei cores, dependências ou primitivas redundantes.
- [ ] Usei a hierarquia correta de página, secção, superfície e ação.
- [ ] Mantive estados assíncronos e falhas controladas.
- [ ] Garanti teclado, foco, nomes acessíveis e reduced motion.
- [ ] Evitei ações duplicadas, `border-2` e overflow horizontal.

Antes de concluir:

- [ ] Executei testes unitários relevantes e build frontend.
- [ ] Validei os viewports aplicáveis e conteúdo vazio/populado/longo.
- [ ] Validei comportamento de teclado e diálogos/painéis alterados.
- [ ] Executei Axe quando a alteração afetou uma página representativa.
- [ ] Registei conformidade, desvios e validação no formato obrigatório.

## 16. Evidência obrigatória no relatório ou resumo final

Toda a missão de UI deve terminar com:

```md
UI_GUIDELINES_READ: sim
UI_GUIDELINES_PATH: real_dev/docs/FRONTEND-UI-GUIDELINES.md
UI_COMPLIANCE: PASS | PASS_COM_DESVIOS | BLOQUEADO
UI_DEVIATIONS: nenhuma | descrição da regra afetada e justificação
UI_VALIDATION: testes, build, browser, viewports e acessibilidade executados
```

`PASS_COM_DESVIOS` só é válido quando uma exigência funcional, técnica ou de
acessibilidade justifica a exceção. Preferência estética ou falta de tempo não é uma
justificação suficiente. `BLOQUEADO` deve identificar a prova em falta e o motivo pelo
qual não é seguro declarar conformidade.

## 17. Manutenção do sistema visual

Quando uma missão introduzir um novo padrão reutilizável:

1. confirmar que uma primitiva atual não resolve o problema;
2. implementar o padrão no componente ou estilo canónico;
3. adicionar ou atualizar testes do contrato visual/comportamental;
4. atualizar este documento na mesma missão;
5. registar compatibilidade e eventual migração de usos existentes.

Não documentar intenções ainda não implementadas como se fossem contratos atuais. Não
editar manualmente artefactos técnicos gerados para refletir mudanças visuais.

## Changelog

- `2026-07-12`: documentado o Assistente transversal do aluno, incluindo launcher,
  página completa, contexto imutável, comportamento mobile e histórico revogado.
- `2026-07-12`: documentada a arquitetura de informação específica do aluno, com quatro
  destinos, bottom navigation, conta, pesquisa contextual e workspaces por tabs.
- `2026-07-11`: criado o contrato canónico privado de UI para `real_dev/web` após o
  facelift StudyFlow Calm Focus.
