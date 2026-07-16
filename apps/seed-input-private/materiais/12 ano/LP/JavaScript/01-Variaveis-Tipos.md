![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 01 · Variáveis e tipos

> **Objetivo deste ficheiro**
>
> - Distinguir `const`, `let` e `var`.
> - Perceber o que é um tipo de dado em JavaScript.
> - Usar conversões explícitas para evitar surpresas.
> - Trabalhar com `truthy`, `falsy`, `===` e `!==`.
> - Reconhecer erros comuns de escopo, coerção e comparação.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Variáveis: nomes para valores](#sec-1)
- [2. [ESSENCIAL] Tipos primitivos e `typeof`](#sec-2)
- [3. [ESSENCIAL] Conversões, `truthy/falsy` e igualdade segura](#sec-3)
- [4. [ESSENCIAL+] Escopo, TDZ e referências](#sec-4)
- [5. [EXTRA] Diagnóstico rápido](#sec-5)
- [Exercícios - Variáveis e tipos](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo abre o percurso de JavaScript. Antes de escrever condições, ciclos, funções ou componentes React, precisas de saber guardar valores, perceber que tipo de valor tens e comparar dados sem deixar o motor da linguagem “adivinhar” por ti.

- **Núcleo do tema:** variáveis, tipos, conversões e igualdade.
- **Aprofundamento:** escopo, TDZ e diferença entre referência e conteúdo.
- **Ligação ao percurso:** estes conceitos aparecem em todos os capítulos seguintes, sobretudo em operadores, controlo de fluxo, arrays, objetos e formulários.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Variáveis: nomes para valores

### 1.1 Modelo mental

Uma variável é um **nome** que aponta para um valor.

```js
const escola = "EPMS";
let ano = 12;
```

Pensa assim:

```txt
nome da variável -> valor guardado
ano              -> 12
```

Quando lês `ano`, o JavaScript procura o valor associado a esse nome.

### 1.2 `const`, `let` e `var`

| Palavra-chave | Pode reatribuir? | Escopo principal | Uso recomendado |
| ------------- | ---------------- | ---------------- | --------------- |
| `const`       | Não              | Bloco `{}`       | Por defeito |
| `let`         | Sim              | Bloco `{}`       | Contadores e valores que mudam |
| `var`         | Sim              | Função           | Evitar em código novo |

```js
const nome = "Ana";
let pontos = 0;

pontos = pontos + 10;
// nome = "Rita"; // TypeError: não podes reatribuir uma const
```

`const` não significa que o conteúdo interno nunca muda. Significa que a variável não pode apontar para outro valor.

```js
const perfil = { nome: "Ana", pontos: 10 };
perfil.pontos = 12; // válido: o objeto é o mesmo

// perfil = {}; // inválido: tenta mudar a referência
```

### 1.3 Erros comuns

- Usar `var` por hábito e depois ter valores a “vazar” para fora de blocos.
- Declarar uma variável sem a inicializar e assumir que tem valor útil.
- Pensar que `const` torna objetos e arrays completamente imutáveis.

### 1.4 Checkpoint

- Quando deves usar `const`?
- Qual é a diferença entre reatribuir uma variável e alterar uma propriedade de um objeto?
- Porque é que `var` deve ser evitado em código moderno?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Tipos primitivos e `typeof`

### 2.1 Os tipos mais importantes

JavaScript tem valores primitivos:

```js
const idade = 17; // number
const nome = "Marta"; // string
const ativo = true; // boolean
const vazio = null; // ausência intencional
let porDefinir; // undefined
const id = Symbol("id"); // symbol
const enorme = 9007199254740993n; // bigint
```

Para observar tipos:

```js
console.log(typeof idade); // "number"
console.log(typeof nome); // "string"
console.log(typeof ativo); // "boolean"
console.log(typeof porDefinir); // "undefined"
```

### 2.2 A exceção histórica de `null`

```js
typeof null; // "object"
```

Isto é um detalhe antigo da linguagem. Na prática, trata `null` como “não há valor aqui de propósito”.

### 2.3 Números e `NaN`

JavaScript usa `number` para inteiros e decimais.

```js
0.1 + 0.2; // 0.30000000000000004
```

Para validar conversões numéricas:

```js
const valor = Number("abc");

if (Number.isNaN(valor)) {
    console.log("Número inválido");
}
```

### 2.4 Checkpoint

- Qual é a diferença entre `null` e `undefined`?
- Porque é que `Number.isNaN(...)` é útil depois de converter texto?
- O que devolve `typeof "12"`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Conversões, `truthy/falsy` e igualdade segura

### 3.1 Converter de forma explícita

Entradas vindas de `prompt`, formulários e URLs chegam quase sempre como texto.

```js
const entrada = "18";
const idade = Number(entrada);
```

Prefere converter tu próprio em vez de deixar o JavaScript fazer coerção implícita.

```js
"2" + 3; // "23"
"2" * 3; // 6
Number("2") + 3; // 5
```

### 3.2 `truthy` e `falsy`

Valores `falsy`:

```txt
false, 0, -0, 0n, "", null, undefined, NaN
```

Tudo o resto é `truthy`, incluindo `"0"`, `"false"`, `[]` e `{}`.

```js
if ("0") {
    console.log("Entra, porque a string não está vazia");
}
```

### 3.3 `===` e `!==`

Usa comparação estrita:

```js
2 === "2"; // false
2 == "2"; // true, mas evita
```

`==` tenta converter os valores antes de comparar. Isso pode esconder bugs.

### 3.4 `??` vs `||`

```js
const pagina = 0;

const a = pagina || 1; // 1, porque 0 é falsy
const b = pagina ?? 1; // 0, porque só troca null/undefined
```

Usa `??` quando `0`, `""` ou `false` forem valores válidos.

### 3.5 Erros comuns

- Fazer contas com texto sem converter.
- Usar `||` para valores por defeito e perder `0`.
- Comparar com `==` e não perceber que houve coerção.

### 3.6 Checkpoint

- Porque é que `"2" + 3` devolve `"23"`?
- Em que situação `??` é melhor do que `||`?
- Quais são os valores `falsy` que deves decorar?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Escopo, TDZ e referências

### 4.1 Escopo de bloco

`let` e `const` vivem dentro do bloco onde foram declaradas.

```js
let mensagem = "fora";

{
    let mensagem = "dentro";
    console.log(mensagem); // "dentro"
}

console.log(mensagem); // "fora"
```

Isto chama-se **shadowing**: um nome interno tapa temporariamente um nome externo.

### 4.2 Temporal Dead Zone

Entre o início do bloco e a linha da declaração, a variável existe mas não pode ser usada.

```js
{
    // console.log(total); // ReferenceError
    const total = 10;
}
```

Isto ajuda a apanhar erros cedo.

### 4.3 Comparar objetos e arrays

Objetos e arrays são comparados por referência.

```js
const a = [1, 2];
const b = [1, 2];
const c = a;

console.log(a === b); // false
console.log(a === c); // true
```

`a` e `b` têm o mesmo conteúdo, mas são arrays diferentes.

### 4.4 Checkpoint

- O que é shadowing?
- Porque é que `[] === []` é `false`?
- O que significa comparar por referência?

<a id="sec-5"></a>

## 5. [EXTRA] Diagnóstico rápido

| Sintoma | Causa provável | Verificação |
| ------- | -------------- | ----------- |
| `ReferenceError` | Variável fora de escopo ou usada antes da declaração | Confirma onde foi declarada |
| Resultado `"105"` | Número tratado como string | Usa `Number(...)` |
| Valor por defeito troca `0` por `1` | Uso de `||` | Usa `??` |
| Dois arrays iguais dão `false` | Comparação por referência | Compara conteúdo, não referência |
| `NaN` aparece nas contas | Conversão inválida | Usa `Number.isNaN(...)` |

<a id="exercicios"></a>

## Exercícios - Variáveis e tipos

1. Cria `const escola = "EPMS"` e `let ano = 12`. Mostra uma frase no `console` e altera apenas `ano`.
2. Lê uma idade com `prompt`, converte com `Number` e mostra se é maior ou menor de idade. Trata entradas inválidas.
3. Cria uma tabela com `console.table` que compare `typeof` para `42`, `"42"`, `true`, `null`, `undefined`, `{}` e `[]`.
4. Testa `""`, `"0"`, `0`, `null`, `undefined`, `[]` e `{}` dentro de `Boolean(...)`.
5. Compara `==` e `===` para `"5"`/`5`, `false`/`0`, `null`/`undefined`. Escreve comentários com a conclusão.
6. Cria `converteParaNumero(texto)` que devolve um número válido ou `null`.
7. Demonstra a diferença entre alterar uma propriedade de um objeto guardado em `const` e tentar reatribuir esse objeto.
8. Cria dois arrays com o mesmo conteúdo e confirma que `===` devolve `false`. Depois cria uma segunda variável que aponta para o primeiro array e confirma que devolve `true`.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçados os modelos mentais de coerção, `truthy/falsy`, escopo e referência.

![Footer](../Images/Footer.png)
