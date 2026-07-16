![Header](../Images/Header.png)

# Node.js (12.º Ano) - 09 · Segurança, logging e compressão

> **Objetivo deste ficheiro**
>
> - Configurar proteções básicas numa API Express.
> - Perceber CORS, Helmet, rate limit, logging e compressão.
> - Evitar configurações inseguras comuns.
> - Distinguir segurança base de autenticação completa.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Segurança base não é opcional](#sec-1)
- [2. [ESSENCIAL] CORS e Helmet](#sec-2)
- [3. [ESSENCIAL] Logging e compressão](#sec-3)
- [4. [ESSENCIAL+] Rate limit](#sec-4)
- [5. [EXTRA] Autenticação: visão geral segura](#sec-5)
- [Exercícios - Segurança, logging e compressão](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo reforça a API antes de a expor a outros clientes. Segurança não é só login: também inclui headers, CORS, limites de abuso, logs e cuidado com informação enviada em erros.

- **Núcleo do tema:** as secções [ESSENCIAL] configuram proteções usadas em quase todas as APIs.
- **Aprofundamento:** as secções [ESSENCIAL+] adicionam proteção contra excesso de pedidos.
- **Contexto adicional:** as secções [EXTRA] situam autenticação sem a implementar toda de uma vez.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Segurança base não é opcional

### 1.1 Modelo mental

Uma API recebe input externo. Isso significa que deve assumir:

- o body pode vir inválido;
- os headers podem vir inesperados;
- a origem pode não ser a tua aplicação;
- alguém pode repetir pedidos muitas vezes;
- logs podem expor dados se forem mal pensados.

Segurança base reduz risco antes de chegares a autenticação.

---

### 1.2 Camadas simples de proteção

| Camada | Objetivo |
| --- | --- |
| Validação | Recusar dados inválidos |
| Helmet | Adicionar headers seguros |
| CORS | Controlar origens autorizadas |
| Rate limit | Reduzir abuso |
| Logging | Ver o que aconteceu |
| Erros seguros | Não expor detalhes internos |

---

### 1.3 Erros comuns

- Confiar no frontend para validar tudo.
- Usar `origin: "*"` com cookies ou credenciais.
- Escrever tokens, passwords ou cookies nos logs.

### 1.4 Checkpoint

- Porque é que o backend valida mesmo com frontend validado?
- Que tipo de problema o rate limit reduz?
- Que dados não devem aparecer em logs?

<a id="sec-2"></a>

## 2. [ESSENCIAL] CORS e Helmet

### 2.1 CORS

CORS controla que origens no browser podem chamar a tua API.

Exemplo:

```js
import cors from "cors";

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: process.env.CORS_CREDENTIALS === "true",
    })
);
```

Se usares cookies ou credenciais, não uses `origin: "*"`.

---

### 2.2 Várias origens permitidas

```js
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            callback(null, false);
        },
        credentials: process.env.CORS_CREDENTIALS === "true",
    })
);
```

Este padrão é útil quando tens frontend local e frontend publicado.

---

### 2.3 Helmet

```js
import helmet from "helmet";

app.use(helmet());
```

Helmet adiciona headers de segurança comuns. Não substitui validação nem autenticação, mas melhora a configuração base.

---

### 2.4 Erros comuns

- Confundir erro de CORS com erro do servidor. Às vezes o servidor respondeu, mas o browser bloqueou o acesso.
- Abrir CORS para tudo em produção.
- Desligar Helmet para "resolver" um problema sem entender que header causou o bloqueio.

### 2.5 Checkpoint

- O que é uma origem em CORS?
- Porque é que `credentials: true` exige origem específica?
- Que tipo de proteção Helmet adiciona?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Logging e compressão

### 3.1 Morgan em desenvolvimento

```js
import morgan from "morgan";

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
```

Morgan mostra:

- método;
- URL;
- status;
- tempo de resposta.

Exemplo:

```text
GET /api/v1/todos 200 4.321 ms
```

---

### 3.2 Logs não são `console.log` espalhado

`console.log` pode ajudar em diagnóstico rápido, mas logs de pedidos devem estar centralizados.

Regra prática:

- logs de requests ficam em middleware;
- erros passam pelo `errorHandler`;
- dados sensíveis não entram nos logs.

---

### 3.3 Compressão

```js
import compression from "compression";

app.use(compression());
```

Compressão reduz o tamanho das respostas, especialmente JSON grande ou HTML gerado no servidor.

---

### 3.4 Erros comuns

- Registar o body inteiro de pedidos com passwords.
- Deixar logs demasiado ruidosos e depois ignorá-los.
- Achar que compressão melhora tudo. Em respostas muito pequenas, o ganho é pouco.

### 3.5 Checkpoint

- Que informação Morgan mostra?
- Porque é perigoso escrever bodies completos nos logs?
- Para que serve `compression()`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Rate limit

### 4.1 Instalar

```bash
npm i express-rate-limit
```

Esta dependência justifica-se quando a API pode receber pedidos repetidos de muitos clientes ou quando queres reduzir abuso simples.

---

### 4.2 Configuração base

```js
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: "RATE_LIMITED",
            message: "Demasiados pedidos. Tenta novamente mais tarde.",
            details: [],
        },
    },
});

app.use(limiter);
```

Isto limita cada cliente a 100 pedidos por janela de 15 minutos.

---

### 4.3 Rate limit por rota

Em rotas sensíveis, como login, o limite pode ser mais restrito:

```js
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
});

app.post("/api/v1/auth/login", loginLimiter, loginController.login);
```

---

### 4.4 Checkpoint

- Que problema o rate limit tenta reduzir?
- Porque é que login pode ter limite diferente?
- O rate limit substitui autenticação?

<a id="sec-5"></a>

## 5. [EXTRA] Autenticação: visão geral segura

Autenticação responde à pergunta:

```text
Quem és?
```

Autorização responde à pergunta:

```text
Tens permissão para fazer isto?
```

Princípios importantes:

- nunca guardar passwords em texto claro;
- usar hash apropriado para passwords, como Argon2 ou bcrypt;
- usar sessões ou tokens com expiração;
- preferir cookies `HttpOnly`, `Secure` e `SameSite` quando usas cookies;
- não guardar segredos no frontend;
- validar permissões no backend.

Este capítulo não implementa autenticação completa. O objetivo é reconhecer os cuidados antes de acrescentar login a uma API.

<a id="exercicios"></a>

## Exercícios - Segurança, logging e compressão

1. Adiciona `helmet()` ao `app.js`.
2. Configura `cors()` com `CORS_ORIGIN=http://localhost:5173`.
3. Confirma que a API continua a responder a `/api/health`.
4. Adiciona `morgan`.
5. Faz um pedido e observa o log no terminal.
6. Adiciona `compression`.
7. Instala e configura `express-rate-limit`.
8. Reduz temporariamente o limite para `3` pedidos e confirma que recebes erro após várias tentativas.
9. Faz uma lista de três dados que nunca devem aparecer nos logs.
10. Explica a diferença entre autenticação e autorização.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, CORS, Helmet, logging, rate limit, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com segurança, logging, compressão e autenticação em visão geral.

![Footer](../Images/Footer.png)
