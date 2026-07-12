# Cábula Técnica Para Relatório PAP - StudyFlow

## Objetivo Do Documento

Este documento serve como apoio aos alunos para escreverem e apresentarem o relatório técnico da PAP. A linguagem é técnica, mas explicada de forma acessível, para que possa ser usada tanto no relatório como na preparação da defesa.

O StudyFlow é uma plataforma inteligente de aprendizagem que junta estudo individual, materiais escolares, IA com fontes, turmas, disciplinas, voz docente, chat aluno-professor por disciplina, salas colaborativas, grupos de estudo, mini-testes, notificações, privacidade e administração. Algumas secções descrevem funcionalidades centrais já implementadas em `real_dev`; outras resumem pontos documentados em requisitos, backlogs, guias e mapas técnicos.

> **Âmbito e autoridade atuais:** esta cábula descreve o perfil
> `PAP_LOCAL_ENDURECIDA`, single-instance e apenas em loopback. Não prova prontidão para
> produção nem substitui o
> [ledger de remediação](../PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md), o
> [mapa técnico gerado](../../real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md) ou o
> [runbook local](../../real_dev/docs/ops/LOCAL-PAP-RUNBOOK.md). Os estados pedagógicos dos BK
> também não provam o estado da implementação de referência.

## Visão Técnica Geral

Tecnicamente, o StudyFlow segue uma arquitetura web cliente-servidor. O frontend é a aplicação usada no browser. O backend é responsável pelas regras de negócio, validação, autenticação, autorização, acesso à base de dados, integração com IA e exposição da API.

O frontend comunica com o backend principalmente através de uma API REST. No chat aluno-professor por disciplina, usa também WebSocket com Socket.IO para entrega em tempo real, mantendo REST apenas para carregar o histórico inicial. Cada área funcional tem páginas e clientes próprios no frontend, por exemplo para autenticação, estudo individual, áreas de estudo, materiais, ferramentas de IA, turmas, disciplinas, chat, salas, grupos, notificações, privacidade e administração.

O backend está organizado por módulos de domínio. Cada módulo concentra uma responsabilidade principal:

- autenticação e sessão;
- perfis de aluno;
- rotinas, objetivos e histórico de estudo;
- áreas de estudo;
- materiais privados;
- indexação, estrutura e versões de materiais;
- Assistente de estudo conversacional;
- ferramentas e serviços especializados de IA;
- turmas, disciplinas e materiais oficiais;
- voz IA docente;
- chat aluno-professor por disciplina;
- salas de estudo e grupos;
- projetos, mini-testes e progresso;
- notificações e acompanhamento;
- privacidade/RGPD;
- administração, auditoria, políticas e quotas.

Esta separação facilita manutenção e evolução, porque cada domínio pode ser alterado sem misturar responsabilidades com os restantes. A app usa React, TypeScript, Vite e Tailwind no frontend; Node.js, NestJS, TypeScript, Mongoose e MongoDB no backend.

## Identidade, Contas E Perfis

O sistema de identidade é a base da plataforma. Antes de guardar áreas de estudo, materiais, quizzes, turmas, consentimentos ou histórico, o sistema precisa de saber quem é o utilizador.

Este domínio inclui:

- registo de aluno;
- login;
- logout;
- sessão autenticada;
- consulta da sessão atual;
- perfil editável do aluno;
- papéis de utilizador, como `STUDENT`, `TEACHER` e `ADMIN`.

Depois do login, o backend associa os pedidos a um utilizador autenticado. Isto permite que cada operação pessoal seja feita sobre a conta correta. O frontend não deve enviar manualmente o `userId` para operações sensíveis; o backend obtém a identidade a partir da sessão.

No StudyFlow, a sessão é baseada num cookie HttpOnly chamado `sf_sid`. O browser guarda apenas um identificador opaco e o Redis guarda somente `{ userId, sessionVersion }`. Em cada pedido, o backend relê `role`, `accountStatus` e `sessionVersion` no MongoDB. Uma versão divergente, uma conta não ativa ou uma sessão revogada devolvem `401 SESSION_REVOKED`; mudar o papel ou eliminar a conta incrementa a versão e revoga todas as sessões. O mesmo contrato é revalidado pelo WebSocket em `join`, `send` e antes dos broadcasts. Isto evita guardar tokens sensíveis em `localStorage` e impede que papéis antigos continuem válidos.

O perfil do aluno guarda nome, ano ou nível de ensino e curso. O ano pode influenciar a forma das respostas de IA, mas não altera factos, fontes, permissões ou critérios de correção. Cada aluno só pode editar o seu próprio perfil; o backend transforma o ano numa orientação pedagógica transitória e não o persiste nas conversas ou interações de IA.

## Estudo Individual, Rotinas E Histórico

O modo individual permite que o aluno use a plataforma mesmo sem estar associado a uma turma oficial. Esta é uma decisão importante, porque o StudyFlow não depende exclusivamente de contexto docente: o aluno pode começar por organizar o seu estudo autónomo.

Este domínio inclui:

- dashboard individual;
- rotinas de estudo;
- objetivos pessoais;
- histórico de eventos;
- contagem de áreas, materiais e rotinas;
- indicação de existência ou não de turma.

As rotinas representam hábitos de estudo, com dias da semana, hora de início e duração. Os objetivos representam metas pessoais. O histórico guarda eventos como criação de áreas, criação de rotinas, geração de resumos, geração de ferramentas de estudo e explicações adaptativas.

O histórico também é útil para outros módulos. Por exemplo, pode alimentar alertas de acompanhamento docente, porque permite perceber se um aluno está ativo ou inativo.

## Áreas De Estudo, Materiais Privados E Voz Da Área

As áreas de estudo são espaços privados criados pelo aluno para organizar materiais e IA por tema. Uma área pode representar uma disciplina, um módulo, um projeto ou um tópico específico.

Cada área pertence a um único aluno. O backend filtra as queries por `userId`, garantindo que uma área só existe dentro do espaço pessoal do aluno autenticado.

Uma área de estudo pode ter:

- nome;
- descrição;
- cor;
- estado arquivado;
- tom da IA;
- nível de detalhe;
- notas livres de voz pedagógica.

Os materiais privados pertencem a uma área. Podem ser ficheiros, URLs, tópicos ou texto processável. Estes materiais são a base para resumos, explicações, flashcards, quizzes e IA privada.

O sistema deve validar:

- se a área pertence ao aluno;
- se o tipo de material é permitido;
- tamanho máximo de ficheiros;
- MIME type em documentos;
- URL quando aplicável;
- estado de processamento;
- existência de texto processável antes de chamar IA.

A voz da área é diferente da voz docente. A voz da área é definida pelo aluno para adaptar o estilo dentro do seu espaço privado. A área guarda tom, nível de detalhe e notas pedagógicas; no pipeline atual de resumos e ferramentas de estudo, o tom já entra no prompt, enquanto a integração completa do detalhe e das notas permanece incompleta. A voz docente pertence ao professor e aplica-se aos contextos oficiais, como disciplina, projeto e sala guiada.

## Indexação, Estrutura, Versões E Importação De Materiais

A indexação transforma materiais em texto utilizável pela pesquisa, navegação curricular e IA. Sem indexação ou texto processável, a IA não deve inventar respostas com base em ficheiros que ainda não foram analisados.

O sistema de indexação inclui:

- jobs de indexação;
- indexação de materiais privados;
- indexação de materiais oficiais;
- extração de chunks de texto;
- identificação de fonte e localização;
- estados como `QUEUED`, `PROCESSING`, `DONE` ou `FAILED`;
- validação de documentos antes de parsers externos;
- timeouts para evitar processamento preso;
- proteção em URLs externos;
- normalização de texto em português.

Os jobs não são lançados com fire-and-forget. Um runner persistente em MongoDB usa lease de
30 segundos, heartbeat/fencing, concorrência máxima de dois, três tentativas, backoff e
recovery de leases expiradas. PDF e DOCX são processados em `worker_threads` termináveis com
timeout e limites de recursos. O frontend reidrata o job mais recente por material através de
`latestByMaterial=true` e faz polling single-flight com `AbortSignal` e estados monotónicos.

O storage local fica fora do checkout e usa diretório `0700`, ficheiros `0600`, chaves UUID,
SHA-256, staging, promoção atómica, compensação, quota de 250 MiB por utilizador e
reconciliação/outbox para eliminar órfãos.

A estrutura de materiais permite extrair tópicos, secções e referências. O versionamento permite guardar alterações e restaurar versões quando necessário. Isto é importante porque materiais escolares podem ser atualizados ao longo do tempo.

A importação externa permite criar materiais a partir de links Google Drive ou OneDrive. No estado atual, isto deve ser explicado como importação unidirecional controlada, não como sincronização completa com contas externas. O backend valida se o provider declarado corresponde ao URL e depois delega a criação para o módulo de materiais privados ou materiais oficiais.

## Arquitetura Da IA E Responsabilidades

A IA é uma das partes centrais do StudyFlow, mas não funciona como um serviço genérico com acesso livre a todos os dados. O sistema tem uma fronteira governada comum e vários serviços especializados por contexto. Cada serviço resolve permissões e fontes próprias antes de delegar a geração.

Em execução normal, o provider efetivo é a OpenAI através da Responses API. O backend envia um prompt textual e espera uma resposta JSON. Não existe streaming, function calling, utilização autónoma de ferramentas, pesquisa web ou memória global. Em E2E e demonstrações locais pode ser usado um provider falso determinístico, protegido por flags de ambiente específicas.

A OpenAI produz o conteúdo pedagógico:

- respostas conversacionais;
- resumos;
- explicações estruturadas;
- flashcards;
- perguntas, opções, solução e explicação dos quizzes;
- explicações adaptativas;
- passos e justificação de planos de projeto.

O backend continua responsável por tudo o que define confiança e segurança:

- autenticação, role, ownership, membership e inscrição;
- escolha e limitação das fontes;
- construção do prompt;
- orientação pedagógica e voz docente;
- consentimentos, policies, guardrails e quotas;
- validação do JSON e das citações devolvidas;
- idempotência, jobs, retries e concorrência;
- cálculo de pontuações e exportações;
- persistência, auditoria, privacidade e eliminação.

O `GovernedAiExecutionService` é a única classe autorizada a injetar o provider. A sequência obrigatória é:

```text
Contexto autorizado
    → consentimento da finalidade
    → policy ativa
    → fontes e prompt dentro dos limites
    → orientação pedagógica
    → guardrails
    → reserva atómica de quota
    → OpenAI
    → validação estrutural e das fontes
    → persistência e auditoria
```

Na configuração inicial prevista, `ROOM_AI` começa desativada e sem consentimento automático. A sua utilização exige uma policy administrativa ativa, quota aplicável e consentimento explícito do aluno.

## Assistente De Estudo Conversacional E Contextual

O Assistente de estudo é a principal superfície de IA para o aluno. Não substitui os serviços especializados: organiza-os sob o mesmo sistema de conversas, mantendo as regras, fontes, consentimentos e modelos de persistência de cada domínio.

O aluno pode usar o Assistente de duas formas:

- launcher no canto inferior direito, apenas dentro da `StudentShell`;
- página completa em `/app/assistente`, com histórico agrupado por contexto.

Professor e administrador não recebem o launcher. Na própria página do Assistente, o launcher também não aparece.

Quando o aluno abre o launcher numa página contextual, o frontend extrai apenas o tipo e o ID da rota. O backend volta a validar o contexto e constrói labels, permissões e caminhos seguros. Numa página neutra, o Assistente apresenta um seletor pesquisável sem pedir IDs técnicos.

O Assistente suporta cinco contextos iniciais:

| Contexto      | Fontes autorizadas                  | Consentimento     | Scope de quota | Visibilidade principal                   |
| ------------- | ----------------------------------- | ----------------- | -------------- | ---------------------------------------- |
| `SUBJECT`     | materiais oficiais processados      | `CLASS_AI`        | turma          | conversa privada do aluno                |
| `STUDY_AREA`  | materiais privados processáveis     | `PRIVATE_AREA_AI` | utilizador     | totalmente privada                       |
| `STUDY_GROUP` | partilhas processáveis do grupo     | `GROUP_AI`        | grupo          | resposta associada ao aluno              |
| `STUDY_ROOM`  | partilhas processáveis da sala      | `ROOM_AI`         | grupo          | privada, com partilha explícita opcional |
| `GUIDED_ROOM` | materiais escolhidos pelo professor | `CLASS_AI`        | turma          | supervisionada pelo professor            |

Cada conversa pertence a um único aluno e a um contexto imutável. Para mudar de contexto é necessário abrir ou criar outra conversa. O aluno pode:

- criar várias conversas no mesmo contexto;
- renomear;
- arquivar e restaurar;
- apagar com confirmação;
- continuar no launcher ou abrir exatamente a mesma conversa na página completa.

Uma conversa começa em `DRAFT` com o título `Nova conversa`. Se continuar vazia, expira após 24 horas. Só passa a `ACTIVE` depois de existir uma resposta ou um artefacto persistido com sucesso. O primeiro título é derivado localmente da primeira pergunta ou do primeiro artefacto, sem nova chamada à OpenAI.

### Memória Conversacional Limitada

O Assistente recorda no máximo seis turnos anteriores completos da mesma conversa. A memória:

- nunca atravessa conversas ou contextos;
- usa apenas pares completos de pergunta e resposta;
- ocupa no máximo `min(3000, 30% do limite do prompt)`;
- dá prioridade às fontes, instruções do domínio e pergunta atual;
- remove um turno completo quando não cabe, sem cortar respostas;
- é delimitada como diálogo anterior não confiável;
- não cria resumos ocultos nem uma memória paralela persistente.

Uma lease atómica de 120 segundos impede duas respostas simultâneas na mesma conversa. Conversas diferentes podem executar em paralelo. A interface mostra `A preparar resposta...`, não simula streaming e preserva a pergunta quando ocorre um erro.

### Citações, Acesso Revogado E Histórico

As perguntas e respostas continuam guardadas nos modelos especializados de disciplina, área, grupo, sala ou sala guiada. A conversa é uma camada de organização ligada por `conversationId`; não duplica todo o conteúdo num modelo genérico.

Cada turno guarda snapshots mínimos das citações apresentadas. Quando o aluno mantém acesso, o backend pode acrescentar links atuais. Quando a membership ou ownership termina:

- a conversa fica apenas de leitura;
- permanecem as próprias perguntas, respostas e labels históricas;
- os links das citações desaparecem;
- as fontes atuais não são novamente resolvidas;
- possuir a conversa não concede novamente acesso ao contexto.

### Compatibilidade E Migração Do Histórico Anterior

Os endpoints especializados anteriores continuam disponíveis durante a transição. Quando recebem uma nova pergunta, o backend associa internamente a interação a uma conversa de compatibilidade, sem exigir que o cliente antigo envie `conversationId`.

Os bookmarks antigos para IA de disciplina, área, grupo ou sala são encaminhados para o Assistente no contexto equivalente, em vez de terminarem num erro `404`. O histórico anterior pode ser agrupado por aluno, tipo de contexto e ID de contexto numa conversa `Histórico anterior`, apenas de leitura.

O script de migração suporta dry-run, execução em batches e identificação por `runId`. É idempotente, retomável e tem rollback limitado aos registos marcados pela execução correspondente. Não remove coleções, perguntas, respostas, fontes, visibilidade, forks ou supervisão dos modelos anteriores.

## Geração De Resumos, Explicações, Flashcards E Quizzes

Os artefactos de estudo podem continuar a ser consultados na tab `Praticar` da área. Além disso, numa conversa `STUDY_AREA`, o aluno dispõe da ação explícita `Criar material de estudo`.

Pedidos escritos naturalmente no chat não ativam ferramentas de forma autónoma. O aluno escolhe o tipo e, quando aplicável, um tópico. O histórico da conversa e as respostas anteriores não são fontes do artefacto: as únicas fontes factuais são os materiais processáveis e autorizados da área.

O sistema pode gerar:

- resumo com título, tópicos e materiais usados;
- explicação com título, secções e fontes por secção;
- flashcards com frente, verso e fontes;
- quiz com perguntas, exatamente quatro opções, solução, explicação e fontes.

O resumo exige consentimento `SUMMARY`. Explicação, flashcards e quiz exigem `STUDY_TOOL`. O consentimento `PRIVATE_AREA_AI` da conversa não autoriza automaticamente a criação destes materiais.

Resumo, explicação e flashcards são gerados de forma síncrona. O quiz usa uma fila persistente MongoDB com estados `QUEUED`, `PROCESSING`, `DONE` e `FAILED`, lease com heartbeat, até três tentativas e recuperação depois de refresh ou restart. O polling apenas consulta o estado e não consome quota de IA.

O frontend envia um `Idempotency-Key` UUID. O backend transforma-o num hash ligado ao aluno, conversa, tipo e tópico. Uma repetição exata reutiliza o resultado ou job existente e não volta a chamar o provider. Uma lease separada impede duas gerações simultâneas na mesma conversa.

Na conversa aparece apenas um card com tipo, título, data, estado e ação `Abrir material`. O conteúdo completo permanece na tab `Praticar`. Apagar a conversa remove a associação, mas preserva os artefactos e tentativas na área. A eliminação da conta continua a abranger conversas, artefactos, jobs e tentativas através do `PersonalDataRegistry`.

Nos quizzes IA privados, o backend guarda tentativas e calcula:

- respostas certas;
- total de perguntas;
- percentagem;
- resultado por pergunta;
- fontes usadas.

O quiz IA é uma ferramenta privada de estudo. O mini-teste oficial é uma avaliação criada pelo professor. No contrato atual dos quizzes privados, o artefacto completo enviado ao browser inclui a solução, embora a interface só a mostre depois da submissão; por isso, não deve ser apresentado como uma avaliação protegida contra inspeção do cliente.

Resumos e quizzes podem ser exportados sem nova execução de IA. O backend produz Markdown para download ou HTML de impressão para guardar como PDF, omitindo soluções dos quizzes por defeito.

## Outros Fluxos Especializados De IA

Além do Assistente, permanecem serviços especializados:

- explicação adaptativa por área, com ritmo, nível, dificuldades e estilo preferido;
- plano de projeto, que produz passos e justificação sem escrever o trabalho pelo aluno;
- resposta baseada em jobs de indexação e citações obrigatórias;
- conhecimento externo limitado;
- revisão docente de resumos e quizzes associados a materiais oficiais.

A IA com fontes obrigatórias seleciona localmente até três chunks relevantes por correspondência lexical, normaliza citações e só depois chama o provider. Não usa embeddings nem uma base vetorial. Se não existirem fontes citáveis, bloqueia a resposta.

O conhecimento externo limitado não é pesquisa web, consulta de sites ou RAG externo. Quando autorizado, permite ao modelo acrescentar enquadramento geral do seu próprio conhecimento, separado das fontes internas e sem o apresentar como citação verificada.

Alguns destes fluxos continuam disponíveis por endpoint ou rota direta, mas deixaram de ter um destino principal na navegação depois da remoção da antiga página monolítica `Comunidade`. No relatório, devem ser identificados como serviços especializados ou de compatibilidade, não como a experiência principal atual.

## Adaptação Pedagógica Ao Nível De Ensino

Quando um fluxo ativa `pedagogicalContext: STUDENT_PROFILE`, o backend normaliza o ano do perfil para:

- `PRIMARY`;
- `LOWER_SECONDARY`;
- `UPPER_SECONDARY`;
- `HIGHER_EDUCATION`;
- `UNKNOWN`.

Esta normalização altera apenas linguagem, progressividade, detalhe e tipo de exemplos. Não altera fontes, factos, permissões, voz docente, output schema ou critérios de correção. Na generalidade dos fluxos, o provider recebe apenas a orientação correspondente e uma instrução para não mencionar nem inferir ano, idade ou nível. O valor normalizado não é guardado nas conversas, interações ou audit logs.

## Guardrails, Consentimentos, Políticas E Quotas De IA

A IA do StudyFlow tem camadas distintas de autorização e governança.

Os serviços de domínio validam:

- role do utilizador;
- ownership da área individual;
- membership de sala ou grupo;
- inscrição em disciplina ou turma;
- estado do contexto, como sala aberta, arquivada ou com IA ativa;
- existência de fontes processáveis.

Depois, o executor governado aplica uma policy lexical de segurança à pergunta atual e às perguntas históricas incluídas. Essa policy bloqueia expressões conhecidas de enviesamento, perigo ou falta de finalidade pedagógica. É uma proteção previsível no backend, mas não substitui moderação semântica completa e pode não reconhecer todas as paráfrases.

Os consentimentos são independentes por finalidade e versão de política:

- `PRIVATE_AREA_AI`;
- `GROUP_AI`;
- `CLASS_AI`;
- `PROJECT_AI`;
- `SOURCE_GROUNDED_AI`;
- `EXTERNAL_KNOWLEDGE_AI`;
- `ADAPTIVE_EXPLANATION`;
- `SUMMARY`;
- `STUDY_TOOL`;
- `ROOM_AI`.

Um consentimento em falta, revogado ou desatualizado bloqueia a chamada. Ler histórico não cria uma nova execução nem exige consumo de quota.

As policies administrativas permitem configurar por finalidade:

- estado ativo;
- identificação textual do provider;
- modelo;
- timeout;
- número máximo de fontes;
- tamanho máximo do prompt.

Na implementação atual, o provider efetivo continua a ser OpenAI; o campo administrativo `provider` ainda não seleciona dinamicamente outra implementação. Alterar esse texto não troca o provider carregado no arranque.

As quotas limitam o consumo mensal por utilizador, turma ou grupo. As unidades são reservadas atomicamente antes da chamada ao provider. Se o limite for ultrapassado, o pedido é recusado. O fluxo atual não contém compensação para devolver unidades quando a chamada ao provider falha, pelo que uma falha técnica pode consumir quota.

O output da OpenAI tem de ser um objeto JSON inferior a 1 MB e cumprir o contrato do domínio. Respostas vazias, formatos errados ou citações fora das fontes autorizadas são rejeitados antes da persistência.

O audit log do executor guarda apenas IDs, finalidade, modelo, contagens, unidades e resultado. Não guarda o prompt completo, perguntas ou respostas. Esta combinação mostra que a IA é controlada por regras técnicas antes, durante e depois da utilização.

## Ponto De Vista Dos Atores Na IA

### Aluno

O aluno usa o launcher contextual ou a página completa do Assistente. Escolhe um contexto autorizado, aceita separadamente o consentimento exigido por cada finalidade e pode manter várias conversas no mesmo contexto. Nas áreas pessoais, pode ainda pedir explicitamente resumos, explicações, flashcards e quizzes.

As conversas normais de disciplina, área, grupo e sala pertencem ao aluno. Numa sala partilhada, uma resposta só passa a estar visível para outros membros quando existe uma ação explícita de partilha. Numa sala guiada, o aluno é informado de que a interação é supervisionada. O aluno pode renomear, arquivar, restaurar ou apagar conversas, sujeito às regras de retenção de conteúdo partilhado, referenciado ou supervisionado.

### Professor

O professor não recebe o launcher global do aluno. O seu papel na IA é preparar e governar os contextos oficiais: publica materiais, configura a voz docente, cria conteúdos e mini-testes, gere projetos e define objetivo, instruções, fontes e disponibilidade das salas guiadas.

O professor pode rever interações das salas guiadas porque esse fluxo é explicitamente supervisionado. Não recebe acesso às áreas privadas, ao plano privado do projeto nem às conversas normais do Assistente em disciplinas. A revisão de conteúdo gerado para materiais oficiais é uma ação humana de aprovação ou rejeição e não uma nova chamada automática ao provider.

### Administrador

O administrador governa a infraestrutura de IA, não o estudo concreto do aluno. Pode ativar policies, definir modelo, limites, timeout e quotas, consultar métricas minimizadas e gerir finalidades e versões de consentimento. O campo textual de provider ainda não troca dinamicamente a integração carregada no runtime.

Nas superfícies normais de administração, não é necessário expor prompts completos, perguntas, respostas ou conteúdo das fontes. A auditoria usa identificadores, finalidade, modelo, contagens e resultado para permitir controlo operacional sem transformar o painel administrativo num leitor de conversas privadas.

## Limitações Atuais Da IA

Para o relatório ser tecnicamente rigoroso, convém assumir explicitamente as limitações atuais:

- os guardrails são lexicais e não constituem moderação semântica completa;
- a seleção de fontes é lexical, sem embeddings ou base vetorial;
- não existe pesquisa web, streaming, memória global ou utilização autónoma de ferramentas;
- a identificação administrativa do provider não permite trocar dinamicamente a OpenAI;
- uma falha depois da reserva de quota pode consumir as unidades reservadas;
- nos quizzes privados, as soluções chegam ao browser dentro do artefacto e não devem ser tratadas como avaliação inviolável;
- na voz pedagógica das áreas pessoais, `tone` está integrado nos prompts principais, mas `detailLevel` e `notes` ainda não têm aplicação consistente em todos os geradores;
- `STUDY_GROUP` e `STUDY_ROOM` usam o mesmo modelo estrutural de sala, embora mantenham consentimentos, interações e históricos distintos no Assistente;
- alguns fluxos especializados permanecem acessíveis por endpoints ou rotas de compatibilidade, sem uma superfície principal equivalente na navegação atual.

## Turmas, Disciplinas, Materiais Oficiais E Voz Docente

As turmas representam o contexto escolar oficial criado por professores. Um professor pode criar turmas, definir código, ano letivo e adicionar alunos. Os alunos só veem as turmas onde estão inscritos.

As disciplinas pertencem a uma turma. Servem para organizar materiais oficiais, IA docente, mini-testes, rankings, revisões e contextos de aprendizagem.

Os materiais oficiais são submetidos por professores para uma disciplina. Ao contrário dos materiais privados, representam fontes validadas pelo professor. Podem ser texto ou URL. Materiais processados alimentam a IA da disciplina.

A voz docente é uma configuração textual de estilo pedagógico. Não é clonagem áudio. Define tom, detalhe e regras da IA no contexto oficial.

A voz docente segue uma regra de herança:

1. override da disciplina;
2. voz base da turma;
3. default seguro.

Isto permite ter uma voz comum para a turma e ajustes específicos por disciplina. A voz docente não deve atravessar para áreas privadas do aluno ou salas livres, porque esses contextos têm regras próprias.

Na interface do professor, a voz base da turma é configurada numa modal aberta a partir da página de turmas. A disciplina pode ter um override próprio, mas, se não tiver, herda a configuração da turma. A configuração não altera permissões nem fontes: apenas orienta a forma como a IA responde dentro do contexto oficial já autorizado.

As opções principais são:

| Campo             | Opções                                                                          | Efeito                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Tom               | `Calmo`, `Direto`, `Socrático`                                                  | Define a postura da IA: mais encorajadora, mais objetiva ou mais guiada por perguntas.                     |
| Detalhe           | `Curto`, `Equilibrado`, `Detalhado`                                             | Define o tamanho e profundidade da explicação.                                                             |
| Estratégia        | `Sem preferência`, `Perguntas orientadoras`, `Passo a passo`, `Resposta direta` | Indica como a IA deve conduzir a explicação antes de chegar à resposta final.                              |
| Feedback ao aluno | `Sem preferência`, `Dar pistas`, `Explicar o erro`, `Validar rápido`            | Indica como a IA deve reagir a respostas erradas, incompletas ou corretas.                                 |
| Exemplos          | `Sem preferência`, `Ligados à PAP`, `Do quotidiano`, `Código/projeto`           | Aproxima os exemplos do estilo do professor, da turma e do contexto de aprendizagem.                       |
| Limites           | `Sem preferência`, `Fontes primeiro`, `Sem extrapolar`, `Confirmar compreensão` | Reforça fronteiras pedagógicas e de segurança, sobretudo quando a resposta depende dos materiais oficiais. |
| Orientações da IA | texto livre, uma orientação por linha                                           | Permite ao professor acrescentar hábitos próprios, limites, exemplos preferidos ou formas de correção.     |

As opções guiadas e as orientações livres contam para o mesmo limite: no máximo 12 orientações por configuração, com 180 caracteres por orientação. Na API, estas orientações continuam a ser guardadas no campo técnico `rules`, mas na interface aparecem como "Orientações da IA" porque representam instruções pedagógicas para a voz docente, não regras disciplinares ou regras de avaliação.

Quando a IA da disciplina responde, o backend constrói o prompt com três blocos da voz docente:

- tom docente;
- nível de detalhe;
- orientações do professor para a IA.

Mesmo com estas opções, a IA continua limitada aos materiais oficiais processados da disciplina. A voz docente muda o estilo pedagógico da resposta, mas não autoriza conhecimento externo, materiais de outras turmas ou dados privados do aluno.

## IA Da Disciplina E Contexto Docente

A IA da disciplina é usada por alunos inscritos numa disciplina através do Assistente de estudo. O launcher reconhece a rota da disciplina e abre a conversa ativa mais recente desse contexto ou permite criar uma nova. Os bookmarks antigos de IA encaminham para a página completa do Assistente sem remover os endpoints anteriores.

A resposta é baseada em materiais oficiais processados e aplica a voz docente efetiva.

Antes de responder, o backend valida:

- se o utilizador é aluno;
- se o aluno está inscrito na turma da disciplina;
- se existem materiais oficiais processados;
- se existe consentimento para IA;
- se a política de modelo permite a chamada;
- se a quota permite consumo;
- se a resposta cita apenas materiais autorizados.

Este fluxo é diferente da IA privada. Na IA privada, as fontes pertencem ao aluno. Na IA da disciplina, as fontes pertencem ao contexto oficial criado pelo professor.

O histórico comum da IA da disciplina é privado do aluno. O professor controla materiais e voz, mas não recebe acesso às conversas normais do Assistente da disciplina. O audit log regista sucesso ou falha da operação sem guardar prompts completos ou respostas sensíveis. Isto cria rastreabilidade sem expor dados privados.

## Chat Aluno-Professor Por Disciplina

O chat aluno-professor é um canal coletivo contextual a uma disciplina, não uma conversa privada entre duas pessoas. Não é um botão flutuante global: aparece como ação `Chat`, com ícone de mensagem, nas listagens de disciplinas do aluno e do professor. Ao clicar, o utilizador entra numa página própria:

- aluno: `/app/disciplinas/:subjectId/chat`;
- professor: `/app/professor/disciplinas/:subjectId/chat`.

Esta decisão mantém a conversa ligada ao contexto correto. Uma disciplina tem um único canal onde todos os alunos inscritos e o professor responsável podem trocar mensagens. A implementação atual não oferece mensagens privadas aluno-professor nem mistura este canal com o chat aluno-aluno dos grupos de estudo.

Tecnicamente, o chat combina duas peças:

- REST para carregar o histórico persistido:
    - `GET /api/student/subjects/:subjectId/chat/messages`;
    - `GET /api/teacher/subjects/:subjectId/chat/messages`;
- WebSocket no namespace `/subject-chat` para `subject-chat:join`, `subject-chat:send`, `subject-chat:message` e `subject-chat:error`.

O histórico fica em MongoDB, nos modelos `TeacherStudentChatThread` e `TeacherStudentChatMessage`. O WebSocket serve apenas para entrada e entrega em tempo real; os endpoints REST devolvem as 100 mensagens mais recentes.

Antes de o utilizador entrar ou enviar mensagem, o backend valida:

- sessão HttpOnly `sf_sid`;
- origem WebSocket configurada;
- inscrição do aluno na turma da disciplina;
- ownership da disciplina no caso do professor;
- texto não vazio e dentro do limite permitido;
- rate limit básico por utilizador e thread.

O frontend não envia `authorUserId`, `authorRole`, `classId` nem `teacherId`. Esses valores são derivados da sessão e da disciplina no backend. A resposta pública inclui o identificador técnico `authorUserId`, necessário para representar o autor, mas não inclui email, password hash, cookie ou metadados de sessão. A interface atual apresenta apenas “Aluno” ou “Professor”, sem mostrar o nome concreto do participante.

Este MVP não inclui paginação para além das 100 mensagens mais recentes, estado de leitura, contadores de não lidas, anexos, edição, remoção manual, presença, moderação avançada ou conversas privadas.

## Salas De Estudo, Partilhas E IA Da Sala

As salas de estudo são espaços colaborativos criados por alunos. Podem ser livres ou associadas a uma disciplina textual. Ao criar uma sala, o criador entra automaticamente como membro.

Uma sala pode ter:

- nome;
- tipo livre ou disciplina;
- descrição;
- dono;
- membros;
- partilhas;
- IA da sala;
- histórico privado de interações IA.

Dentro da sala, os membros podem partilhar notas, URLs ou referências a materiais privados próprios. Nem toda a partilha entra automaticamente na IA. Para ser usada pela IA, precisa de texto processável e de estar marcada como utilizável.

A IA da sala responde com base nas partilhas processáveis da sala. O backend valida membership antes de listar partilhas ou chamar IA. A resposta fica guardada como interação da sala, mas o histórico é privado por aluno.

O sistema também suporta partilha read-only e fork privado de respostas IA da sala. Um aluno pode partilhar uma resposta com a sala, e outro membro pode criar uma cópia privada para continuar o estudo sem alterar a resposta original.

No Assistente, a sala é o contexto `STUDY_ROOM`. Uma resposta nasce privada e só fica visível aos outros membros depois de uma ação explícita de partilha. Respostas partilhadas ou referenciadas por forks podem ser preservadas quando a conversa original é apagada.

## Grupos, Mensagens, Sessões E IA Coletiva

Os grupos de estudo reutilizam a entidade técnica `StudyRoom`. Isto evita duplicar regras de membership e torna a autorização mais consistente. Consequentemente, a mesma entidade pode aparecer no Assistente como `STUDY_GROUP` e como `STUDY_ROOM`: os membros e as fontes de base são comuns, mas as finalidades de consentimento, interações e históricos de IA são diferentes.

Um grupo pode ter:

- dono;
- título;
- disciplina opcional;
- descrição;
- membros;
- mensagens;
- notas coletivas;
- sessões de estudo;
- IA coletiva.

As mensagens e notas coletivas constituem o chat aluno-aluno atual. É um mural REST assíncrono dentro do grupo, não uma conversa privada nem um canal WebSocket. Apenas membros podem listar ou criar mensagens; a UI não recebe automaticamente novas mensagens publicadas por outros alunos e não mostra autor ou data.

As sessões de estudo permitem agendar momentos coletivos. Cada sessão tem título, data de início, duração e objetivo opcional. O backend valida que a sessão é futura e que o utilizador pertence ao grupo.

A IA coletiva usa fontes partilhadas processáveis e aplica governança de IA. Isto inclui consentimento, política de modelo, quota por grupo e auditoria. Assim, o grupo pode usar IA sem expor fontes a alunos fora do grupo. A palavra `coletiva` descreve sobretudo o contexto e as fontes: a resposta continua associada ao aluno que perguntou e não é automaticamente publicada aos restantes membros.

## Projetos, Salas Guiadas E Acompanhamento Docente

O professor pode criar projetos para a turma. Um projeto tem título, enunciado, disciplina textual opcional, data de entrega e estado. Alunos só veem projetos publicados das turmas onde estão inscritos.

A IA de projetos ajuda o aluno a dividir um projeto em passos graduais. O objetivo não é fazer o trabalho pelo aluno, mas ajudar a planear. O backend valida inscrição, consentimento, política, quota e formato da resposta. O prompt inclui o enunciado oficial, o objetivo e dificuldades indicadas pelo aluno, a orientação pedagógica do perfil e a voz docente efetiva. O plano completo continua privado; o contexto escolar pode receber apenas o evento de atividade necessário ao acompanhamento.

As salas guiadas são criadas por professores dentro de uma turma. Podem ter disciplina opcional, mas essa disciplina tem de pertencer à mesma turma e ao mesmo professor. O professor define título, objetivo, instruções, materiais oficiais, estado e se a IA está ativa.

A IA da sala guiada usa apenas os materiais processados selecionados pelo professor, aplica voz docente, consentimento `CLASS_AI` e quota da turma. Novas perguntas são aceites apenas quando a sala está aberta e a IA está ativa. O aluno pode rever o histórico depois do encerramento, mas não deve poder continuar a conversa.

Ao contrário das conversas comuns da disciplina, estas interações são supervisionadas. O professor pode consultar aluno, pergunta, resposta, fontes e voz aplicada. Se o aluno apagar a conversa, os registos supervisionados podem ser preservados segundo a regra de retenção da sala guiada, sem expor ao professor o título privado da conversa.

O acompanhamento docente separa dois contextos. O Centro de Acompanhamento reúne alunos, regras de inatividade, resultados oficiais existentes e notificações. O **Resumo da turma** apresenta apenas factos já registados — alunos, disciplinas, mini-testes publicados, publicações e notas — e funciona como registo docente append-only. A aplicação não converte a quantidade de conteúdos, publicações ou notas numa percentagem de aprendizagem e não mostra mensagens técnicas sobre fases de implementação ao professor.

Os alertas de acompanhamento permitem criar regras, por exemplo para alunos inativos. O sistema consulta eventos de estudo e pode gerar notificações contextualizadas.

## Mini-Testes Oficiais, Rankings E Revisão De Conteúdo IA

Os mini-testes oficiais são avaliações criadas por professores numa disciplina e seguem o ciclo `DRAFT → PUBLISHED → CLOSED`; só `DRAFT` é editável. Cada teste tem entre 1 e 60 perguntas, exatamente quatro opções distintas por pergunta e uma resposta correta escolhida explicitamente.

O professor cria e lista testes da sua disciplina. O aluno vê apenas testes publicados de disciplinas a que tem acesso. Antes de entregar o teste ao aluno, o backend remove a resposta correta.

Cada aluno dispõe de, no máximo, três tentativas numeradas de forma atómica. As soluções completas só ficam disponíveis depois da terceira tentativa ou quando o professor fecha o teste. Quando o aluno submete respostas, o backend calcula:

- respostas certas;
- total de perguntas;
- percentagem;
- resultado por pergunta;
- data da tentativa.

O ranking dos mini-testes usa a política `BEST_ATTEMPT`: devolve uma única linha por aluno, com `attemptCount`, `bestPercentage` e `bestAnsweredAt`. Ganha a melhor percentagem; empates usam a melhor tentativa mais antiga e depois um ID estável. O professor só consulta rankings de testes da sua disciplina e a resposta não expõe emails nem respostas completas.

A revisão docente de conteúdos IA funciona como uma fila por material oficial processado. O professor revê resumos ou quizzes estruturados, aprova ou rejeita, justifica obrigatoriamente uma rejeição e pode rever a decisão; cada transição fica auditada. Apenas conteúdos atualmente `APPROVED` ficam disponíveis aos alunos inscritos.

Nos quizzes, a listagem não expõe soluções: o backend só devolve respostas certas e explicações depois de o aluno submeter todas as respostas. A tentativa é persistida com número, respostas selecionadas, pontuação e data e pode ser consultada pelo próprio aluno. Também produz um evento de atividade, mas não alimenta um ranking público ou docente específico deste conteúdo. A página de revisão não chama o provider nem gera conteúdo por IA; aplica curadoria humana ao conteúdo estruturado recebido.

## Pesquisa, Navegação Curricular E Descoberta

Pesquisa e navegação curricular não são a mesma coisa.

A pesquisa acontece quando o utilizador procura ativamente por um termo, conceito ou material. O backend recebe a query, valida os jobs de indexação autorizados e devolve resultados com excerto, material, fonte e localização.

A navegação curricular é mais estruturada. O sistema agrupa chunks indexados por material e devolve tópicos e secções. Isto ajuda o aluno a navegar pelo conteúdo como se fosse um programa de estudo.

Estes sistemas dependem da indexação. Só devem procurar em materiais que o utilizador pode ler. Isto evita fuga de dados entre alunos, grupos, turmas ou disciplinas.

Exemplos de dados devolvidos:

- título da fonte;
- localização;
- excerto;
- material;
- job de indexação;
- tópico ou secção.

## Notificações

As notificações comunicam eventos importantes a alunos, professores ou administradores. No StudyFlow, podem estar ligadas a turmas, grupos, acompanhamento, objetivos ou tarefas.

O sistema de notificações inclui:

- preferências por utilizador;
- contextos de notificação;
- notificações in-app;
- políticas administrativas de canais;
- quotas por utilizador e contexto;
- destinatários calculados no backend.

As preferências permitem configurar canais como email, push ou app, embora o foco do MVP esteja nas notificações internas. As políticas administrativas permitem ativar/desativar canais e limitar volume.

O backend deve calcular destinatários. O frontend não deve enviar livremente a lista final de alunos, porque isso poderia permitir notificações fora do contexto autorizado.

## Privacidade, RGPD E Consentimentos

Como a aplicação trata dados pessoais e dados escolares, precisa de regras de privacidade. Isto inclui conta, perfil, materiais, áreas de estudo, histórico, preferências, consentimentos e eventos de auditoria.

O utilizador deve poder:

- consultar dados associados à conta;
- pedir exportação de dados;
- descarregar um bundle minimizado;
- eliminar ou anonimizar a conta;
- gerir consentimentos de IA;
- perceber para que finalidades a IA é usada.

A exportação e a eliminação são dirigidas pelo `PersonalDataRegistry`, que obriga cada model a declarar `DELETE`, `PULL_MEMBERSHIP`, `ANONYMIZE_90D` ou `RETAIN_NONPERSONAL`. A exportação inclui todas as categorias próprias como attachment JSON, sem hashes, secrets ou dados de terceiros. A eliminação corre numa transaction, revoga todas as sessões, cria outbox para ficheiros, transforma conteúdo partilhado em tombstone e usa uma referência aleatória sem `userId`; audit anonimizado expira por TTL após 90 dias.

Conversas, drafts, interações, citações mínimas, artefactos, jobs e tentativas de quiz fazem parte do inventário de dados pessoais. Apagar apenas uma conversa tem regras mais específicas do que eliminar a conta:

- turnos exclusivamente privados podem ser apagados;
- respostas de sala já partilhadas ou referenciadas por forks podem ser retidas;
- interações de sala guiada podem ser preservadas por supervisão;
- a conversa retida transforma-se numa tombstone fora das listagens do aluno;
- artefactos criados pela conversa continuam disponíveis na área;
- a eliminação da conta continua a abranger esses artefactos e jobs, salvo retenções legais ou funcionais já declaradas.

Princípios importantes:

- minimização de dados;
- não guardar passwords em texto claro;
- não expor cookies, tokens ou prompts em logs;
- não enviar dados pessoais desnecessários ao frontend;
- separar dados privados, dados de sala, dados de grupo e dados de turma;
- registar auditoria sem copiar conteúdo sensível.

## Administração, Métricas E Operação

A administração permite gerir a plataforma no dia a dia. Nem todas as operações devem estar disponíveis para alunos ou professores.

Funções administrativas típicas:

- listar utilizadores;
- alterar papéis;
- proteger a existência de pelo menos um administrador;
- consultar audit logs;
- configurar políticas de IA;
- configurar quotas de IA;
- configurar políticas de notificação;
- consultar uso de IA;
- acompanhar eventos técnicos.

As operações críticas exigem role `ADMIN` e devem gerar auditoria. Por exemplo, mudar o papel de um utilizador cria histórico de alteração e evento de audit log.

A operação técnica usa Node `24.11.1`, npm `11.6.2`, MongoDB replica set e Redis dedicado, sempre em loopback. `/api/health/live` indica apenas que o processo vive; `/api/health/ready` e o alias `/api/health` devolvem `503` quando MongoDB, Redis, storage ou runner não estão disponíveis. O backup local é offline, gzip + AES-256-GCM, com manifesto SHA-256 e restore permitido apenas para uma base local vazia após confirmação explícita. O gate `verify:local-release` inclui 21 passos e permanece fail-closed enquanto os gates manuais do ledger estiverem pendentes.

O audit log é um ponto importante para relatório. Ele regista eventos relevantes com metadata redigida. Palavras sensíveis como password, token, cookie, prompt ou resposta são removidas ou mascaradas antes de persistência.

## Segurança, Testes, Performance E Acessibilidade

Esta secção é transversal. Não é uma funcionalidade isolada, mas garante que a aplicação é confiável.

No frontend, as rotas são lazy e protegidas por `ProtectedLayout` e `RoleGuard`, com páginas
403/404 e error boundary. O cliente HTTP usa `ApiError`, `AbortSignal` e trata JSON, texto e
204; apenas um `401` invalida a sessão. O estado de sessão distingue `checking`,
`authenticated`, `anonymous` e `unavailable`. A acessibilidade exige navegação por teclado,
focus visível, skip link, labels/descrições, live regions, contraste WCAG e testes axe, incluindo
viewports de 320/360/375/390 px. Os budgets gzip são verificados automaticamente e o cliente
Socket.IO só entra no chunk do chat.

### Segurança

Pontos técnicos importantes:

- autenticação com sessões HttpOnly;
- passwords com bcrypt;
- autorização por roles;
- validação de ownership e membership;
- WebSocket autenticado por sessão e validado por origem quando usado no chat;
- DTOs com validação e remoção de campos inesperados;
- proteção CSRF;
- headers de segurança;
- HTTPS obrigatório em ambiente adequado;
- validação de ficheiros e URLs;
- quotas e políticas antes de chamadas IA;
- audit log sem dados sensíveis.

### Testes

O projeto tem testes para validar:

- regras de backend;
- autenticação;
- sessões;
- guardrails;
- materiais e indexação;
- IA com fontes;
- voz docente;
- chat aluno-professor por disciplina;
- salas e grupos;
- mini-testes;
- privacidade;
- políticas e quotas;
- health-check;
- builds da API e da web;
- E2E frontend.

A evidência final da MF8 indica validação da planificação, testes unitários da API, build da API, build da web e E2E Playwright com sucesso.

### Performance

Áreas críticas:

- carregamento do dashboard;
- listagem de áreas, materiais e turmas;
- processamento assíncrono de documentos;
- respostas de IA com timeout;
- geração de quizzes em background;
- pesquisa em chunks indexados;
- limites de fontes no prompt;
- quotas para evitar consumo excessivo.

O backend deve evitar carregar dados desnecessários e deve limitar respostas longas, listas e payloads sensíveis. O frontend deve apresentar estados de carregamento, erro e sucesso de forma clara.

### Acessibilidade

A aplicação deve ser utilizável em diferentes dispositivos e por utilizadores com necessidades distintas.

Inclui:

- layout responsivo;
- labels em formulários;
- mensagens de erro claras;
- foco visível;
- contraste adequado;
- navegação consistente;
- feedback imediato em ações;
- estados de loading e erro compreensíveis.

## Backlog, RF, RNF E Rastreabilidade

O StudyFlow tem documentação de planeamento com RF, RNF, backlog, matriz canónica, guias BK, relatórios de implementação e evidências.

Esta rastreabilidade permite ligar:

- requisito funcional;
- requisito não funcional;
- backlog;
- sprint;
- guia técnico;
- implementação;
- teste;
- evidência.

O backlog documenta 107 BK distribuídos por MF0 a MF8. A validação final indica 57 RF, 45 RNF, 107 BK na matriz, 107 BK no backlog e 107 guias.

Isto é útil para a PAP porque mostra que a aplicação não foi construída apenas por páginas soltas. Existe ligação entre planeamento, requisitos, implementação e validação.

## Sistemas Que Convém Destacar Na Defesa

Para a defesa, vale a pena escolher fluxos que mostrem a integração entre vários módulos.

Fluxos fortes:

- login com sessão HttpOnly;
- criação de área de estudo;
- submissão ou importação de material;
- indexação de material;
- dashboard → launcher → escolha de disciplina → pergunta com fontes;
- disciplina → launcher contextual → retoma da mesma conversa;
- página completa do Assistente com várias conversas por contexto;
- geração de resumo, explicação, flashcards e quiz dentro de uma conversa de área;
- refresh durante um quiz e recuperação do job persistente;
- acesso terminado com histórico read-only e citações sem links;
- criação de turma e disciplina;
- materiais oficiais;
- voz docente;
- IA da disciplina;
- sala guiada com IA supervisionada;
- chat da disciplina entre alunos inscritos e professor responsável;
- sala de estudo com partilhas e IA;
- grupo com mensagens, sessão e IA coletiva;
- mini-teste oficial com tentativa;
- ranking do mini-teste;
- privacidade, consentimentos e exportação de dados;
- painel de administração e audit log;
- health-check e evidência de testes.

Esta sequência cobre os perfis principais da aplicação: aluno, professor e administrador. Também mostra segurança, IA, colaboração, avaliação e operação.

## Como Fechar No Relatório

Uma forma forte de fechar a explicação técnica é mostrar que o StudyFlow não é apenas um conjunto de páginas, mas um sistema integrado de aprendizagem.

Texto final sugerido:

> O StudyFlow foi estruturado como uma aplicação web modular, com separação clara entre frontend, backend, base de dados e domínios funcionais. Cada módulo responde a uma área do produto, como identidade, estudo individual, materiais, IA com fontes, turmas, disciplinas, salas colaborativas, mini-testes, privacidade e administração. Esta organização permite manter o sistema seguro, testável, extensível e alinhado com os objetivos pedagógicos da PAP.

## Sugestão De Organização Para A Apresentação

Tendo em conta a complexidade do StudyFlow, a apresentação deve seguir uma ordem progressiva. O objetivo é evitar que os alunos comecem a explicar uma funcionalidade que depende de outra ainda não apresentada.

Em vez de apresentar a aplicação como uma lista de páginas, é melhor apresentar por camadas:

1. Base da plataforma;
2. estudo individual;
3. materiais e preparação de conteúdo;
4. Assistente de estudo e IA individual;
5. governança da IA;
6. contexto escolar com turmas e professores;
7. colaboração entre alunos;
8. avaliação e acompanhamento;
9. pesquisa, notificações e descoberta;
10. privacidade, administração e operação.

### 1. Base Da Plataforma

Primeiro deve ser explicada a fundação técnica da aplicação.

Inclui:

- frontend React;
- backend NestJS;
- MongoDB;
- autenticação;
- sessões HttpOnly;
- roles de aluno, professor e administrador;
- validação, segurança, CSRF, ownership e membership. (não precisam de explicar ou falar detalhadamente sobre cada uma destas, mas devem situar no mapa geral. Dizer algo como "o backend valida se o aluno é dono da área, se o aluno pertence à sala, se o aluno está inscrito na disciplina, etc.")

Mensagem-chave:

> Antes de falar de IA, turmas ou salas, é preciso explicar como o StudyFlow sabe quem é o utilizador e como protege os seus dados.

### 2. Estudo Individual

Depois da base técnica, deve entrar o estudo individual, porque é o núcleo inicial da aplicação.

Inclui:

- perfil do aluno;
- rotinas;
- objetivos;
- histórico;
- áreas de estudo;
- materiais privados.

Aqui é importante explicar bem a diferença entre área de estudo e sala de estudo.

Uma área de estudo é um espaço individual do aluno para organizar materiais e usar IA privada. Uma sala de estudo é um espaço colaborativo com outros alunos.

Mensagem-chave:

> Primeiro o aluno organiza o seu próprio estudo. Só depois faz sentido falar de colaboração.

### 3. Materiais E Preparação De Conteúdo

Antes de explicar a IA, deve ser explicado que a IA precisa de fontes e conteúdo processável.

Inclui:

- submissão de materiais;
- ficheiros, URLs e tópicos;
- importação Google Drive ou OneDrive por link;
- indexação;
- chunks;
- estrutura do material;
- versões;
- contextos de materiais.

Mensagem-chave:

> A IA do StudyFlow não trabalha no vazio. Ela depende de materiais processáveis e autorizados.

### 4. Assistente De Estudo E IA Individual

Só depois dos materiais deve entrar o Assistente, porque é ele que organiza o acesso atual aos vários domínios de IA do aluno.

Inclui:

- launcher contextual e página completa;
- escolha de contexto em páginas neutras;
- disciplina, área, grupo, sala partilhada e sala guiada;
- várias conversas no mesmo contexto;
- memória limitada aos seis turnos anteriores da mesma conversa;
- respostas com citações autorizadas;
- histórico read-only quando o acesso termina;
- resumos;
- explicações;
- flashcards;
- quizzes IA;
- ação explícita para criar materiais de estudo;
- cards de artefactos ligados à tab `Praticar`;
- diferença entre conteúdo gerado pela OpenAI e processamento local do backend;
- explicações adaptativas;
- IA com fontes obrigatórias;
- conhecimento externo limitado.

Nesta fase ainda não é preciso aprofundar grupos, turmas ou rankings.

Mensagem-chave:

> O Assistente dá uma experiência única ao aluno, mas cada conversa continua limitada às fontes, permissões e regras do contexto escolhido.

### 5. Governança Da IA

Depois de mostrar o que a IA faz, deve ser explicado como é controlada.

Inclui:

- guardrails;
- consentimentos;
- políticas de modelo;
- quotas;
- limites de fontes;
- limites de prompt;
- contexto imutável;
- leases para impedir respostas ou gerações simultâneas;
- idempotência dos artefactos;
- jobs recuperáveis para quizzes;
- regras de acesso revogado, eliminação e retenção;
- auditoria sem guardar prompts sensíveis.

Mensagem-chave:

> A IA não é apenas uma chamada a um provider externo. Existe controlo técnico antes, durante e depois da utilização.

### 6. Contexto Escolar: Turmas E Professor

Depois do aluno individual, deve ser introduzido o contexto escolar.

Inclui:

- turmas;
- alunos inscritos;
- disciplinas;
- materiais oficiais;
- voz docente;
- IA da disciplina;
- Assistente contextual da disciplina;
- salas guiadas e supervisão docente das interações IA;
- chat por disciplina com professor;
- publicações da turma.

Mensagem-chave:

> Agora a aplicação passa do estudo individual para o contexto escolar organizado pelo professor.

### 7. Colaboração Entre Alunos

Só aqui devem entrar salas e grupos, porque estes conceitos dependem de utilizadores, materiais e regras de acesso.

Inclui:

- salas de estudo;
- membros;
- partilhas;
- contexto `STUDY_ROOM` no Assistente;
- histórico privado de IA da sala;
- respostas IA partilhadas em modo read-only;
- fork privado de respostas partilhadas;
- grupos de estudo;
- mensagens;
- sessões;
- contexto `STUDY_GROUP` no Assistente;
- diferença entre fontes coletivas e resposta privada do aluno.

Mensagem-chave:

> A colaboração surge depois de existirem materiais, utilizadores e permissões bem definidas.

### 8. Avaliação E Acompanhamento

Depois da colaboração e do contexto docente, devem ser explicados os sistemas de avaliação e acompanhamento.

Inclui:

- projetos;
- salas guiadas;
- mini-testes oficiais;
- tentativas;
- ranking docente;
- revisão de conteúdos IA;
- progresso da turma;
- alertas de acompanhamento.

Mensagem-chave:

> A aplicação não serve apenas para estudar. Também permite acompanhar, avaliar e orientar o percurso dos alunos.

### 9. Pesquisa, Notificações E Descoberta

Estes sistemas devem ser apresentados como apoio à experiência principal.

Inclui:

- pesquisa unificada;
- navegação curricular;
- notificações in-app;
- preferências;
- políticas de notificação.

Mensagem-chave:

> Estes sistemas ajudam o utilizador a encontrar informação e a receber avisos relevantes dentro do contexto certo.

### 10. Privacidade, Administração E Operação

No fim devem entrar os sistemas que provam robustez técnica e maturidade do projeto.

Inclui:

- RGPD;
- exportação de dados;
- eliminação ou anonimização de conta;
- audit log;
- painel admin;
- gestão de roles;
- health-check;
- runtime;
- backups;
- validação de deploy;
- testes.

Mensagem-chave:

> Para além das funcionalidades visíveis, o StudyFlow tem sistemas de segurança, operação, privacidade e manutenção.

### Regra Para Evitar Confusão

Sempre que surgir uma funcionalidade que depende de outra ainda não explicada, pode ser usada esta frase:

> Esta funcionalidade depende de conceitos que vamos explicar mais à frente, por isso agora só a vamos situar no mapa geral.

No início da apresentação, pode ser mostrado um mapa geral sem explicar tudo em detalhe.

Frase útil para abrir a parte técnica:

> A aplicação tem estudo individual, IA, turmas, colaboração, avaliação e administração. Vamos explicar por ordem, porque alguns sistemas dependem dos anteriores.

Esta organização ajuda a apresentação a ter uma narrativa clara: primeiro a base, depois o estudo individual, depois a IA, depois a colaboração, depois o professor e a avaliação, e no fim a robustez técnica.
