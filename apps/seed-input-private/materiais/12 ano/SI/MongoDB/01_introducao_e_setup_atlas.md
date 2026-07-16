![Header](../Images/Header.png)

# MongoDB (12.º Ano) - 01 · Introdução e setup Atlas

> **Objetivo deste ficheiro**
>
> - Perceber o papel do MongoDB numa aplicação React + Node/Express.
> - Criar uma base de dados MongoDB Atlas para desenvolvimento.
> - Configurar `MONGODB_URI` e `DB_NAME` sem expor segredos no Git.
> - Testar a ligação a partir de Node.js com o driver oficial.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] MongoDB no ecossistema fullstack](#sec-1)
- [2. [ESSENCIAL] Criar cluster, utilizador e acesso de rede](#sec-2)
- [3. [ESSENCIAL] String de ligação e `.env`](#sec-3)
- [4. [ESSENCIAL] Teste mínimo com Node.js](#sec-4)
- [5. [ESSENCIAL+] Fail fast antes de abrir o servidor](#sec-5)
- [6. [EXTRA] Diagnóstico rápido de ligação](#sec-6)
- [Exercícios - Introdução e setup Atlas](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo inicia o percurso de MongoDB. Antes de modelar documentos ou escrever queries, precisas de perceber onde a base de dados entra na arquitetura e como a ligação é configurada.

- **Núcleo do tema:** as secções [ESSENCIAL] criam a ligação entre Atlas, `.env` e Node.js.
- **Aprofundamento:** as secções [ESSENCIAL+] mostram como arrancar a API apenas quando a base de dados está pronta.
- **Contexto adicional:** as secções [EXTRA] ajudam a interpretar erros frequentes de ligação.

<a id="sec-1"></a>

## 1. [ESSENCIAL] MongoDB no ecossistema fullstack

### 1.1 Modelo mental

Numa aplicação fullstack, cada parte tem uma responsabilidade:

```text
React
  ↓ pedidos HTTP
Express / Node.js
  ↓ queries
MongoDB Atlas
```

- **React** mostra dados e envia ações do utilizador.
- **Express** valida pedidos, aplica regras e decide respostas.
- **MongoDB** guarda documentos de forma persistente.

O React nunca deve usar diretamente a string de ligação da base de dados. Essa string contém credenciais e pertence ao backend.

---

### 1.2 Coleções e documentos

MongoDB organiza dados em:

- **base de dados:** conjunto de coleções;
- **coleção:** grupo de documentos do mesmo domínio;
- **documento:** objeto BSON parecido com JSON.

Exemplo:

```json
{
    "_id": "665f1f7a0c4b5a7e4f123456",
    "titulo": "Estudar MongoDB",
    "feito": false,
    "tags": ["backend", "dados"]
}
```

---

### 1.3 MongoDB não é "JSON num servidor"

O documento parece JSON, mas MongoDB acrescenta capacidades de base de dados:

- índices;
- filtros e operadores;
- agregações;
- validação;
- controlo de concorrência;
- backups e gestão no Atlas.

---

### 1.4 Erros comuns

- Guardar `MONGODB_URI` no frontend.
- Pensar que MongoDB elimina a necessidade de validação no backend.
- Criar documentos sem estrutura mínima e depois dificultar queries.

### 1.5 Checkpoint

- Porque é que o React não deve falar diretamente com MongoDB?
- O que é uma coleção?
- O que distingue persistência em MongoDB de uma lista em memória?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Criar cluster, utilizador e acesso de rede

### 2.1 Passos no Atlas

No MongoDB Atlas:

1. Cria uma conta.
2. Cria um cluster gratuito.
3. Cria um utilizador de base de dados com password forte.
4. Define permissões adequadas para esse utilizador.
5. Configura o acesso de rede.
6. Copia a connection string para Node.js.

---

### 2.2 Utilizador de base de dados

O utilizador da base de dados não é obrigatoriamente o mesmo utilizador da tua conta Atlas.

Exemplo:

```text
username: app_user
password: uma-password-forte
```

Guarda estes valores apenas no teu `.env`.

Usa o princípio do menor privilégio: uma aplicação deve ter apenas as permissões de que precisa. Para desenvolvimento, um utilizador limitado à base de dados do projeto costuma ser suficiente. Evita usar credenciais de administração geral da conta Atlas dentro da aplicação.

---

### 2.3 Acesso de rede

Em `Network Access`, o Atlas precisa de saber que IPs podem ligar ao cluster.

Opções:

- IP específico: mais restrito e mais seguro.
- `0.0.0.0/0`: permite ligações de qualquer IP.

`0.0.0.0/0` pode reduzir fricção em desenvolvimento temporário, mas não é uma configuração segura para produção. Em projetos publicados, restringe o acesso sempre que possível.

---

### 2.4 Erros comuns

- Criar utilizador da conta Atlas e esquecer o utilizador da base de dados.
- Copiar a URI antes de substituir `<password>`.
- Usar permissões demasiado amplas quando a aplicação só precisa de ler e escrever numa base de dados.
- Deixar `0.0.0.0/0` como se fosse uma configuração segura para qualquer contexto.

### 2.5 Checkpoint

- Para que serve o utilizador de base de dados?
- Porque é que permissões mínimas reduzem risco?
- O que controla `Network Access`?
- Porque é que `0.0.0.0/0` deve ser tratado como opção temporária?

<a id="sec-3"></a>

## 3. [ESSENCIAL] String de ligação e `.env`

### 3.1 Exemplo de `.env`

```env
MONGODB_URI=mongodb+srv://app_user:PASSWORD@cluster0.xxxxx.mongodb.net/escola?retryWrites=true&w=majority
DB_NAME=escola
```

Nunca coloques valores reais num ficheiro versionado.

No `.gitignore`:

```gitignore
.env
node_modules
coverage
```

---

### 3.2 `.env.example`

Cria um `.env.example` sem segredos reais:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/DB_NAME?retryWrites=true&w=majority
DB_NAME=escola
```

Este ficheiro pode ir para Git porque é apenas um modelo.

---

### 3.3 Passwords com caracteres especiais

Se a password tiver caracteres como `@`, `#`, `/` ou `:`, pode ser necessário fazer URL encoding.

Exemplo:

```text
@  -> %40
#  -> %23
/  -> %2F
```

Se a URI falhar com erro de autenticação mesmo com dados aparentemente certos, confirma este detalhe.

---

### 3.4 Erros comuns

- Comitar `.env`.
- Usar `MONGO_URI` num ficheiro e `MONGODB_URI` noutro.
- Deixar `PASSWORD`, `USER` ou `xxxxx` na connection string.

### 3.5 Checkpoint

- Porque é que `.env` não deve ir para Git?
- Para que serve `.env.example`?
- Que nome de variável vamos usar para a connection string?

<a id="sec-4"></a>

## 4. [ESSENCIAL] Teste mínimo com Node.js

### 4.1 Instalar o driver oficial

```bash
npm i mongodb
```

A dependência `mongodb` é necessária porque é o driver oficial para Node.js.

---

### 4.2 Script de ligação

```js
// src/scripts/ping-db.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "escola";

if (!uri) {
    throw new Error("Falta MONGODB_URI no .env");
}

const client = new MongoClient(uri);

try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.command({ ping: 1 });

    console.log("MongoDB OK:", result.ok);
} finally {
    await client.close();
}
```

---

### 4.3 Script no `package.json`

Se usares Node.js LTS com suporte a `--env-file`:

```json
{
    "scripts": {
        "db:ping": "node --env-file=.env src/scripts/ping-db.js"
    }
}
```

Executa:

```bash
npm run db:ping
```

Resultado esperado:

```text
MongoDB OK: 1
```

---

### 4.4 Erros comuns

- Correr o script fora da pasta do projeto.
- Não carregar o `.env`.
- Ter IP bloqueado no Atlas.

### 4.5 Checkpoint

- Para que serve `MongoClient`?
- Porque é que fechamos a ligação no `finally`?
- Que comando confirma se a ligação está funcional?

<a id="sec-5"></a>

## 5. [ESSENCIAL+] Fail fast antes de abrir o servidor

### 5.1 Ideia central

Se a API depende de MongoDB, não deve começar a aceitar pedidos quando a base de dados não está disponível.

Fluxo recomendado:

```text
ler configuração
  ↓
ligar ao MongoDB
  ↓
abrir porta HTTP
```

---

### 5.2 `src/db/mongo.js`

```js
// src/db/mongo.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "escola";

if (!uri) {
    throw new Error("MONGODB_URI em falta");
}

const client = new MongoClient(uri);
let db;

export async function connectMongo() {
    await client.connect();
    db = client.db(dbName);
}

export function getDb() {
    if (!db) {
        throw new Error("MongoDB ainda não está ligado");
    }

    return db;
}

export async function closeMongo() {
    await client.close();
    db = undefined;
}
```

---

### 5.3 `src/server.js`

```js
import { app } from "./app.js";
import { connectMongo } from "./db/mongo.js";

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

try {
    await connectMongo();

    app.listen(PORT, HOST, () => {
        console.log(`API em http://${HOST}:${PORT}`);
    });
} catch (err) {
    console.error("Falha ao arrancar:", err.message);
    process.exitCode = 1;
}
```

---

### 5.4 Checkpoint

- Porque é que a API deve ligar ao MongoDB antes de abrir a porta?
- O que acontece se `MONGODB_URI` estiver em falta?
- Porque é que `getDb()` lança erro se ainda não houver ligação?

<a id="sec-6"></a>

## 6. [EXTRA] Diagnóstico rápido de ligação

| Sintoma | Causa provável | O que verificar |
| --- | --- | --- |
| `MongoServerSelectionError` | rede ou cluster inacessível | IP permitido, internet, cluster ativo |
| `Authentication failed` | credenciais erradas | username, password, URL encoding |
| `MONGODB_URI em falta` | variável não carregada | `.env`, script com `--env-file` |
| timeout | bloqueio de rede | firewall, rede, Atlas |

<a id="exercicios"></a>

## Exercícios - Introdução e setup Atlas

1. Cria um cluster MongoDB Atlas.
2. Cria um utilizador de base de dados com password forte.
3. Configura acesso de rede para o teu contexto de desenvolvimento.
4. Cria `.env` com `MONGODB_URI` e `DB_NAME`.
5. Cria `.env.example` sem segredos reais.
6. Cria `src/scripts/ping-db.js`.
7. Adiciona o script `db:ping` ao `package.json`.
8. Executa `npm run db:ping` e confirma `MongoDB OK: 1`.
9. Faz um erro de propósito: muda a password e identifica a mensagem.
10. Corrige a password e confirma a ligação novamente.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos em lista, modelos mentais, segurança de configuração, checkpoints e exercícios.
- 2026-04-17: capítulo criado com setup Atlas e ligação mínima Node.

![Footer](../Images/Footer.png)
