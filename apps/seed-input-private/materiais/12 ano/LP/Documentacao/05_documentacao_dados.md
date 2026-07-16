![Header](../Images/Header.png)

# Documentação (12.º Ano) - 05 · Documentação de dados

> **Objetivo deste ficheiro**
> Descrever o modelo de dados.
> Explicar campos, tipos e validações.
> Registar índices e constraints importantes.

---

## Índice

-   [0. Enquadramento do material](#sec-0)
-   [1. [ESSENCIAL] Modelo base (tarefas e utilizadores)](#sec-1)
-   [2. [ESSENCIAL] Campos, tipos e validações](#sec-2)
-   [3. [ESSENCIAL] Índices e constraints](#sec-3)
-   [4. [EXTRA] Regras de negócio](#sec-4)
-   [Erros comuns](#erros-comuns)
-   [Boas práticas](#boas-práticas)
-   [Checkpoint](#checkpoint)
-   [Exercícios - Dados](#exercícios)
-   [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Esta secção situa o ficheiro dentro do módulo de Documentação e clarifica o tipo de informação que o tema ajuda a organizar.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam os elementos que tornam a documentação clara para leitores diferentes.
- **Aprofundamento:** as secções [EXTRA] acrescentam detalhe, critérios de qualidade ou exemplos de aplicação.
- **Ligação ao percurso:** os checkpoints e exercícios relacionam a documentação com projetos React, Node/Express, MongoDB e fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Modelo base (tarefas e utilizadores)

Vais definir **quais são as entidades principais** do teu projeto e o aspeto base de cada uma.

### O que é um modelo base

É um exemplo simples do objeto, com os campos essenciais. Não precisa de tudo, mas deve ter o que é obrigatório.

### Exemplo (tarefas)

```json
{ "_id": "...", "titulo": "Estudar", "feito": false, "createdAt": "...", "updatedAt": "..." }
```

### Exemplo (utilizadores)

```json
{ "_id": "...", "nome": "Ana", "email": "ana@escola.pt" }
```

### O que documentar aqui

-   O nome da entidade (ex.: tarefas, utilizadores).
-   Um exemplo realista.
-   Qual é a chave principal (`_id` no MongoDB).

### Dica

Se houver ligação entre entidades, mostra isso no exemplo, mesmo que seja só com `userId`.

<a id="sec-2"></a>

## 2. [ESSENCIAL] Campos, tipos e validações

Vais detalhar **cada campo**, o seu tipo e as regras de validação. Isto evita que o frontend envie dados errados.

### O que são validações

São regras que dizem o que é aceitável. Exemplo: "o título tem de ter pelo menos 3 caracteres".

### Tarefa

-   `titulo`: string, obrigatório, min 3
-   `feito`: boolean, default false
-   `createdAt`: date
-   `updatedAt`: date

### Utilizador

-   `nome`: string, obrigatório
-   `email`: string, obrigatório, unique

### Template recomendado

```text
Campo: titulo
Tipo: string
Obrigatório: sim
Regras: min 3, max 100
Exemplo válido: "Estudar"
```

### Nota importante

Se o backend valida, o frontend deve seguir as mesmas regras. Documenta ambas no mesmo sítio para não haver confusões.

### Regra de ligação com a API

Se mudares campos ou validações, atualiza o contrato em `04_documentacao_api.md` e os exemplos de testes em `07_documentacao_testes.md`.

<a id="sec-3"></a>

## 3. [ESSENCIAL] Índices e constraints

Vais explicar **porque alguns campos precisam de índices** e o que são constraints.

### O que é um índice

É uma estrutura que torna as pesquisas mais rápidas. Em troca, as escritas ficam um pouco mais lentas.

### O que é uma constraint

É uma regra global, como "este campo tem de ser único".

### Exemplos

-   `email` com `unique: true`
-   `createdAt` com índice para ordenar

### Nota

Índices aceleram leitura, mas tornam escrita mais lenta.

### O que documentar

-   Quais os campos com índice e porquê.
-   Quais os campos com `unique`.
-   Se existem índices compostos (dois campos juntos).

<a id="sec-4"></a>

## 4. [EXTRA] Regras de negócio

Vais listar regras que não são só "tipo de campo", mas sim **lógica do projeto**.

### Exemplo de regra de negócio

-   "Um utilizador só pode editar tarefas que criou".
-   "Não é possível apagar tarefas concluídas sem confirmação".

-   Não permitir tarefas vazias.
-   Email tem de ser único.
-   Utilizador só pode editar as suas tarefas.

<a id="erros-comuns"></a>

## Erros comuns

-   Campos sem tipo definido.
-   Falta de validação mínima.
-   Índices esquecidos em campos usados em filtros.
-   Documentar só exemplos, sem regras.
-   Usar nomes diferentes no backend e no frontend.

<a id="boas-práticas"></a>

## Boas práticas

-   Mantém o modelo simples.
-   Documenta o que é obrigatório.
-   Atualiza quando mudares o schema.
-   Usa exemplos reais e próximos do teu domínio.
-   Explica as regras de validação em linguagem simples.

<a id="checkpoint"></a>

## Checkpoint

-   O teu modelo tem campos e tipos claros?
-   Consegues explicar as regras principais sem olhar para o código?

<a id="exercícios"></a>

## Exercícios - Dados

1. Descreve a entidade `tarefas` com 4 campos e 1 validação.
2. Adiciona a entidade `utilizadores` e indica como ligas a `tarefas`.
3. Indica 1 índice que faria sentido criar e explica porquê.
4. Escreve um exemplo de documento válido e um inválido.

<a id="changelog"></a>

## Changelog

-   2026-01-14: criação do ficheiro sobre documentação de dados.
-   2026-01-14: expansão pedagógica com definições e templates de documentação.
-   2026-01-14: checklist de documentação oficial por entidade.
-   2026-01-14: alinhado com a estrutura mínima e completa de documentação.
-   2026-01-14: timestamps em createdAt/updatedAt e regra de ligação à API.

![Footer](../Images/Footer.png)
