![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 10 · Funções

> **Objetivo deste ficheiro**
>
> - Criar funções com parâmetros e `return`.
> - Distinguir declarações, expressões e arrow functions.
> - Perceber escopo, hoisting e closures.
> - Escrever funções pequenas, testáveis e previsíveis.
> - Usar callbacks como preparação para arrays, eventos e Promises.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Funções como blocos reutilizáveis](#sec-1)
- [2. [ESSENCIAL] Formas de declarar funções](#sec-2)
- [3. [ESSENCIAL] Parâmetros, `return` e guard clauses](#sec-3)
- [4. [ESSENCIAL+] Escopo, closures e callbacks](#sec-4)
- [5. [EXTRA] Recursão e pureza](#sec-5)
- [Exercícios - Funções](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Funções permitem dar nome a uma ideia, reutilizar lógica e dividir problemas grandes em passos pequenos. São a base de métodos de array, eventos, módulos, componentes React e handlers Express.

- **Núcleo do tema:** declarar, chamar, receber parâmetros e devolver valores.
- **Aprofundamento:** escopo, closures, callbacks e funções puras.
- **Ligação ao percurso:** quase todos os capítulos seguintes dependem de funções bem escritas.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Funções como blocos reutilizáveis

### 1.1 Modelo mental

Uma função é uma pequena máquina:

```txt
entrada -> processamento -> saída
```

```js
function somar(a, b) {
    return a + b;
}

console.log(somar(2, 3)); // 5
```

### 1.2 `return`

`return` devolve um valor e termina a função.

```js
function dobro(n) {
    return n * 2;
    // código aqui já não corre
}
```

Se não houver `return`, a função devolve `undefined`.

### 1.3 Funções com responsabilidade clara

```js
function calcularMedia(notas) {
    const soma = notas.reduce((total, nota) => total + nota, 0);
    return soma / notas.length;
}
```

O nome deve dizer o que a função faz.

### 1.4 Checkpoint

- O que acontece quando uma função chega a `return`?
- Que valor devolve uma função sem `return`?
- Porque é importante dar bons nomes às funções?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Formas de declarar funções

### 2.1 Declaração

```js
saudar("Ana");

function saudar(nome) {
    return `Olá, ${nome}!`;
}
```

Declarações têm hoisting: podem ser chamadas antes da linha onde aparecem.

### 2.2 Expressão

```js
const triplo = function (n) {
    return n * 3;
};
```

A função só está disponível depois da atribuição.

### 2.3 Arrow function

```js
const quadrado = (n) => n ** 2;

const formatarNome = (nome) => {
    const limpo = nome.trim();
    return limpo.toUpperCase();
};
```

Arrow functions são ótimas para callbacks e funções curtas. Não têm `this` próprio.

### 2.4 Erros comuns

- Usar arrow function como método quando precisas de `this`.
- Chamar uma expressão de função antes de a criar.
- Misturar demasiados estilos no mesmo ficheiro sem motivo.

### 2.5 Checkpoint

- Que forma tem hoisting?
- Porque é que arrow functions aparecem tanto em callbacks?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Parâmetros, `return` e guard clauses

### 3.1 Valores por defeito

```js
function saudar(nome = "visitante") {
    return `Olá, ${nome}!`;
}
```

### 3.2 Rest parameters

```js
function somarTudo(...numeros) {
    return numeros.reduce((total, n) => total + n, 0);
}
```

### 3.3 Desestruturação

```js
function formatarProduto({ nome, preco }) {
    return `${nome}: ${preco.toFixed(2)} €`;
}
```

### 3.4 Guard clauses

```js
function dividir(a, b) {
    if (typeof a !== "number" || typeof b !== "number") return null;
    if (b === 0) return null;
    return a / b;
}
```

### 3.5 Checkpoint

- Para que serve `...numeros` num parâmetro?
- Quando é útil desestruturar um objeto no parâmetro?
- Porque é que guard clauses tornam funções mais simples?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Escopo, closures e callbacks

### 4.1 Escopo

Variáveis declaradas dentro de uma função vivem nessa função.

```js
function exemplo() {
    const interno = 10;
    return interno;
}

// console.log(interno); // ReferenceError
```

### 4.2 Closure

Uma função interna lembra-se das variáveis externas que usa.

```js
function criarContador(inicial = 0) {
    let atual = inicial;

    return function () {
        atual++;
        return atual;
    };
}

const proximo = criarContador(10);
console.log(proximo()); // 11
console.log(proximo()); // 12
```

### 4.3 Callback

Callback é uma função passada como argumento.

```js
function calcular(a, b, operacao) {
    return operacao(a, b);
}

const soma = (a, b) => a + b;
const produto = (a, b) => a * b;

console.log(calcular(4, 2, soma)); // 6
console.log(calcular(4, 2, produto)); // 8
```

Callbacks aparecem em eventos, arrays e Promises.

### 4.4 Checkpoint

- O que é uma closure?
- O que é uma callback?
- Onde já viste callbacks antes?

<a id="sec-5"></a>

## 5. [EXTRA] Recursão e pureza

### 5.1 Recursão

Uma função recursiva chama-se a si própria e precisa de caso base.

```js
function fatorial(n) {
    if (n < 0) return null;
    if (n === 0) return 1;
    return n * fatorial(n - 1);
}
```

### 5.2 Funções puras

Uma função pura depende só dos argumentos e não altera nada fora dela.

```js
const somar = (a, b) => a + b;
```

Função impura:

```js
let total = 0;

function adicionar(n) {
    total += n;
}
```

### 5.3 Testar funções puras

Uma função pura é uma boa candidata a teste porque podes verificar o resultado sem preparar browser, DOM, API ou base de dados.

Exemplo de função:

```js
export function calcularTotal(items) {
    return items.reduce((total, item) => total + item.preco * item.quantidade, 0);
}
```

Teste manual simples:

```js
const carrinho = [
    { preco: 10, quantidade: 2 },
    { preco: 5, quantidade: 1 },
];

console.log(calcularTotal(carrinho) === 25); // true
```

A ideia é a mesma quando usares uma ferramenta de testes mais tarde: defines entrada, chamas a função e comparas a saída esperada.

### 5.4 Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Função devolve `undefined` | Falta `return` | Confirmar caminhos de saída |
| Variável não existe | Escopo errado | Declarar no escopo certo |
| Recursão nunca termina | Falta caso base | Definir condição de paragem |
| Resultado muda sem razão | Função impura | Reduzir efeitos externos |

<a id="exercicios"></a>

## Exercícios - Funções

1. Cria `saudar(nome)` que devolve uma saudação.
2. Cria `media(...numeros)` usando rest parameters.
3. Cria `formatarProduto({ nome, preco })`.
4. Cria `dividir(a, b)` com guard clauses.
5. Cria `criarContador(inicial)` usando closure.
6. Cria `calcular(a, b, operacao)` e testa com soma, subtração, produto e divisão.
7. Cria `fatorial(n)` com recursão.
8. Reescreve uma função impura para devolver um novo valor sem alterar variável externa.
9. Cria `calcularTotal(items)` como função pura e escreve três testes manuais com `console.log(resultado === esperado)`.
10. Cria um caso de teste com carrinho vazio e decide qual deve ser o resultado.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçados modelos mentais de closure, callback e pureza.
    - Acrescentada ponte para testes simples de funções puras.

![Footer](../Images/Footer.png)
