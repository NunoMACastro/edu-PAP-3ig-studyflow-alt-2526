![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 12 · Módulos ES

> **Objetivo deste ficheiro**
>
> - Dividir código por ficheiros com `import` e `export`.
> - Distinguir named exports e default export.
> - Usar módulos no browser e em Node.js.
> - Perceber escopo de módulo e live bindings.
> - Organizar responsabilidades sem criar camadas desnecessárias.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Porque existem módulos](#sec-1)
- [2. [ESSENCIAL] Exportar e importar](#sec-2)
- [3. [ESSENCIAL] Módulos no browser e em Node.js](#sec-3)
- [4. [ESSENCIAL+] Live bindings e import dinâmico](#sec-4)
- [5. [EXTRA] Organização e diagnóstico](#sec-5)
- [Exercícios - Módulos ES](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

À medida que o código cresce, um único ficheiro deixa de ser confortável. Módulos permitem separar responsabilidades, reutilizar funções e evitar variáveis globais.

- **Núcleo do tema:** `export`, `import`, named exports e default export.
- **Aprofundamento:** live bindings, `import()` e organização de pastas.
- **Ligação ao percurso:** React, Node, Express e projetos fullstack usam ES Modules de forma natural.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Porque existem módulos

### 1.1 Modelo mental

Um módulo é um ficheiro com escopo próprio.

```txt
math.js exporta funções
main.js importa e usa essas funções
```

Isto evita misturar tudo no mesmo espaço global.

### 1.2 Separar responsabilidades

```txt
src/
  main.js
  math.js
  strings.js
  api.js
```

Cada ficheiro deve ter uma responsabilidade clara.

### 1.3 Escopo de módulo

```js
// math.js
const segredo = 42;

export function soma(a, b) {
    return a + b;
}
```

`segredo` só existe dentro de `math.js`, a menos que seja exportado.

### 1.4 Checkpoint

- Que problema os módulos resolvem?
- O que significa escopo de módulo?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Exportar e importar

### 2.1 Named exports

```js
// math.js
export const PI = 3.14159;

export function soma(a, b) {
    return a + b;
}
```

```js
// main.js
import { PI, soma } from "./math.js";

console.log(soma(2, 3), PI);
```

Named exports obrigam a importar pelo nome exportado.

### 2.2 Renomear imports

```js
import { soma as somar } from "./math.js";
```

### 2.3 Default export

```js
// formatarPreco.js
export default function formatarPreco(valor) {
    return `${valor.toFixed(2)} €`;
}
```

```js
// main.js
import preco from "./formatarPreco.js";
```

O nome no import pode ser escolhido por quem importa.

### 2.4 Misturar com cuidado

```js
// strings.js
export default function title(texto) {
    return texto.trim().toUpperCase();
}

export const vogais = /[aeiouáéíóú]/i;
```

```js
import title, { vogais } from "./strings.js";
```

Funciona, mas se um ficheiro exportar muitas coisas, named exports costumam ser mais claros.

### 2.5 Checkpoint

- Qual é a diferença entre named export e default export?
- Porque é que named exports ajudam o autocompletar?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Módulos no browser e em Node.js

### 3.1 Browser

```html
<script type="module" src="./main.js"></script>
```

Nos módulos do browser:

- usa caminhos relativos com extensão;
- o código corre em modo estrito;
- o carregamento é diferido;
- evita abrir por `file://` quando houver imports; usa servidor local.

### 3.2 Node.js

No `package.json`:

```json
{
    "type": "module"
}
```

Depois:

```js
import fs from "node:fs/promises";

const texto = await fs.readFile("./dados.txt", "utf8");
```

### 3.3 Caminhos explícitos

```js
import { soma } from "./math.js";
```

Em ES Modules, escreve `./`, `../` e a extensão quando estiveres no browser.

### 3.4 Erros comuns

- Esquecer `type="module"` no HTML.
- Esquecer `"type": "module"` no Node.
- Importar `math` em vez de `./math.js`.
- Criar imports circulares sem perceber.

### 3.5 Checkpoint

- Como ativas módulos no browser?
- Como ativas módulos em Node.js?
- Porque é importante escrever caminhos relativos?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Live bindings e import dinâmico

### 4.1 Live bindings

Imports não são cópias soltas; apontam para o valor exportado.

```js
// contador.js
export let total = 0;

export function incrementar() {
    total++;
}
```

```js
// main.js
import { total, incrementar } from "./contador.js";

console.log(total); // 0
incrementar();
console.log(total); // 1
```

Não podes reatribuir `total` fora do módulo que o exporta.

### 4.2 `import()` dinâmico

```js
const botao = document.querySelector("#ajuda");

botao.addEventListener("click", async () => {
    const modulo = await import("./ajuda.js");
    modulo.mostrarAjuda();
});
```

Útil quando só queres carregar código depois de uma ação.

### 4.3 Top-level `await`

Em módulos, podes usar `await` no topo:

```js
const resposta = await fetch("./config.json");
export const config = await resposta.json();
```

Usa com cuidado: quem importa este módulo espera até ele terminar.

### 4.4 Checkpoint

- O que significa live binding?
- Quando faz sentido usar `import()`?
- Que cuidado deves ter com top-level `await`?

<a id="sec-5"></a>

## 5. [EXTRA] Organização e diagnóstico

### 5.1 Estrutura simples

```txt
src/
  main.js
  utils/
    numbers.js
    strings.js
  services/
    api.js
```

Começa simples. Só cria pastas quando há conteúdo suficiente para justificar.

### 5.2 Barrels com moderação

```js
// utils/index.js
export * from "./numbers.js";
export * from "./strings.js";
```

Pode simplificar imports, mas camadas a mais tornam a origem do código menos óbvia.

### 5.3 Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| `Cannot use import...` | Ficheiro não é módulo | Ativar `type="module"` |
| `Failed to resolve module` | Caminho errado | Usar `./ficheiro.js` |
| Export não encontrado | Nome errado | Confirmar named export |
| Código corre antes dos dados | Top-level await mal pensado | Isolar carregamento |
| Dependência circular | Dois módulos importam-se mutuamente | Extrair código comum |

<a id="exercicios"></a>

## Exercícios - Módulos ES

1. Cria `math.js` com `soma` e `media`; importa em `main.js`.
2. Cria `formatarPreco.js` com default export e usa-o noutro ficheiro.
3. Cria `strings.js` com `title` e `slugifyPt` como named exports.
4. Ativa módulos num ficheiro HTML com `type="module"`.
5. Cria um pequeno projeto Node com `"type": "module"` e importa uma função local.
6. Usa `import()` para carregar `ajuda.js` ao clicar num botão.
7. Cria `contador.js` com live binding e confirma que o valor importado muda depois de chamar `incrementar`.
8. Reorganiza três funções soltas em dois módulos com responsabilidades claras.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçados ES Modules no browser, Node.js, live bindings e organização simples.

![Footer](../Images/Footer.png)
