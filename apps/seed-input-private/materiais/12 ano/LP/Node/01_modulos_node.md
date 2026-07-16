![Header](../Images/Header.png)

# Node.js (12.º Ano) - 01 · Módulos em Node.js

> **Objetivo deste ficheiro**
>
> - Perceber para que servem módulos em Node.js.
> - Usar ES Modules com `import` e `export`.
> - Distinguir ES Modules de CommonJS.
> - Resolver erros comuns de imports relativos, extensões e exports.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que é um módulo](#sec-1)
- [2. [ESSENCIAL] `export` e `import`](#sec-2)
- [3. [ESSENCIAL] Caminhos relativos e extensões](#sec-3)
- [4. [ESSENCIAL+] CommonJS vs ES Modules](#sec-4)
- [5. [EXTRA] `import()` dinâmico e `__dirname` em ESM](#sec-5)
- [Exercícios - Módulos em Node.js](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo mostra como dividir código Node.js em ficheiros pequenos e reutilizáveis. A partir daqui, o projeto começa a ganhar organização.

- **Núcleo do tema:** as secções [ESSENCIAL] cobrem imports, exports e caminhos.
- **Aprofundamento:** as secções [ESSENCIAL+] explicam a diferença entre sistemas de módulos.
- **Contexto adicional:** as secções [EXTRA] apresentam casos que aparecem em projetos reais.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é um módulo

### 1.1 Modelo mental

Um módulo é um ficheiro JavaScript que exporta alguma coisa para outros ficheiros usarem.

Exemplo:

```text
src/
  utils/
    math.js       -> exporta funções
  app.js          -> importa e usa essas funções
```

A vantagem é simples:

- cada ficheiro tem uma responsabilidade;
- funções podem ser reutilizadas;
- o código fica mais fácil de testar;
- erros ficam mais fáceis de localizar.

---

### 1.2 Exemplo sem módulos

```js
const preco = 10;
const iva = 0.23;

const total = preco + preco * iva;

console.log(total);
```

Funciona, mas se precisares deste cálculo em vários ficheiros vais repetir código.

---

### 1.3 Exemplo com módulo

```js
// src/utils/precos.js
/**
 * Calcula o preço final com IVA.
 *
 * @param {number} preco
 * @param {number} taxa
 * @returns {number}
 */
export function calcularComIva(preco, taxa = 0.23) {
    return preco + preco * taxa;
}
```

```js
// src/app.js
import { calcularComIva } from "./utils/precos.js";

console.log(calcularComIva(10));
```

---

### 1.4 Erros comuns

- Criar ficheiros enormes porque tudo fica no mesmo sítio.
- Exportar funções com nomes pouco claros, como `fazCoisa`.
- Criar módulos demasiado pequenos antes de existir uma necessidade real.

### 1.5 Checkpoint

- O que é um módulo?
- Que problema resolves ao separar `precos.js` de `app.js`?
- Porque é que o nome `calcularComIva` é melhor do que `calc`?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `export` e `import`

### 2.1 Named exports

Named exports são a opção mais explícita quando um ficheiro exporta várias coisas.

```js
// src/utils/math.js
export function soma(a, b) {
    return a + b;
}

export function dobro(n) {
    return n * 2;
}
```

```js
// src/app.js
import { dobro, soma } from "./utils/math.js";

console.log(soma(2, 3));
console.log(dobro(4));
```

Se tentares importar um nome que não existe, o erro costuma ser claro.

---

### 2.2 Default export

Um ficheiro pode ter um `default export`.

```js
// src/utils/criarMensagem.js
export default function criarMensagem(nome) {
    return `Olá, ${nome}`;
}
```

```js
// src/app.js
import criarMensagem from "./utils/criarMensagem.js";

console.log(criarMensagem("Ana"));
```

O import de um default pode receber qualquer nome:

```js
import mensagem from "./utils/criarMensagem.js";
```

Por isso, em módulos com várias funções, os named exports costumam ser mais claros.

---

### 2.3 Misturar default e named exports

É possível, mas raramente necessário no início:

```js
export const VERSION = "1.0.0";

export default function start() {
    console.log("A iniciar");
}
```

```js
import start, { VERSION } from "./programa.js";
```

Regra prática: começa com named exports. Usa default quando o ficheiro representa claramente uma coisa principal.

---

### 2.4 Erros comuns

- Esquecer chavetas num named import: `import soma from ...` quando devia ser `import { soma } from ...`.
- Usar chavetas num default import: `import { criarMensagem } from ...` quando o ficheiro exporta default.
- Exportar tudo por default e perder clareza nos nomes.

### 2.5 Checkpoint

- Qual é a diferença entre named export e default export?
- Como importas uma função exportada com `export function soma()`?
- Quando é que um default export pode fazer sentido?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Caminhos relativos e extensões

### 3.1 Imports relativos

Em Node.js com ES Modules, imports relativos devem incluir a extensão `.js`.

```js
import { soma } from "./utils/math.js";
```

O `./` significa "a partir da pasta atual".

O `../` significa "subir uma pasta".

Exemplo:

```text
src/
  controllers/
    todos.controller.js
  services/
    todos.service.js
```

Dentro de `todos.controller.js`, para importar o service:

```js
import * as todosService from "../services/todos.service.js";
```

---

### 3.2 Imports de módulos core

Módulos core do Node.js usam o prefixo `node:`.

```js
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
```

O prefixo `node:` torna explícito que o módulo vem do próprio Node.js.

---

### 3.3 Imports de dependências npm

Dependências instaladas por `npm` são importadas pelo nome do pacote:

```js
import express from "express";
import cors from "cors";
```

Antes de importar, o pacote precisa de estar instalado:

```bash
npm i express cors
```

---

### 3.4 Checklist quando um import falha

1. O `package.json` tem `"type": "module"`?
2. O caminho começa com `./` ou `../` quando é ficheiro local?
3. O import relativo inclui `.js`?
4. O ficheiro existe nesse caminho?
5. O nome importado corresponde ao nome exportado?
6. O pacote npm está instalado?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] CommonJS vs ES Modules

### 4.1 CommonJS

CommonJS é o sistema antigo do Node.js:

```js
const fs = require("fs");

module.exports = {
    nome: "API",
};
```

Ainda aparece em muitos projetos e documentação antiga.

---

### 4.2 ES Modules

ES Modules fazem parte do JavaScript moderno:

```js
import fs from "node:fs/promises";

export const nome = "API";
```

Neste percurso usamos ES Modules porque alinham melhor com JavaScript moderno e com o que também aparece no frontend.

---

### 4.3 Tabela rápida

| Tema | CommonJS | ES Modules |
| --- | --- | --- |
| Importar | `require()` | `import` |
| Exportar | `module.exports` | `export` |
| Sistema | Histórico do Node.js | JavaScript moderno |
| Top-level await | Não | Sim |

---

### 4.4 Checkpoint

- Porque é que ainda encontras `require()` em exemplos online?
- Que sistema de módulos usamos neste percurso?
- O que acontece se tentares usar `import` sem `"type": "module"`?

<a id="sec-5"></a>

## 5. [EXTRA] `import()` dinâmico e `__dirname` em ESM

### 5.1 Import dinâmico

`import()` devolve uma Promise e pode ser usado quando só queres carregar um módulo em certas situações.

```js
async function carregarFerramentasAdmin(isAdmin) {
    if (!isAdmin) {
        return null;
    }

    return import("./admin-tools.js");
}
```

No início do percurso, imports estáticos são suficientes na maioria dos casos.

---

### 5.2 `__dirname` em ES Modules

Em CommonJS existia `__dirname`. Em ES Modules, constróis o caminho assim:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname);
```

Vais usar este padrão quando precisares de localizar ficheiros a partir do ficheiro atual.

---

### 5.3 JSON em Node.js

Para JSON local, uma abordagem clara é usar `fs/promises`:

```js
import fs from "node:fs/promises";

/**
 * Lê um ficheiro JSON.
 *
 * @param {string} caminho
 * @returns {Promise<unknown>}
 */
export async function lerJSON(caminho) {
    const texto = await fs.readFile(caminho, "utf8");
    return JSON.parse(texto);
}
```

Assim controlas erros, fallback e validação com mais clareza.

<a id="exercicios"></a>

## Exercícios - Módulos em Node.js

1. Cria `src/utils/math.js` com `soma`, `subtrai` e `dobro`.
2. Importa essas funções em `src/app.js` e imprime resultados no terminal.
3. Cria um default export em `src/utils/criarMensagem.js`.
4. Importa o default export com outro nome e confirma que funciona.
5. Faz um erro de propósito: remove `.js` de um import relativo e lê a mensagem.
6. Corrige o erro e explica por escrito o que faltava.
7. Cria `src/services/todos.service.js` e importa-o a partir de `src/controllers/todos.controller.js`.
8. Usa `node:path` para construir um caminho até `src/data/todos.json`.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, exemplos progressivos, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com ES Modules, CommonJS e checklist de imports.

![Footer](../Images/Footer.png)
