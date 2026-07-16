![Header](../Images/Header.png)

# Node.js (12.º Ano) - 13 · Troubleshooting

> **Objetivo deste ficheiro**
>
> - Diagnosticar erros frequentes em projetos Node.js e Express.
> - Ler mensagens de erro com mais precisão.
> - Aplicar um método simples de depuração.
> - Ligar sintomas comuns a causas prováveis.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Método de depuração em 5 passos](#sec-1)
- [2. [ESSENCIAL] Erros de módulos e caminhos](#sec-2)
- [3. [ESSENCIAL] Erros de Express e HTTP](#sec-3)
- [4. [ESSENCIAL+] Erros de ficheiros, CORS e portas](#sec-4)
- [5. [EXTRA] Ferramentas úteis](#sec-5)
- [Exercícios - Troubleshooting](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo funciona como referência de diagnóstico para o percurso de Node.js. A ideia é transformar mensagens de erro em pistas concretas.

- **Núcleo do tema:** as secções [ESSENCIAL] cobrem método, módulos, Express e HTTP.
- **Aprofundamento:** as secções [ESSENCIAL+] tratam ficheiros, CORS e portas.
- **Contexto adicional:** as secções [EXTRA] mostram comandos úteis para investigar problemas.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Método de depuração em 5 passos

### 1.1 O método

1. **Ler a mensagem completa.** Procura ficheiro, linha, tipo de erro e stack trace.
2. **Reproduzir com o mínimo possível.** Um pedido simples com browser, curl, Thunder Client ou teste.
3. **Isolar a camada.** O problema está em rota, controller, service, repository, config ou view?
4. **Confirmar uma hipótese.** Usa logs pequenos e temporários ou um teste que falha.
5. **Corrigir e voltar a testar.** Depois remove logs temporários desnecessários.

---

### 1.2 Perguntas rápidas

- O servidor está a correr?
- Estou na pasta certa?
- A rota existe?
- O método HTTP está correto?
- O body tem `Content-Type: application/json`?
- O import tem extensão `.js`?
- O `.env` foi carregado?
- O erro acontece sempre ou só às vezes?

---

### 1.3 Erros comuns

- Ler apenas a primeira linha do erro e ignorar a stack.
- Mudar várias coisas ao mesmo tempo.
- Corrigir o sintoma sem perceber a causa.

### 1.4 Checkpoint

- Qual é o primeiro passo antes de alterar código?
- Porque é importante reproduzir o erro de forma mínima?
- Como sabes se o problema está no frontend ou backend?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Erros de módulos e caminhos

### 2.1 `ERR_MODULE_NOT_FOUND`

Mensagem típica:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module ...
```

Causas prováveis:

- caminho errado;
- falta de `.js` no import relativo;
- ficheiro não existe;
- `../` a subir pastas a mais ou a menos.

Solução:

```js
import { asyncHandler } from "../utils/asyncHandler.js";
```

Confirma:

- existe `src/utils/asyncHandler.js`?
- estás no ficheiro certo?
- o caminho relativo faz sentido a partir desse ficheiro?

---

### 2.2 `Cannot use import statement outside a module`

Causa provável:

- falta `"type": "module"` no `package.json`.

Solução:

```bash
npm pkg set type=module
```

Ou edita o `package.json`:

```json
{
    "type": "module"
}
```

---

### 2.3 `__dirname is not defined`

Em ES Modules não existe `__dirname` automático.

Solução:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

---

### 2.4 Checkpoint

- Porque é que imports relativos em ESM precisam de `.js`?
- Que ficheiro define `"type": "module"`?
- Como crias `__dirname` em ES Modules?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Erros de Express e HTTP

### 3.1 `Cannot set headers after they are sent`

Causa provável:

- a rota tentou enviar duas respostas para o mesmo pedido.

Exemplo problemático:

```js
if (!todo) {
    res.status(404).json({ error: "Não encontrado" });
}

res.json(todo);
```

Correção:

```js
if (!todo) {
    return res.status(404).json({ error: "Não encontrado" });
}

res.json(todo);
```

O `return` impede que a função continue.

---

### 3.2 `req.body` está `undefined`

Causas prováveis:

- falta `app.use(express.json())`;
- `express.json()` está depois das rotas;
- o cliente não enviou `Content-Type: application/json`;
- o body não é JSON válido.

Solução no `app.js`:

```js
app.use(express.json({ limit: "1mb" }));
```

---

### 3.3 404 numa rota que "existe"

Verifica:

- método HTTP correto (`GET` vs `POST`);
- prefixo onde o router foi montado;
- ordem dos middlewares;
- se o servidor reiniciou;
- se estás a chamar a porta certa.

Exemplo:

```js
app.use("/api/v1/todos", todosRouter);
```

Dentro do router:

```js
router.get("/", todosController.listar);
```

A URL final é:

```text
GET /api/v1/todos
```

---

### 3.4 Checkpoint

- Porque é que falta de `return` pode causar dupla resposta?
- Que middleware cria `req.body`?
- Como descobres a URL final de uma rota montada com router?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Erros de ficheiros, CORS e portas

### 4.1 `ENOENT`

Mensagem típica:

```text
ENOENT: no such file or directory
```

Causa provável:

- o ficheiro ou pasta ainda não existe;
- o caminho foi construído a partir da pasta errada.

Soluções:

```js
await fs.mkdir(path.dirname(caminho), { recursive: true });
```

Para leitura de JSON, podes devolver fallback apenas quando o ficheiro não existe:

```js
if (err.code === "ENOENT") {
    return [];
}
```

---

### 4.2 CORS bloqueado no browser

Sintoma:

```text
Access to fetch at ... has been blocked by CORS policy
```

Verifica:

- o backend tem `cors()` configurado?
- `CORS_ORIGIN` corresponde exatamente à origem do frontend?
- estás a usar cookies/credenciais?
- se há credenciais, `origin` não pode ser `"*"`.

Exemplo:

```env
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true
```

---

### 4.3 Porta ocupada

Sintoma:

```text
EADDRINUSE: address already in use
```

Soluções:

- muda `PORT` no `.env`;
- termina o processo antigo;
- confirma se tens dois terminais com a API a correr.

---

### 4.4 Servidor não acessível em ambiente remoto

Em alguns ambientes, o servidor precisa de escutar em `0.0.0.0`:

```env
HOST=0.0.0.0
PORT=3000
```

Localmente, `127.0.0.1` é uma opção mais restrita.

---

### 4.5 Checkpoint

- O que significa `ENOENT`?
- Porque é que CORS pode falhar mesmo quando o servidor respondeu?
- O que significa `EADDRINUSE`?

<a id="sec-5"></a>

## 5. [EXTRA] Ferramentas úteis

### 5.1 Ver versões

```bash
node --version
npm --version
```

---

### 5.2 Ver scripts disponíveis

```bash
npm run
```

---

### 5.3 Testar endpoint com curl

```bash
curl http://127.0.0.1:3000/api/health
```

Com POST JSON:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Testar com curl\"}"
```

---

### 5.4 Ver informação do ambiente

```bash
npx envinfo --system --binaries
```

Este comando ajuda quando precisas de confirmar versões de Node.js, npm e sistema operativo.

<a id="exercicios"></a>

## Exercícios - Troubleshooting

1. Remove `.js` de um import relativo, corre o projeto e lê o erro.
2. Corrige o import e explica a causa.
3. Remove `"type": "module"` do `package.json`, observa o erro e repõe.
4. Cria uma rota que envia duas respostas e observa `Cannot set headers after they are sent`.
5. Corrige a rota com `return`.
6. Remove temporariamente `express.json()` e faz um `POST` com JSON.
7. Corrige e confirma que `req.body` volta a funcionar.
8. Muda a porta para uma já ocupada e observa o erro.
9. Simula um `id` inexistente e confirma o formato de erro 404.
10. Escreve uma checklist própria com cinco verificações que queres fazer sempre que a API falha.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, método de depuração, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com erros comuns e estratégia inicial de troubleshooting.

![Footer](../Images/Footer.png)
