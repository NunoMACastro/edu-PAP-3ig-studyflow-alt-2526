![Header](../Images/Header.png)

# Documentação (12.º Ano) - 01 · Visão geral

> **Objetivo deste ficheiro**
> Entender para quem se escreve documentação.
> Distinguir níveis de documentação (iniciar, manter, entregar).
> Criar um hábito de escrever antes do projeto crescer demais.

---

## Índice

-   [0. Enquadramento do material](#sec-0)
-   [1. [ESSENCIAL] Para quem é a documentação](#sec-1)
-   [2. [ESSENCIAL] Níveis: iniciar, manter, entregar](#sec-2)
-   [3. [EXTRA] O mínimo aceitável vs completo](#sec-3)
-   [Erros comuns](#erros-comuns)
-   [Boas práticas](#boas-práticas)
-   [Checkpoint](#checkpoint)
-   [Exercícios - Visão geral](#exercícios)
-   [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Esta secção situa o ficheiro dentro do módulo de Documentação e clarifica o tipo de informação que o tema ajuda a organizar.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam os elementos que tornam a documentação clara para leitores diferentes.
- **Aprofundamento:** as secções [EXTRA] acrescentam detalhe, critérios de qualidade ou exemplos de aplicação.
- **Ligação ao percurso:** os checkpoints e exercícios relacionam a documentação com projetos React, Node/Express, MongoDB e fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Para quem é a documentação

Vais aprender **quem são os leitores** da documentação. Cada leitor precisa de coisas diferentes.

### Modelo mental

Documentação é uma conversa escrita. Mas o leitor muda, logo o foco muda.

-   **Aluno/colega:** precisa de passos claros e exemplos simples.
-   **Professor/avaliador:** quer perceber o objetivo, coerência e autonomia.
-   **Cliente/utilizador:** quer saber o que faz, os passos de utilização e onde pedir ajuda.

### O que muda com cada leitor

-   **Aluno:** quer aprender a correr e mexer no projeto.
-   **Professor:** quer ver raciocínio e organização.
-   **Cliente:** quer entender valor e limitações.

### Exemplo rápido

-   Para alunos: "Como correr o projeto".
-   Para avaliador: "Porque escolhemos MongoDB".
-   Para cliente: "Funcionalidades e limitações".

<a id="sec-2"></a>

## 2. [ESSENCIAL] Níveis: iniciar, manter, entregar

Vais perceber que documentação não é "tudo de uma vez". Existem níveis e cada nível serve um momento diferente do projeto.

### Iniciar

-   README curto: o que é, como correr, requisitos.
-   Variáveis de ambiente listadas.

### O que significa "iniciar"

É a documentação mínima para alguém correr o projeto hoje.

### Manter

-   Estrutura de pastas e responsabilidades.
-   Contrato da API e exemplos de erro.
-   Decisões técnicas (porque X e não Y).

### O que significa "manter"

É a documentação para quem vai continuar o projeto daqui a semanas/meses.

### Entregar

-   Setup completo, testes, deploy e troubleshooting.
-   Checklist final do que foi testado.

### O que significa "entregar"

É a documentação final para avaliação ou cliente. Deve estar completa e sem falhas.

### Estrutura mínima (cenário profissional)

Este é o **mínimo profissional** para um projeto fullstack. Se não houver backend ou BD, adapta os ficheiros relevantes.

-   `README.md` — resumo, setup, scripts, envs e troubleshooting.
-   `DOCUMENTACAO_TECNICA.md` — arquitetura, estrutura de pastas e fluxos críticos.
-   `API.md` — endpoints, request/response, erros e autenticação.
-   `DADOS.md` — modelos, campos, validações e índices.
-   `TESTES.md` — como correr testes e quais são críticos.
-   `DEPLOY.md` — ambientes, segredos, logs e backups.

### Estrutura completa (cenário profissional)

Inclui tudo o que está no mínimo, mais documentação interna e para agentes.

-   `DOCUMENTACAO_CODIGO.md` — convenções de nomes, comentários e JSDoc.
-   `Ficheiros de documentação para agentes` — contexto, guardrails, contratos e validação para agentes.

Estes temas estão nos ficheiros `02` a `09`.

### Evitar doc drift

-   Se mudares um endpoint, atualiza `04_documentacao_api.md` + `07_documentacao_testes.md` + changelog.
-   Se mudares um schema, atualiza `05_documentacao_dados.md` + exemplos na API + testes.
-   Se mudares auth, atualiza API + setup + documentação para IA.

<a id="sec-3"></a>

## 3. [EXTRA] O mínimo aceitável vs completo

Vais comparar o que é "suficiente" com o que é "excelente". Isto ajuda-te a gerir o tempo.

### Mínimo aceitável

-   README com setup + scripts.
-   Lista de envs.
-   2 ou 3 endpoints documentados.

### Completo

-   README, API, dados, testes, deploy, operação.
-   Decisões técnicas e fluxos críticos.

### Como escolher o nível certo

-   Se tens pouco tempo, faz o mínimo aceitável.
-   Se queres nota alta, aproxima-te do completo.

<a id="erros-comuns"></a>

## Erros comuns

-   Escrever documentação só no fim.
-   Descrever o que o código já mostra (sem valor extra).
-   Não indicar como correr o projeto.
-   Misturar público alvo (alunos vs clientes) sem explicar.

<a id="boas-práticas"></a>

## Boas práticas

-   Documenta logo após criar funcionalidades.
-   Usa exemplos reais e curtos.
-   Mantém a linguagem simples e direta.
-   Revê a documentação sempre que mudares algo importante.

<a id="checkpoint"></a>

## Checkpoint

-   Quem é o leitor principal da tua documentação?
-   O teu README atual permite correr o projeto sem ajuda?
-   Estás a escrever documentação enquanto desenvolves ou só no fim?

<a id="exercícios"></a>

## Exercícios - Visão geral

1. Escreve 3 frases para cada público (aluno, professor, cliente).
2. Faz uma lista do que falta no teu projeto para nível "manter".
3. Escolhe 1 página para atualizar hoje.
4. Escreve um parágrafo sobre porque a documentação é importante no teu projeto.

<a id="changelog"></a>

## Changelog

-   2026-01-14: criação do ficheiro de visão geral.
-   2026-01-14: expansão pedagógica com explicações e exemplos detalhados.
-   2026-01-14: estruturas mínima e completa de documentação profissional.
-   2026-01-14: regras para evitar doc drift e ligações entre docs.

![Footer](../Images/Footer.png)
