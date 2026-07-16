![Header](../Images/Header.png)

# Documentação (12.º Ano) - 03 · Documentação técnica

> **Objetivo deste ficheiro**
> Explicar arquitetura e responsabilidades.
> Descrever estrutura de pastas e camadas.
> Registar decisões técnicas (ADR simples).

---

## Índice

-   [0. Enquadramento do material](#sec-0)
-   [1. [ESSENCIAL] Arquitetura (MVC e camadas)](#sec-1)
-   [2. [ESSENCIAL] Estrutura de pastas](#sec-2)
-   [3. [ESSENCIAL] Fluxos críticos](#sec-3)
-   [4. [EXTRA] Decisões técnicas (ADR simples)](#sec-4)
-   [Erros comuns](#erros-comuns)
-   [Boas práticas](#boas-práticas)
-   [Checkpoint](#checkpoint)
-   [Exercícios - Documentação técnica](#exercícios)
-   [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Esta secção situa o ficheiro dentro do módulo de Documentação e clarifica o tipo de informação que o tema ajuda a organizar.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam os elementos que tornam a documentação clara para leitores diferentes.
- **Aprofundamento:** as secções [EXTRA] acrescentam detalhe, critérios de qualidade ou exemplos de aplicação.
- **Ligação ao percurso:** os checkpoints e exercícios relacionam a documentação com projetos React, Node/Express, MongoDB e fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Arquitetura (MVC e camadas)

Vais perceber **o que é arquitetura** e porque usar camadas ajuda a manter o projeto organizado.

### O que é arquitetura (explicação simples)

Arquitetura é a "planta" do projeto. Diz onde cada parte vive e como as partes falam entre si.

### O que é MVC

MVC é um modelo simples:

-   **Model:** dados (ex.: MongoDB, Mongoose).
-   **View:** interface (no frontend).
-   **Controller:** lógica que liga pedidos a dados.

No backend, usamos a ideia de MVC mais as **camadas** (routes, services, etc.).

### Modelo mental

-   **Routes:** ligam URL a controllers.
-   **Controllers:** validam e escolhem status code.
-   **Services:** regras de negócio.
-   **Repositories/DB:** acesso a dados.

### Regra base (quem chama quem)

Controller → Service → Repository/DB. O controller não fala diretamente com a BD.

> Se mudares um endpoint, valida se o contrato em `04_documentacao_api.md` e os dados em `05_documentacao_dados.md` continuam consistentes.

### Porque usar camadas

-   Facilita a manutenção.
-   Evita repetir lógica.
-   Torna o código mais fácil de testar.

### Exemplo curto

```text
Request -> Route -> Controller -> Service -> DB -> Response
```

### Exemplo com responsabilidades (explicado)

-   **Route:** recebe `POST /api/tarefas`.
-   **Controller:** valida dados e decide o status code.
-   **Service:** aplica regras (ex.: título mínimo).
-   **DB/Repository:** guarda a tarefa.

<a id="sec-2"></a>

## 2. [ESSENCIAL] Estrutura de pastas

Vais explicar **onde cada coisa vive**. Isto evita perder tempo a procurar ficheiros.

### Exemplo

```
src/
  app.js
  server.js
  routes/
  controllers/
  services/
  repositories/
  models/
  middlewares/
  utils/
```

### O que significa cada pasta (exemplo curto)

-   `routes/`: define URLs e liga a controllers.
-   `controllers/`: trata requests e respostas.
-   `services/`: regras de negócio.
-   `repositories/`: comunicação com a base de dados.
-   `models/`: schemas e modelos.
-   `middlewares/`: validação, auth, logs.
-   `utils/`: funções pequenas reutilizáveis.

### O que documentar aqui

-   O que vive em cada pasta.
-   Ficheiros mais importantes.
-   Dependências entre pastas (quem chama quem).

### Exemplo de descrição (modelo simples)

```text
controllers/
- tarefasController.js: valida inputs e chama tarefasService

services/
- tarefasService.js: regras de negócio e validações
```

<a id="sec-3"></a>

## 3. [ESSENCIAL] Fluxos críticos

Vais explicar **passo a passo** como o utilizador faz ações importantes no teu projeto.

### O que é um fluxo crítico

É um caminho essencial do utilizador. Se falhar, o projeto perde valor.

### Exemplos de fluxos

-   **Login:** `/auth/login` -> valida -> cria sessão.
-   **Upload:** `POST /upload` -> valida ficheiro -> guarda.
-   **Paginação:** `GET /api/tarefas?page=1&limit=20`.

### Exemplo de fluxo (login) com passos

1. Frontend envia `POST /auth/login` com email e password.
2. Backend valida credenciais.
3. Se ok, responde com `200` e dados do utilizador.
4. Se falhar, responde com `401` e erro no formato padrão.

### Como documentar

-   Passo a passo em 3 a 5 linhas.
-   JSON de entrada e saída.
-   Erros possíveis.
-   O que o frontend deve mostrar em cada erro.

<a id="sec-4"></a>

## 4. [EXTRA] Decisões técnicas (ADR simples)

Vais aprender a **registar decisões importantes** para não esqueceres o porquê.

### O que é ADR

ADR (Architecture Decision Record) é um registo curto de decisões.

### Quando escrever um ADR

-   Quando escolhes uma tecnologia (ex.: MongoDB vs MySQL).
-   Quando crias uma regra importante (ex.: usar cookies httpOnly).
-   Quando mudas algo que afeta todo o projeto.

### Template mínimo

```text
Título: Usar MongoDB Atlas
Contexto: Projeto precisa de BD na cloud
Decisão: Atlas Free Tier
Consequências: Depende de internet, mas é simples de usar
```

<a id="erros-comuns"></a>

## Erros comuns

-   Pastas sem descrição do que fazem.
-   Fluxos críticos descritos de forma vaga.
-   Não justificar decisões técnicas.
-   Misturar responsabilidades (controllers a falar com DB direto).

<a id="boas-práticas"></a>

## Boas práticas

-   Explica com diagramas simples.
-   Usa nomes consistentes com o código.
-   Atualiza quando muda a estrutura.
-   Documenta fluxos principais com exemplos reais.

<a id="checkpoint"></a>

## Checkpoint

-   Consegues explicar o fluxo de um pedido em 30 segundos?
-   As pastas do teu projeto estão descritas?
-   Sabes dizer onde vive a regra de negócio principal?

<a id="exercícios"></a>

## Exercícios - Documentação técnica

1. Desenha o fluxo de `POST /api/tarefas`.
2. Faz um parágrafo sobre a pasta `controllers/`.
3. Escreve 1 ADR simples do teu projeto.
4. Cria um mini-diagrama de camadas e explica quem chama quem.

<a id="changelog"></a>

## Changelog

-   2026-01-14: criação do ficheiro sobre documentação técnica.
-   2026-01-14: expansão pedagógica com explicações e exemplos detalhados.
-   2026-01-14: checklist de documentação técnica oficial.
-   2026-01-14: alinhado com a estrutura mínima e completa de documentação.
-   2026-01-14: regra de chamadas entre camadas e ligações a API/Dados.
-   2026-01-14: exemplo de paginação alinhado com o contrato da API.

![Footer](../Images/Footer.png)
