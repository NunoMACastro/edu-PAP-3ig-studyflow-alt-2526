![Header](../Images/Header.png)

# Node.js (12.º Ano) - 10 · Configuração e 12-Factor

> **Objetivo deste ficheiro**
>
> - Perceber porque a configuração não deve ficar hardcoded no código.
> - Usar variáveis de ambiente com `process.env`.
> - Criar um módulo central de configuração.
> - Aplicar a ideia 12-Factor de configuração por ambiente.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que é configuração](#sec-1)
- [2. [ESSENCIAL] `.env` e `process.env`](#sec-2)
- [3. [ESSENCIAL] Módulo `config`](#sec-3)
- [4. [ESSENCIAL+] 12-Factor](#sec-4)
- [5. [EXTRA] Configuração por ambiente](#sec-5)
- [Exercícios - Configuração e 12-Factor](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo organiza valores que mudam entre ambientes: porta, origem CORS, nível de logs, URLs externas e segredos. O código deve ler esses valores, não tê-los fixos no meio da aplicação.

- **Núcleo do tema:** as secções [ESSENCIAL] mostram `.env`, `process.env` e um módulo `config`.
- **Aprofundamento:** as secções [ESSENCIAL+] ligam isto ao princípio 12-Factor.
- **Contexto adicional:** as secções [EXTRA] tratam diferenças entre desenvolvimento, testes e produção.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é configuração

### 1.1 Modelo mental

Configuração é tudo aquilo que pode mudar sem mudares a lógica da aplicação.

Exemplos:

- porta (`PORT`);
- host (`HOST`);
- ambiente (`NODE_ENV`);
- origem permitida por CORS (`CORS_ORIGIN`);
- nível de logs (`LOG_LEVEL`);
- URL de uma API externa;
- credenciais ou chaves secretas.

Não deves escrever segredos diretamente no código:

```js
// Mau
const apiKey = "chave-real-aqui";
```

Preferível:

```js
const apiKey = process.env.API_KEY;
```

---

### 1.2 Erros comuns

- Colocar URLs de produção dentro do código.
- Comitar `.env`.
- Assumir que `process.env.PORT` é número. Variáveis de ambiente chegam como strings.

### 1.3 Checkpoint

- Dá três exemplos de configuração.
- Porque é que segredos não devem ficar no código?
- Que tipo de valor `process.env.PORT` devolve?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `.env` e `process.env`

### 2.1 Exemplo de `.env`

```env
PORT=3000
HOST=127.0.0.1
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=false
```

Com o script:

```json
{
    "scripts": {
        "dev": "node --env-file=.env --watch src/server.js"
    }
}
```

O Node.js carrega estas variáveis antes de executar `src/server.js`.

---

### 2.2 Ler no código

```js
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
    console.log(`API a escutar em http://${HOST}:${PORT}`);
});
```

---

### 2.3 `.env.example`

Cria `.env.example` com as chaves esperadas:

```env
PORT=3000
HOST=127.0.0.1
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=false
```

Este ficheiro pode ir para Git porque não contém valores secretos.

---

### 2.4 Erros comuns

- Mudar `.env` e esquecer de reiniciar o processo quando não há watch.
- Escrever `CORS_CREDENTIALS=false` e testar com `Boolean(process.env.CORS_CREDENTIALS)`, que daria `true`.
- Usar `.env.example` com segredos reais.

### 2.5 Checkpoint

- Para que serve `.env.example`?
- Porque é que `Boolean("false")` dá problema?
- Como convertes `PORT` para número?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Módulo `config`

### 3.1 Porque centralizar

Sem módulo de configuração, o projeto fica cheio de leituras diretas:

```js
process.env.PORT
process.env.CORS_ORIGIN
process.env.LOG_LEVEL
```

Centralizar ajuda a:

- converter tipos uma vez;
- validar valores obrigatórios;
- manter nomes consistentes;
- simplificar testes.

---

### 3.2 Implementação

```js
// src/utils/config.js
function parseNumber(name, defaultValue) {
    const raw = process.env[name];

    if (raw === undefined || raw === "") {
        return defaultValue;
    }

    const value = Number(raw);

    if (Number.isNaN(value)) {
        throw new Error(`Variável ${name} deve ser um número`);
    }

    return value;
}

function parseBoolean(name, defaultValue = false) {
    const raw = process.env[name];

    if (raw === undefined || raw === "") {
        return defaultValue;
    }

    if (raw === "true") return true;
    if (raw === "false") return false;

    throw new Error(`Variável ${name} deve ser "true" ou "false"`);
}

function parseList(name, defaultValue = []) {
    const raw = process.env[name];

    if (!raw) {
        return defaultValue;
    }

    return raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}

export const config = Object.freeze({
    env: process.env.NODE_ENV || "development",
    host: process.env.HOST || "127.0.0.1",
    port: parseNumber("PORT", 3000),
    logLevel: process.env.LOG_LEVEL || "info",
    cors: {
        origins: parseList("CORS_ORIGIN", ["http://localhost:5173"]),
        credentials: parseBoolean("CORS_CREDENTIALS", false),
    },
});
```

---

### 3.3 Usar no `server.js`

```js
import { app } from "./app.js";
import { config } from "./utils/config.js";

app.listen(config.port, config.host, () => {
    console.log(`API a escutar em http://${config.host}:${config.port}`);
});
```

---

### 3.4 Usar no CORS

```js
import cors from "cors";
import { config } from "./utils/config.js";

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || config.cors.origins.includes(origin)) {
                return callback(null, true);
            }

            callback(null, false);
        },
        credentials: config.cors.credentials,
    })
);
```

---

### 3.5 Erros comuns

- Espalhar `process.env` por todos os ficheiros.
- Não validar tipos.
- Definir defaults inseguros, como CORS aberto em produção.

### 3.6 Checkpoint

- Que vantagem tem um módulo `config`?
- Porque é que `Object.freeze` pode ser útil?
- Onde deve ficar a conversão de `"false"` para `false`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] 12-Factor

### 4.1 Ideia principal

12-Factor é um conjunto de princípios para aplicações web que precisam de ser fáceis de configurar, publicar e manter.

Neste capítulo interessa sobretudo este princípio:

> A configuração deve estar no ambiente, não no código.

---

### 4.2 Exemplos práticos

| Ambiente | `PORT` | `NODE_ENV` | `CORS_ORIGIN` |
| --- | --- | --- | --- |
| Desenvolvimento | `3000` | `development` | `http://localhost:5173` |
| Testes | `0` ou valor temporário | `test` | `http://localhost:5173` |
| Produção | definido pela plataforma | `production` | domínio real do frontend |

O mesmo código pode correr em ambientes diferentes porque lê configuração de fora.

---

### 4.3 Logs como streams

Outro princípio útil: logs devem ir para a saída do processo.

Em vez de escrever manualmente ficheiros de log no projeto, a aplicação escreve para stdout/stderr e a plataforma recolhe esses logs.

Morgan e outros loggers seguem esta ideia.

---

### 4.4 Checkpoint

- Qual é a ideia principal de configuração no 12-Factor?
- Porque é que a mesma app deve correr com configurações diferentes?
- Porque é que logs não devem depender de ficheiros locais em produção?

<a id="sec-5"></a>

## 5. [EXTRA] Configuração por ambiente

### 5.1 Variáveis obrigatórias

Algumas variáveis podem ser obrigatórias:

```js
function requiredEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Falta variável obrigatória: ${name}`);
    }

    return value;
}

export const config = Object.freeze({
    databaseUrl: requiredEnv("DATABASE_URL"),
});
```

Usa isto para valores sem fallback seguro, como URLs de base de dados ou segredos.

---

### 5.2 Segredos

Nunca coloques em Git:

- passwords;
- tokens;
- chaves privadas;
- connection strings reais;
- segredos JWT;
- chaves de APIs externas.

O `.gitignore` deve incluir `.env`.

<a id="exercicios"></a>

## Exercícios - Configuração e 12-Factor

1. Cria `.env` com `PORT`, `HOST`, `NODE_ENV`, `CORS_ORIGIN` e `CORS_CREDENTIALS`.
2. Cria `.env.example` sem segredos reais.
3. Atualiza o script `dev` para usar `--env-file=.env`.
4. Cria `src/utils/config.js`.
5. Implementa `parseNumber`.
6. Implementa `parseBoolean`.
7. Implementa `parseList`.
8. Usa `config.port` e `config.host` no `server.js`.
9. Usa `config.cors` no `app.js`.
10. Faz um erro de propósito: define `PORT=abc` e confirma que a app falha com mensagem clara.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, módulo `config`, 12-Factor, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com variáveis de ambiente e configuração.

![Footer](../Images/Footer.png)
