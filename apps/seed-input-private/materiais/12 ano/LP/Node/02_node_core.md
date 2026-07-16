![Header](../Images/Header.png)

# Node.js (12.º Ano) - 02 · Node core útil

> **Objetivo deste ficheiro**
>
> - Conhecer módulos core do Node.js úteis em APIs e scripts.
> - Usar `path`, `fs/promises`, `process`, `os`, `events` e `crypto`.
> - Ler e escrever JSON de forma assíncrona.
> - Evitar erros comuns com caminhos, ficheiros e dados sensíveis.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que são módulos core](#sec-1)
- [2. [ESSENCIAL] `path` e caminhos portáveis](#sec-2)
- [3. [ESSENCIAL] `fs/promises` e ficheiros JSON](#sec-3)
- [4. [ESSENCIAL+] `process`, `os`, `crypto` e `events`](#sec-4)
- [5. [EXTRA] Timers e streams](#sec-5)
- [Exercícios - Node core útil](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo apresenta APIs nativas do Node.js. Antes de usar Express, é importante reconhecer o que o próprio Node.js já oferece.

- **Núcleo do tema:** as secções [ESSENCIAL] focam caminhos e ficheiros.
- **Aprofundamento:** as secções [ESSENCIAL+] mostram APIs frequentes em backends.
- **Contexto adicional:** as secções [EXTRA] introduzem ferramentas úteis quando os projetos crescem.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que são módulos core

### 1.1 Modelo mental

Módulos core são módulos que já vêm com o Node.js. Não precisas de os instalar com `npm`.

Exemplos:

```js
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
```

O prefixo `node:` indica claramente que o módulo pertence ao Node.js.

---

### 1.2 Quando usar módulos core

Usa módulos core quando o Node.js já resolve bem o problema:

- montar caminhos com `path`;
- ler ficheiros com `fs/promises`;
- gerar UUIDs com `crypto.randomUUID`;
- consultar variáveis de ambiente com `process.env`;
- criar eventos internos com `EventEmitter`.

Isto evita dependências desnecessárias.

---

### 1.3 Erros comuns

- Procurar no npm algo que o Node.js já tem.
- Importar módulos core sem o prefixo `node:` em código novo.
- Usar APIs síncronas de ficheiros dentro de servidores HTTP.

### 1.4 Checkpoint

- O que é um módulo core?
- Porque é que `node:fs/promises` não precisa de instalação?
- Que módulo usarias para gerar um UUID?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `path` e caminhos portáveis

### 2.1 O problema

Sistemas operativos usam separadores diferentes em caminhos:

```text
macOS/Linux: src/data/todos.json
Windows:     src\data\todos.json
```

Se juntares strings à mão, podes criar caminhos frágeis.

---

### 2.2 Usar `path.join`

```js
import path from "node:path";

const caminho = path.join("src", "data", "todos.json");

console.log(caminho);
```

O Node.js escolhe o separador correto para o sistema.

---

### 2.3 A partir da raiz do processo

`process.cwd()` devolve a pasta onde o comando foi executado.

```js
import path from "node:path";

const raiz = process.cwd();
const caminhoDados = path.join(raiz, "src", "data", "todos.json");

console.log(caminhoDados);
```

Este padrão é útil quando o projeto arranca sempre a partir da raiz.

---

### 2.4 A partir do ficheiro atual

Em ES Modules:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const caminhoDados = path.join(__dirname, "..", "data", "todos.json");

console.log(caminhoDados);
```

Este padrão é útil em repositories, porque o caminho fica relativo ao ficheiro onde estás.

---

### 2.5 Erros comuns

- Escrever `"src/data/todos.json"` em muitos sítios diferentes.
- Usar `__dirname` diretamente em ES Modules.
- Confundir `process.cwd()` com a pasta do ficheiro atual.

### 2.6 Checkpoint

- Para que serve `path.join`?
- Qual é a diferença entre `process.cwd()` e `__dirname`?
- Porque é que caminhos escritos à mão podem falhar em Windows?

<a id="sec-3"></a>

## 3. [ESSENCIAL] `fs/promises` e ficheiros JSON

### 3.1 Ler um ficheiro de texto

```js
import fs from "node:fs/promises";

const texto = await fs.readFile("mensagem.txt", "utf8");

console.log(texto);
```

O `await` espera pela leitura sem bloquear o event loop.

---

### 3.2 Ler JSON com fallback

```js
import fs from "node:fs/promises";

/**
 * Lê JSON de um ficheiro. Se o ficheiro não existir, devolve o fallback.
 *
 * @param {string} caminho
 * @param {unknown} fallback
 * @returns {Promise<unknown>}
 */
export async function lerJSON(caminho, fallback = null) {
    try {
        const texto = await fs.readFile(caminho, "utf8");
        return JSON.parse(texto);
    } catch (err) {
        if (err.code === "ENOENT") {
            return fallback;
        }

        throw err;
    }
}
```

`ENOENT` significa que o ficheiro não existe.

---

### 3.3 Escrever JSON com ficheiro temporário

```js
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Escreve dados em JSON com indentação.
 *
 * @param {string} caminho
 * @param {unknown} dados
 * @returns {Promise<void>}
 */
export async function escreverJSON(caminho, dados) {
    await fs.mkdir(path.dirname(caminho), { recursive: true });

    const temporario = `${caminho}.tmp`;
    const conteudo = JSON.stringify(dados, null, 2);

    await fs.writeFile(temporario, conteudo, "utf8");
    await fs.rename(temporario, caminho);
}
```

Escrever primeiro para `.tmp` reduz o risco de deixar o ficheiro principal corrompido se algo falhar durante a escrita.

---

### 3.4 Ciclo completo

```js
import path from "node:path";
import { lerJSON, escreverJSON } from "./utils/jsonFile.js";

const caminho = path.join(process.cwd(), "src", "data", "todos.json");

const todos = await lerJSON(caminho, []);

todos.push({
    id: "1",
    titulo: "Estudar Node core",
    concluido: false,
});

await escreverJSON(caminho, todos);
```

---

### 3.5 Erros comuns

- Usar `JSON.parse` sem `try/catch` quando o ficheiro pode estar inválido.
- Usar `fs.appendFile` para acrescentar objetos a um JSON. Isso pode partir a estrutura.
- Ler e escrever ficheiros grandes como se fossem pequenos.

### 3.6 Checkpoint

- Porque é que `fs/promises` combina bem com `async/await`?
- O que significa `ENOENT`?
- Porque é que escrever para `.tmp` antes de renomear é mais seguro?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] `process`, `os`, `crypto` e `events`

### 4.1 `process`

`process` dá informação sobre o processo Node.js atual.

```js
console.log(process.env.NODE_ENV);
console.log(process.pid);
console.log(process.cwd());
```

O uso mais frequente em APIs é `process.env`.

---

### 4.2 `os`

```js
import os from "node:os";

console.log(os.platform());
console.log(os.cpus().length);
console.log(os.totalmem());
```

Útil para diagnóstico e informação sobre a máquina onde o programa corre.

---

### 4.3 `crypto`

```js
import crypto from "node:crypto";

const id = crypto.randomUUID();

console.log(id);
```

Usa `crypto.randomUUID()` para IDs únicos em exemplos de ficheiros JSON.

Não uses `Math.random()` para valores que tenham impacto em segurança.

---

### 4.4 `events`

```js
import { EventEmitter } from "node:events";

const bus = new EventEmitter();

bus.on("todo:created", (todo) => {
    console.log("Nova tarefa:", todo.titulo);
});

bus.emit("todo:created", { titulo: "Estudar eventos" });
```

Eventos são úteis quando queres separar "algo aconteceu" de "quem reage a isso".

---

### 4.5 Checkpoint

- Para que serve `process.env`?
- Porque é que `crypto.randomUUID()` é melhor do que criar IDs à mão?
- Em que situação um `EventEmitter` pode ajudar?

<a id="sec-5"></a>

## 5. [EXTRA] Timers e streams

### 5.1 Timers

```js
setTimeout(() => {
    console.log("Corre uma vez depois de 1 segundo");
}, 1000);

const intervalId = setInterval(() => {
    console.log("Corre repetidamente");
}, 1000);

clearInterval(intervalId);
```

Timers entram no event loop. O tempo indicado não é uma garantia exata ao milissegundo.

---

### 5.2 Esperar com Promise

```js
/**
 * Espera durante alguns milissegundos.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function esperar(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

await esperar(500);
console.log("Meio segundo depois");
```

---

### 5.3 Streams

Streams permitem ler ou escrever dados em partes, sem carregar tudo para memória.

São úteis para:

- ficheiros grandes;
- logs;
- downloads;
- exports CSV.

Para o percurso inicial, `fs/promises` chega. Streams ficam como ferramenta para quando o tamanho dos dados exigir.

<a id="exercicios"></a>

## Exercícios - Node core útil

1. Usa `path.join` para criar um caminho até `src/data/todos.json`.
2. Cria `src/utils/jsonFile.js` com `lerJSON` e `escreverJSON`.
3. Lê uma lista de tarefas a partir de JSON com fallback `[]`.
4. Acrescenta uma tarefa com `crypto.randomUUID()`.
5. Guarda a lista no ficheiro.
6. Faz um erro de propósito: tenta ler um ficheiro que não existe e confirma que o fallback funciona.
7. Imprime `process.env.NODE_ENV` no terminal.
8. Cria um `EventEmitter` que escreve uma mensagem quando uma tarefa é criada.
9. (EXTRA) Cria uma função `esperar(ms)` e usa `await esperar(1000)`.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, exemplos completos, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com módulos core, JSON, timers e tratamento de erros.

![Footer](../Images/Footer.png)
