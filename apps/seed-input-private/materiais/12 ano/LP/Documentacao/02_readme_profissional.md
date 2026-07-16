![Header](../Images/Header.png)

# Documentação (12.º Ano) - 02 · README profissional

> **Objetivo deste ficheiro**
> Escrever um README claro e completo.
> Explicar o projeto, setup, scripts e envs.
> Preparar o README para avaliação e entrega final.

---

## Índice

-   [0. Enquadramento do material](#sec-0)
-   [1. [ESSENCIAL] O que é o projeto + features](#sec-1)
-   [2. [ESSENCIAL] Setup rápido + scripts](#sec-2)
-   [3. [ESSENCIAL] Variáveis de ambiente](#sec-3)
-   [4. [ESSENCIAL] Troubleshooting rápido](#sec-4)
-   [5. [EXTRA] Contribuição e licenças](#sec-5)
-   [Erros comuns](#erros-comuns)
-   [Boas práticas](#boas-práticas)
-   [Checkpoint](#checkpoint)
-   [Exercícios - README](#exercícios)
-   [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Esta secção situa o ficheiro dentro do módulo de Documentação e clarifica o tipo de informação que o tema ajuda a organizar.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam os elementos que tornam a documentação clara para leitores diferentes.
- **Aprofundamento:** as secções [EXTRA] acrescentam detalhe, critérios de qualidade ou exemplos de aplicação.
- **Ligação ao percurso:** os checkpoints e exercícios relacionam a documentação com projetos React, Node/Express, MongoDB e fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é o projeto + features

Vais aprender a **apresentar o projeto** em poucas frases e a listar as features mais importantes.

### Modelo mental

O leitor tem 30 segundos. Precisa de saber o que é e para que serve.

### O que é uma feature

Feature é uma funcionalidade que o utilizador consegue usar. Exemplo: "criar tarefa", "fazer login", "pesquisar".

### Estrutura recomendada

-   **Nome + resumo curto:** 1 a 3 frases.
-   **Features principais:** 3 a 6 pontos.
-   **Stack:** React + Node + MongoDB (se for o caso).

### Exemplo

```markdown
# Gestor de Tarefas (Fullstack)

Aplicação para criar, concluir e pesquisar tarefas. Usa React no frontend, Express no backend e MongoDB Atlas para dados.

## Features
- CRUD de tarefas
- Filtro e pesquisa
- Autenticação básica
```

### Dica

Evita jargão técnico no resumo. Guarda os detalhes técnicos para secções abaixo.

<a id="sec-2"></a>

## 2. [ESSENCIAL] Setup rápido + scripts

Vais explicar **como instalar e correr o projeto**. Esta parte tem de ser simples e direta.

### Conteúdo mínimo

-   Como instalar dependências.
-   Como correr frontend e backend.
-   Scripts principais.

### Exemplo

```bash
# frontend
npm install
npm run dev

# backend
npm install
npm run dev
```

```text
Scripts
- npm run dev: arranca o servidor local
- npm run test: corre testes
```

### O que documentar

-   Comandos de instalação (`npm install`).
-   Comandos para correr (`npm run dev`).
-   Se é preciso correr frontend e backend em terminais diferentes.

### Dica

Se houver scripts especiais (ex.: `npm run seed`), lista-os e explica o que fazem.

<a id="sec-3"></a>

## 3. [ESSENCIAL] Variáveis de ambiente

Vais explicar **o que são variáveis de ambiente** e quais são necessárias.

### O que é uma variável de ambiente

É um valor que fica fora do código e muda entre computadores/servidores (ex.: `MONGODB_URI`).

### Exemplo

```text
# backend
MONGODB_URI=...
CORS_ORIGIN=http://localhost:5173

# frontend
VITE_API_BASE=http://localhost:3000
```

### Dica

Nunca publiques segredos no README. Usa `.env.example` quando fizer sentido.

### O que documentar

-   Nome da variável.
-   Exemplo de valor.
-   Para que serve.

<a id="sec-4"></a>

## 4. [ESSENCIAL] Troubleshooting rápido

Vais ensinar **como resolver problemas comuns** sem pedir ajuda.

### Exemplos

-   **Backend não arranca:** confirma `.env` e `MONGODB_URI`.
-   **CORS bloqueado:** verifica `CORS_ORIGIN`.
-   **Página em branco:** confirma `div#root` e erros na consola.

### Dica

Usa frases curtas e diz sempre a causa provável + solução rápida.

<a id="sec-5"></a>

## 5. [EXTRA] Contribuição e licenças

Esta secção é útil se outras pessoas vão colaborar contigo.

### Contribuição

-   Explica como abrir issues.
-   Define formato de commit (opcional).

### Licença

-   Para escola, basta indicar "Uso educativo".

### Extras profissionais (curto)

-   Incluir screenshots ou demo (se o projeto tiver UI).
-   Entregar `.env.example` quando há configuração.
-   Indicar claramente o tipo de uso/licença.

<a id="erros-comuns"></a>

## Erros comuns

-   README sem passos de setup.
-   Features vagas ou demasiado técnicas.
-   Variáveis de ambiente incompletas.
-   README com comandos que já não funcionam.

<a id="boas-práticas"></a>

## Boas práticas

-   Usa frases curtas e listas.
-   Mantém exemplos pequenos e executáveis.
-   Atualiza o README sempre que mudares scripts.
-   Testa as instruções num PC novo antes de entregar.

<a id="checkpoint"></a>

## Checkpoint

-   Um colega consegue correr o projeto só com o README?
-   O README explica o que o projeto faz numa frase?
-   O README mostra claramente o primeiro passo?

<a id="exercícios"></a>

## Exercícios - README

1. Escreve um resumo de 2 frases do teu projeto.
2. Lista 5 features reais.
3. Cria a secção de troubleshooting com 3 erros comuns.
4. Testa o README num PC novo e aponta o que faltou.

<a id="changelog"></a>

## Changelog

-   2026-01-14: criação do ficheiro sobre README profissional.
-   2026-01-14: expansão pedagógica com explicações e exemplos detalhados.
-   2026-01-14: checklist de conteúdo obrigatório para README oficial.
-   2026-01-14: alinhado com a estrutura mínima e completa de documentação.
-   2026-01-14: extras profissionais (screenshots, .env.example, licença).

![Footer](../Images/Footer.png)
