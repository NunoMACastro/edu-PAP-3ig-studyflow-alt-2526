![Header](../Images/Header.png)

# Documentação (12.º Ano) - 07 · Documentação de testes

> **Objetivo deste ficheiro**
> Explicar como correr testes.
> Identificar testes críticos do projeto.
> Mostrar exemplos de output esperado.

---

## Índice

-   [0. Enquadramento do material](#sec-0)
-   [1. [ESSENCIAL] Como correr testes](#sec-1)
-   [2. [ESSENCIAL] Testes críticos](#sec-2)
-   [3. [ESSENCIAL] Output esperado](#sec-3)
-   [4. [EXTRA] Cobertura e limites](#sec-4)
-   [Erros comuns](#erros-comuns)
-   [Boas práticas](#boas-práticas)
-   [Checkpoint](#checkpoint)
-   [Exercícios - Testes](#exercícios)
-   [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Esta secção situa o ficheiro dentro do módulo de Documentação e clarifica o tipo de informação que o tema ajuda a organizar.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam os elementos que tornam a documentação clara para leitores diferentes.
- **Aprofundamento:** as secções [EXTRA] acrescentam detalhe, critérios de qualidade ou exemplos de aplicação.
- **Ligação ao percurso:** os checkpoints e exercícios relacionam a documentação com projetos React, Node/Express, MongoDB e fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Como correr testes

Vais explicar **como iniciar os testes** e o que a pessoa deve esperar ver.

### O que é um runner de testes

É a ferramenta que corre os testes (ex.: Vitest, Jest). Normalmente está ligada ao comando `npm run test`.

### Exemplo

```bash
npm run test
```

### O que documentar

-   O comando exato para correr testes.
-   Onde estão os ficheiros de teste (ex.: `tests/` ou `src/__tests__/`).
-   Se existe modo `watch` (reexecuta quando guardas).

### Exemplo de bloco de documentação

```text
Scripts de testes
- npm run test: corre todos os testes
- npm run test:watch: corre testes e fica a observar alterações

Localização dos testes
- tests/
```

### Nota

Se os testes precisam de base de dados ou `.env`, explica como configurar antes de correr.

<a id="sec-2"></a>

## 2. [ESSENCIAL] Testes críticos

Vais aprender o que são testes críticos e porque são os primeiros a documentar.

### O que são testes críticos

São testes que validam **as funcionalidades principais** do projeto. Se falharem, o projeto deixa de funcionar como esperado.

### Exemplos

-   `GET /api/tarefas` devolve 200 e envelope `{ items, page, limit, total }`.
-   `POST /api/tarefas` devolve 201 com tarefa criada.
-   Erro de validação devolve 422.

### Como escolher os teus testes críticos

-   Fluxos mais usados pelos utilizadores.
-   Funcionalidades que dão nota (login, CRUD, pesquisa).
-   Partes que já falharam antes.

### Critério de aceitação (exemplo)

-   Status `200` no GET.
-   `items` é array.
-   `page` e `limit` são números.
-   `total` existe e é número.

### Exemplo de asserção (ideia)

```text
res.status deve ser 200
res.body.items deve ser array
res.body.page deve ser 1
res.body.limit deve ser 20
res.body.total deve ser numero
```
<a id="sec-3"></a>

## 3. [ESSENCIAL] Output esperado

Vais aprender a explicar **como ler o resultado dos testes**.

### O que é o output

É o texto que aparece no terminal quando corres os testes. Mostra o que passou e o que falhou.

### Exemplo

```text
 PASS  tests/tarefas.test.js
  ✓ GET /api/tarefas devolve 200
  ✓ POST /api/tarefas cria tarefa
```

### Exemplo de falha

```text
 FAIL  tests/tarefas.test.js
  ✕ POST /api/tarefas cria tarefa
  Expected 201, Received 500
```

### O que documentar

-   Como reconhecer um teste falhado.
-   Onde ver o erro.
-   O que fazer primeiro (ex.: confirmar `.env`, dados de teste, servidor a correr).
<a id="sec-4"></a>

## 4. [EXTRA] Cobertura e limites

### O que é cobertura

Cobertura é a percentagem de código que foi executada pelos testes. Não quer dizer que tudo está perfeito, mas ajuda a perceber o que nunca foi testado.

### Exemplo de comando

```bash
npm run test -- --coverage
```

### Nota

-   100% não é obrigatório, mas cobre o essencial.
-   Documenta o que não está testado.

<a id="erros-comuns"></a>

## Erros comuns

-   Não indicar como correr testes.
-   Testes a depender de base de dados real sem aviso.
-   Output com erros, mas sem explicar o que significam.

<a id="boas-práticas"></a>

## Boas práticas

-   Testes curtos e isolados.
-   Nomear testes com frases claras.
-   Usar dados de exemplo simples.
-   Manter testes repetíveis (não depender de dados aleatórios).

<a id="checkpoint"></a>

## Checkpoint

-   Consegues correr os testes numa máquina nova?
-   Sabes explicar a diferença entre um teste automático e validação manual?

<a id="exercícios"></a>

## Exercícios - Testes

1. Documenta o comando de testes do teu projeto.
2. Lista 3 testes críticos e explica porquê são críticos.
3. Adiciona um exemplo de output esperado e um exemplo de falha.
4. Cria uma checklist rápida para correr testes num PC novo.

<a id="changelog"></a>

## Changelog

-   2026-01-14: criação do ficheiro sobre documentação de testes.
-   2026-01-14: expansão pedagógica com explicações e exemplos detalhados.
-   2026-01-14: checklist de documentação oficial de testes.
-   2026-01-14: alinhado com a estrutura mínima e completa de documentação.
-   2026-01-14: testes críticos com envelope e critérios de aceitação.

![Footer](../Images/Footer.png)
