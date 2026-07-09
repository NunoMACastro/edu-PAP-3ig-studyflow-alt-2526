# Cábula Técnica Para Relatório PAP - StudyFlow

## Objetivo Do Documento

Este documento serve como apoio aos alunos para escreverem e apresentarem o relatório técnico da PAP. A linguagem é técnica, mas explicada de forma acessível, para que possa ser usada tanto no relatório como na preparação da defesa.

O StudyFlow é uma plataforma inteligente de aprendizagem que junta estudo individual, materiais escolares, IA com fontes, turmas, disciplinas, voz docente, chat aluno-professor por disciplina, salas colaborativas, grupos de estudo, mini-testes, notificações, privacidade e administração. Algumas secções descrevem funcionalidades centrais já implementadas em `real_dev`; outras resumem pontos documentados em requisitos, backlogs, guias e mapas técnicos.

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
- ferramentas de IA;
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

No StudyFlow, a sessão é baseada num cookie HttpOnly chamado `sf_sid`. O browser guarda apenas um identificador opaco. Os dados da sessão ficam no servidor e são validados pelo backend. Isto evita guardar tokens sensíveis em `localStorage`.

O perfil do aluno guarda dados escolares, como nome, ano, curso e turma textual. Estes dados ajudam a personalizar a experiência e podem influenciar respostas de IA, mas cada aluno só pode editar o seu próprio perfil.

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

A voz da área é diferente da voz docente. A voz da área é definida pelo aluno para adaptar o estilo da explicação dentro do seu espaço privado. A voz docente pertence ao professor e aplica-se ao contexto de turma ou disciplina.

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

A estrutura de materiais permite extrair tópicos, secções e referências. O versionamento permite guardar alterações e restaurar versões quando necessário. Isto é importante porque materiais escolares podem ser atualizados ao longo do tempo.

A importação externa permite criar materiais a partir de links Google Drive ou OneDrive. No estado atual, isto deve ser explicado como importação unidirecional controlada, não como sincronização completa com contas externas. O backend valida se o provider declarado corresponde ao URL e depois delega a criação para o módulo de materiais privados ou materiais oficiais.

## Ferramentas De IA: Resumos, Explicações, Flashcards E Quizzes

As ferramentas de IA são uma das partes centrais do StudyFlow. O objetivo não é ter uma IA genérica, mas gerar artefactos de estudo ligados a materiais e contextos concretos.

O sistema pode gerar:

- resumos;
- explicações;
- flashcards;
- quizzes;
- explicações adaptativas;
- respostas privadas por área;
- exportações de resumos e quizzes;
- tentativas e pontuação de quizzes IA.

A regra técnica principal é que a IA só deve ser usada quando existem fontes processáveis. O backend valida a área, carrega materiais prontos, constrói o prompt e valida a resposta devolvida pelo provider antes de guardar.

Os artefactos de IA são persistidos com fontes associadas. Isto permite explicar de onde veio a resposta e evita apresentar conteúdo como se fosse independente dos materiais.

Nos quizzes gerados por IA, o backend guarda tentativas e calcula resultados como:

- número de respostas certas;
- total de perguntas;
- percentagem;
- resultado por pergunta;
- fontes usadas.

Isto deve ser distinguido dos mini-testes oficiais. Um quiz IA é uma ferramenta privada de estudo. Um mini-teste oficial é uma avaliação criada pelo professor.

## IA Privada, IA Com Fontes E Conhecimento Externo Limitado

O StudyFlow tem vários contextos de IA. Esta separação é essencial para o relatório, porque mostra que a IA não está solta dentro da aplicação.

Os principais contextos são:

- IA privada por área de estudo;
- IA com fontes obrigatórias;
- IA da sala;
- IA coletiva de grupo;
- IA da disciplina;
- IA de projetos;
- explicações adaptativas;
- conhecimento externo limitado.

A IA privada por área responde com base nos materiais processáveis dessa área. Antes de responder, valida se o utilizador é aluno, se a área lhe pertence, se existem fontes, se existe consentimento, se há política de modelo ativa e se a quota permite a chamada.

A IA com fontes obrigatórias responde com base em jobs de indexação concluídos e autorizados. O backend seleciona chunks relevantes, normaliza citações e só depois chama o provider. Se não existirem fontes citáveis, a resposta deve ser bloqueada.

O conhecimento externo limitado é tratado como complemento, não como fonte principal. Mesmo quando permitido, deve ficar separado das fontes internas. Isto evita confundir informação verificada nos materiais com contexto geral devolvido por IA.

## Guardrails, Consentimentos, Políticas E Quotas De IA

A IA do StudyFlow tem camadas de governança. Isto é importante porque a aplicação trabalha com dados escolares, materiais pessoais, turmas e possíveis dados pessoais.

Os guardrails validam:

- papel do utilizador;
- contexto pedido;
- ownership da área individual;
- membership de sala ou grupo;
- inscrição em disciplina;
- segurança do prompt;
- finalidade pedagógica.

Os consentimentos controlam se o utilizador autorizou determinada finalidade de IA. Cada consentimento tem um estado, uma finalidade e uma versão de política.

As políticas de IA permitem configurar:

- se uma finalidade está ativa;
- provider;
- modelo;
- timeout;
- número máximo de fontes;
- tamanho máximo do prompt.

As quotas limitam o consumo mensal de IA. Podem existir quotas por utilizador, turma ou grupo. Antes de consumir IA, o backend reserva unidades. Se o limite for ultrapassado, o pedido é recusado.

Esta combinação mostra que a IA é controlada por regras técnicas, não apenas por interface.

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

## IA Da Disciplina E Contexto Docente

A IA da disciplina é usada por alunos inscritos numa disciplina. A resposta é baseada em materiais oficiais processados e aplica a voz docente efetiva.

Antes de responder, o backend valida:

- se o utilizador é aluno;
- se o aluno está inscrito na turma da disciplina;
- se existem materiais oficiais processados;
- se existe consentimento para IA;
- se a política de modelo permite a chamada;
- se a quota permite consumo;
- se a resposta cita apenas materiais autorizados.

Este fluxo é diferente da IA privada. Na IA privada, as fontes pertencem ao aluno. Na IA da disciplina, as fontes pertencem ao contexto oficial criado pelo professor.

O audit log regista sucesso ou falha da operação sem guardar prompts completos ou respostas sensíveis. Isto cria rastreabilidade sem expor dados privados.

## Chat Aluno-Professor Por Disciplina

O chat aluno-professor é contextual a uma disciplina. Não é um botão flutuante global: aparece como ação `Chat`, com ícone de mensagem, nas listagens de disciplinas do aluno e do professor. Ao clicar, o utilizador entra numa página própria:

- aluno: `/app/disciplinas/:subjectId/chat`;
- professor: `/app/professor/disciplinas/:subjectId/chat`.

Esta decisão mantém a conversa ligada ao contexto correto. Uma disciplina tem um canal onde alunos inscritos e o professor responsável podem trocar mensagens, sem misturar com o chat aluno-aluno dos grupos de estudo.

Tecnicamente, o chat combina duas peças:

- REST para carregar o histórico persistido:
  - `GET /api/student/subjects/:subjectId/chat/messages`;
  - `GET /api/teacher/subjects/:subjectId/chat/messages`;
- WebSocket no namespace `/subject-chat` para `subject-chat:join`, `subject-chat:send`, `subject-chat:message` e `subject-chat:error`.

O histórico fica em MongoDB, nos modelos `TeacherStudentChatThread` e `TeacherStudentChatMessage`. O WebSocket serve apenas para entrada e entrega em tempo real.

Antes de o utilizador entrar ou enviar mensagem, o backend valida:

- sessão HttpOnly `sf_sid`;
- origem WebSocket configurada;
- inscrição do aluno na turma da disciplina;
- ownership da disciplina no caso do professor;
- texto não vazio e dentro do limite permitido;
- rate limit básico por utilizador e thread.

O frontend não envia `authorUserId`, `authorRole`, `classId` nem `teacherId`. Esses valores são derivados da sessão e da disciplina no backend. A resposta pública da mensagem não inclui emails, password hash, cookies, metadados de sessão ou dados de outros alunos.

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

## Grupos, Mensagens, Sessões E IA Coletiva

Os grupos de estudo reutilizam a base técnica das salas. Isto evita duplicar regras de membership e torna a autorização mais consistente.

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

As mensagens e notas coletivas permitem colaboração assíncrona. Apenas membros podem listar ou criar mensagens.

As sessões de estudo permitem agendar momentos coletivos. Cada sessão tem título, data de início, duração e objetivo opcional. O backend valida que a sessão é futura e que o utilizador pertence ao grupo.

A IA coletiva usa fontes partilhadas processáveis e aplica governança de IA. Isto inclui consentimento, política de modelo, quota por grupo e auditoria. Assim, o grupo pode usar IA sem expor fontes a alunos fora do grupo.

## Projetos, Salas Guiadas E Acompanhamento Docente

O professor pode criar projetos para a turma. Um projeto tem título, enunciado, disciplina textual opcional, data de entrega e estado. Alunos só veem projetos publicados das turmas onde estão inscritos.

A IA de projetos ajuda o aluno a dividir um projeto em passos graduais. O objetivo não é fazer o trabalho pelo aluno, mas ajudar a planear. O backend valida inscrição, consentimento, política, quota e formato da resposta.

As salas guiadas são criadas por professores dentro de uma turma. Podem ter disciplina opcional, mas essa disciplina tem de pertencer à mesma turma e ao mesmo professor. O aluno vê apenas salas abertas das turmas onde está inscrito.

O acompanhamento docente inclui progresso da turma e alertas. O painel de progresso agrega sinais como testes publicados, conteúdos IA aprovados, publicações, notas e tags de dificuldade. Quando ainda não existe contrato para métricas completas de aprendizagem, o sistema deve indicar essa limitação em vez de inventar dados.

Os alertas de acompanhamento permitem criar regras, por exemplo para alunos inativos. O sistema consulta eventos de estudo e pode gerar notificações contextualizadas.

## Mini-Testes Oficiais, Rankings E Revisão De Conteúdo IA

Os mini-testes oficiais são avaliações criadas por professores numa disciplina. Cada teste tem perguntas de escolha múltipla, opções e resposta correta.

O professor cria e lista testes da sua disciplina. O aluno vê apenas testes publicados de disciplinas a que tem acesso. Antes de entregar o teste ao aluno, o backend remove a resposta correta.

Quando o aluno submete respostas, o backend calcula:

- respostas certas;
- total de perguntas;
- percentagem;
- resultado por pergunta;
- data da tentativa.

O ranking dos mini-testes é uma vista docente sobre tentativas submetidas. O professor só consulta rankings de testes da sua disciplina. O ranking mostra dados minimizados, como posição, referência do aluno, respostas certas, total, percentagem e data. Não deve expor emails nem respostas completas.

A revisão docente de conteúdos IA permite ao professor aprovar, rejeitar e comentar conteúdos gerados por IA. Isto reforça a ideia de curadoria humana: a IA ajuda, mas o professor mantém controlo pedagógico.

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

A exportação de dados junta informação relevante num formato legível, como JSON. A eliminação remove materiais, áreas e eventos de estudo, anonimiza a conta e revoga a sessão.

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

A operação técnica inclui health-check, runtime instance, backup diário, validação de deploy, verificação TLS e scripts de evidência. O endpoint `/api/health` devolve estado público mínimo sem dados pessoais.

O audit log é um ponto importante para relatório. Ele regista eventos relevantes com metadata redigida. Palavras sensíveis como password, token, cookie, prompt ou resposta são removidas ou mascaradas antes de persistência.

## Segurança, Testes, Performance E Acessibilidade

Esta secção é transversal. Não é uma funcionalidade isolada, mas garante que a aplicação é confiável.

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
- geração de resumo, quiz ou flashcards;
- IA privada por área com fontes;
- criação de turma e disciplina;
- materiais oficiais;
- voz docente;
- IA da disciplina;
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
4. IA individual;
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

### 4. IA Individual

Só depois dos materiais deve entrar a IA individual.

Inclui:

- resumos;
- explicações;
- flashcards;
- quizzes IA;
- explicações adaptativas;
- IA privada por área;
- IA com fontes obrigatórias;
- conhecimento externo limitado.

Nesta fase ainda não é preciso aprofundar grupos, turmas ou rankings.

Mensagem-chave:

> Nesta fase, a IA ajuda o aluno individualmente, usando os seus próprios materiais e fontes autorizadas.

### 5. Governança Da IA

Depois de mostrar o que a IA faz, deve ser explicado como é controlada.

Inclui:

- guardrails;
- consentimentos;
- políticas de modelo;
- quotas;
- limites de fontes;
- limites de prompt;
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
- IA da sala;
- histórico privado de IA da sala;
- respostas IA partilhadas em modo read-only;
- fork privado de respostas partilhadas;
- grupos de estudo;
- mensagens;
- sessões;
- IA coletiva.

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
