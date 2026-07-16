![Header](../Images/Header.png)

# Documentação (12.º Ano) - 09 · Documentação para agentes de IA

> **Objetivo deste ficheiro**
> Ensinar a escrever documentação clara para agentes de IA.
> Explicar conceitos base (contrato, testes, validação, guardrails).
> Definir regras, limites e formatos esperados para obter respostas úteis.

---

## Índice

-   [0. Enquadramento do material](#sec-0)
-   [1. [ESSENCIAL] O que é um contrato e porquê importa](#sec-1)
-   [2. [ESSENCIAL] Ficheiros recomendados para comunicar com a IA](#sec-2)
-   [3. [ESSENCIAL] Bloco de contexto completo (com exemplo)](#sec-3)
-   [4. [ESSENCIAL] Separar backend, frontend e fullstack](#sec-4)
-   [5. [ESSENCIAL] Testes e validação: o que são](#sec-5)
-   [6. [ESSENCIAL] Regras de estilo e guardrails](#sec-6)
-   [7. [EXTRA] Formatos de resposta e perfis de consulta](#sec-7)
-   [8. [EXTRA] Segurança e privacidade](#sec-8)
-   [9. [EXTRA] Checklist e limites: o que não alterar](#sec-9)
-   [Erros comuns](#erros-comuns)
-   [Boas práticas](#boas-práticas)
-   [Checkpoint](#checkpoint)
-   [Exercícios - Documentação para IA](#exercícios)
-   [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Esta secção situa o ficheiro dentro do módulo de Documentação e clarifica o tipo de informação que o tema ajuda a organizar.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam os elementos que tornam a documentação clara para leitores diferentes.
- **Aprofundamento:** as secções [EXTRA] acrescentam detalhe, critérios de qualidade ou exemplos de aplicação.
- **Ligação ao percurso:** os checkpoints e exercícios relacionam a documentação com projetos React, Node/Express, MongoDB e fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é um contrato e porquê importa

Vais perceber o que significa "contrato" no contexto de documentação e porque isso reduz erros. Vais ver um exemplo simples de contrato para API e como ele ajuda o frontend e a IA.

### Definição simples

Um **contrato** é um acordo escrito sobre **como algo funciona**. Exemplo: "Quando chamas `POST /api/tarefas`, recebes um JSON com estes campos".

### Porque é importante

-   Evita que o frontend espere um formato e o backend envie outro.
-   Ajuda a IA a não inventar respostas.
-   Garante consistência entre exemplos e exercícios.

### Exemplo de contrato de erro (padrão do curso)

```json
{ "error": { "code": "SOME_CODE", "message": "Mensagem", "details": [] } }
```

### Exemplo de contrato de endpoint

```text
POST /api/tarefas
Body: { "titulo": "Rever React" }

201 Created
{ "_id": "...", "titulo": "Rever React", "feito": false }
```

### Checkpoint

-   O que é um contrato numa frase simples?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Ficheiros recomendados para comunicar com a IA

Vais conhecer **os ficheiros que ajudam a IA a entender o projeto**. Há uma versão mínima (3 ficheiros) e uma versão mais completa (6-7 ficheiros). Também vais ver o que colocar em cada um.

### Versão mínima (se queres começar rápido)

1. **`AGENTS.md`** (raiz)
    - Contexto da aplicação.
    - Regras globais e limites.
    - Contrato de erro padrão.
2. **`AI_CONTEXT.md`** (raiz)
    - Stack, objetivo, público, estilo.
3. **`AI_PROFILES.md`** (raiz)
    - Perfis de consulta: revisão, edição, exemplos.

### Versão completa (recomendada)

1. **`AGENTS.md`**: regras globais e guardrails.
2. **`AI_CONTEXT.md`**: contexto completo e links chave.
3. **`AI_PROFILES.md`**: perfis de consulta prontos.
4. **`AI_CONTRACTS.md`**: contratos (API, erros, dados).
5. **`AI_TESTING.md`**: testes e validação.
6. **`AI_LIMITS.md`**: o que não pode ser alterado.
7. **`AI_CHANGELOG.md`** (opcional): regras para atualizar changelog.

### Exemplo de conteúdo (AGENTS.md)

```text
- Não renomear ficheiros.
- Não criar dependências novas sem pedido.
- Contrato de erro: { error: { code, message, details } }
```

<a id="sec-3"></a>

## 3. [ESSENCIAL] Bloco de contexto completo (com exemplo)

Vais aprender a escrever um **bloco de contexto** que explica tudo o que a IA precisa para trabalhar bem, sem te perguntar.

### Estrutura recomendada

-   Stack e versões
-   Domínio (tarefas, alunos, etc.)
-   Contrato de erro
-   Estilo e tom
-   Limites principais

### Exemplo completo

```text
Contexto:
- Stack: React 18 + Vite, Node 20 (ESM), MongoDB Atlas
- Domínio: tarefas
- Contrato de erro: { error: { code, message, details } }
- Estilo: PT-PT, informal, sem emojis
- Limites: não renomear ficheiros, não criar deps novas
```

### Dica prática

Coloca este bloco no `AI_CONTEXT.md` e reutiliza-o em pedidos grandes.

<a id="sec-4"></a>

## 4. [ESSENCIAL] Separar backend, frontend e fullstack

Vais perceber quando separar a documentação por camada (backend/frontend) e quando escrever algo fullstack. Isto evita confusão e melhora as respostas da IA.

### Regra simples

-   **Fullstack:** explica o fluxo completo e os contratos globais.
-   **Backend:** foca rotas, validação, DB, middlewares.
-   **Frontend:** foca componentes, estado, fetch e UI.

### Exemplo de separação

```text
AI_CONTEXT.md (fullstack)
React/AGENTS.md (frontend)
Node/AGENTS.md (backend)
```

### Checkpoint

-   Que problemas aparecem quando misturas frontend e backend num único bloco?

<a id="sec-5"></a>

## 5. [ESSENCIAL] Testes e validação: o que são

Vais aprender o que são testes (de forma simples), porque existem e como descrever validação manual quando não há testes automáticos.

### Definição simples

-   **Teste automático:** código que confirma se algo funciona.
-   **Validação manual:** passos que tu fazes para confirmar o resultado.

### Exemplo (validação manual)

```text
Validação:
- GET /api/tarefas devolve { items, page, limit, total }
- POST /api/tarefas sem titulo -> 422
- Frontend mostra erro no ecrã
- Status codes corretos e erro no formato padrão
```

### Exemplo (teste automático)

```text
npm run test
```

### Checkpoint

-   Qual é a diferença entre teste automático e validação manual?

<a id="sec-6"></a>

## 6. [ESSENCIAL] Regras de estilo e guardrails

Vais definir **o que a IA pode e não pode fazer**. Isto é vital para proteger a estrutura do curso e evitar alterações perigosas.

### Guardrails (regras que não se quebram)

-   Não renomear ficheiros nem mudar numeração.
-   Não criar dependências novas sem pedido explícito.
-   Não usar comandos destrutivos.
-   Não inventar exemplos sem contexto.

### Regras

-   **Consistência primeiro:** mesmo domínio e mesmo contrato.
-   **Exemplos completos:** imports e exports incluídos.
-   **Explicar termos novos:** não assumir que o aluno sabe.

### Regra para pedidos à IA

-   Só alterar o que foi pedido.
-   Se faltar contexto, perguntar antes de assumir.
-   Quando assumires algo, declarar a suposição.

### Pedido mau vs pedido bom (mini exemplo)

```text
Pedido mau: "Melhora a documentação."

Pedido bom: "Revê 04_documentacao_api.md e alinha GET /api/tarefas com o envelope
{ items, page, limit, total }. Se faltar contexto, pergunta."
```

### Exemplo curto (bloco de regras)

```text
Regras:
- PT-PT, informal
- Sem emojis
- Manter estrutura dos ficheiros
```

<a id="sec-7"></a>

## 7. [EXTRA] Formatos de resposta e perfis de consulta

Vais aprender a pedir respostas mais precisas, definindo **o formato do output** e criando **perfis de consulta** (tarefas repetíveis).

### Formato de resposta (revisão)

```text
- Issues encontradas (com ficheiro)
- Sugestões concretas
- Riscos ou testes em falta
```

### Perfil de consulta (exemplo)

```text
Perfil: Revisão de docs
Objetivo: encontrar incoerências e lacunas
Output: lista de issues + sugestões
```

<a id="sec-8"></a>

## 8. [EXTRA] Segurança e privacidade

Vais aprender a proteger segredos e dados sensíveis quando pedes ajuda a IA.

-   Nunca colocar passwords reais.
-   Usar placeholders em URIs.
-   Evitar dados pessoais em exemplos.

### Exemplo seguro

```text
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/escola
```

<a id="sec-9"></a>

## 9. [EXTRA] Checklist e limites: o que não alterar

### Checklist rápido

-   O pedido foi cumprido?
-   O contrato foi mantido?
-   O changelog foi atualizado?

### Limites comuns

-   Estrutura base dos capítulos e ordem.
-   Nomes e numeração de ficheiros.
-   Contrato de erro e status codes.

<a id="erros-comuns"></a>

## Erros comuns

-   Dar pouco contexto e esperar bons resultados.
-   Deixar limites implícitos.
-   Pedir mudanças grandes sem objetivos claros.
-   Não indicar como validar o trabalho.

<a id="boas-práticas"></a>

## Boas práticas

-   Escreve blocos de contexto reutilizáveis.
-   Separa backend e frontend quando faz sentido.
-   Mantém exemplos pequenos, completos e consistentes.
-   Atualiza a documentação sempre que mudares o projeto.

<a id="checkpoint"></a>

## Checkpoint

-   Um agente consegue perceber o que pode e não pode mudar?
-   O teu contexto inclui stack, objetivo e limites?

<a id="exercícios"></a>

## Exercícios - Documentação para IA

1. Escreve um bloco de contexto completo para o teu projeto.
2. Cria uma lista de 5 guardrails.
3. Cria um `AI_CONTRACTS.md` com o contrato de erro e 2 endpoints.
4. Escreve um bloco de validação com 3 passos manuais.

<a id="changelog"></a>

## Changelog

-   2026-01-14: reorganização e explicações detalhadas de conceitos.
-   2026-01-14: expansão completa com ficheiros recomendados, guardrails e perfis.
-   2026-01-14: criação do ficheiro sobre documentação para IA.
-   2026-01-14: checklist de documentação oficial para agentes de IA.
-   2026-01-14: alinhado com a estrutura completa de documentação.
-   2026-01-14: validação manual com envelope e regra para pedidos à IA.

![Footer](../Images/Footer.png)
