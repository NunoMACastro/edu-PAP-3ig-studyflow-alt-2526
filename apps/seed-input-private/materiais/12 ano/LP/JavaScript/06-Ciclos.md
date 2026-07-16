![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 06 · Ciclos

> **Objetivo deste ficheiro**
>
> - Repetir ações com `for`, `while`, `do...while`, `for...of` e `for...in`.
> - Escolher o ciclo adequado ao problema.
> - Evitar ciclos infinitos e erros de índice.
> - Usar `break` e `continue` com intenção.
> - Preparar a transição para arrays e métodos como `map` e `filter`.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Repetição com `for`](#sec-1)
- [2. [ESSENCIAL] `while` e `do...while`](#sec-2)
- [3. [ESSENCIAL] Percorrer valores com `for...of`](#sec-3)
- [4. [ESSENCIAL+] `break`, `continue` e padrões comuns](#sec-4)
- [5. [EXTRA] `for...in` e diagnóstico rápido](#sec-5)
- [Exercícios - Ciclos](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Ciclos servem para repetir ações sem copiar o mesmo código várias vezes. São essenciais para listas, strings, validações repetidas e simulações.

- **Núcleo do tema:** `for`, `while`, `do...while` e `for...of`.
- **Aprofundamento:** interrupção, salto de iteração e padrões de acumulação.
- **Ligação ao percurso:** ciclos formam a base de `map`, `filter`, `reduce`, DOM e processamento de dados.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Repetição com `for`

### 1.1 Modelo mental

Um `for` clássico tem três partes:

```js
for (let i = 0; i < 3; i++) {
    console.log(i);
}
```

```txt
início -> condição -> bloco -> atualização -> condição -> ...
```

Resultado:

```txt
0
1
2
```

### 1.2 Percorrer por índice

```js
const notas = [12, 16, 9];

for (let i = 0; i < notas.length; i++) {
    console.log(`Índice ${i}: ${notas[i]}`);
}
```

Usa índices quando precisas da posição.

### 1.3 Erros comuns

- Usar `i <= array.length` e aceder a uma posição que não existe.
- Esquecer `i++` e criar um ciclo infinito.
- Alterar o tamanho do array enquanto o percorres sem necessidade.

### 1.4 Checkpoint

- Porque é que a condição costuma ser `i < array.length`?
- Quais são as três partes de um `for` clássico?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `while` e `do...while`

### 2.1 `while`

`while` repete enquanto a condição for verdadeira.

```js
let tentativas = 0;

while (tentativas < 3) {
    console.log(`Tentativa ${tentativas + 1}`);
    tentativas++;
}
```

### 2.2 `do...while`

`do...while` executa pelo menos uma vez.

```js
let numero;

do {
    numero = Number(prompt("Número positivo:"));
} while (Number.isNaN(numero) || numero <= 0);
```

### 2.3 Quando usar

- `while`: quando não sabes à partida quantas repetições vais ter.
- `do...while`: quando queres garantir uma primeira execução.
- `for`: quando tens contador ou tamanho conhecido.

### 2.4 Checkpoint

- Qual é a diferença entre `while` e `do...while`?
- Que variável precisa de mudar para o ciclo terminar?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Percorrer valores com `for...of`

### 3.1 Arrays e strings

```js
const nomes = ["Ana", "Bruno", "Carla"];

for (const nome of nomes) {
    console.log(nome);
}

for (const letra of "Olá") {
    console.log(letra);
}
```

`for...of` lê valores diretamente. É excelente quando não precisas do índice.

### 3.2 Índice e valor

```js
const notas = [12, 16, 9];

for (const [indice, nota] of notas.entries()) {
    console.log(indice, nota);
}
```

### 3.3 Checkpoint

- Quando é que `for...of` é melhor do que `for` clássico?
- Como obténs índice e valor ao mesmo tempo?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] `break`, `continue` e padrões comuns

### 4.1 `break`

Sai imediatamente do ciclo.

```js
let encontrado = null;

for (const numero of [5, 7, 8, 11]) {
    if (numero % 2 === 0) {
        encontrado = numero;
        break;
    }
}
```

### 4.2 `continue`

Salta para a próxima iteração.

```js
for (const numero of [1, 2, 3, 4]) {
    if (numero % 2 !== 0) continue;
    console.log(numero); // só pares
}
```

### 4.3 Acumular valores

```js
const notas = [10, 14, 18];
let soma = 0;

for (const nota of notas) {
    soma += nota;
}

const media = soma / notas.length;
```

### 4.4 Construir novo array

```js
const numeros = [1, 2, 3, 4];
const dobradosPares = [];

for (const numero of numeros) {
    if (numero % 2 === 0) {
        dobradosPares.push(numero * 2);
    }
}
```

Isto prepara a ideia de `filter` + `map`.

### 4.5 Checkpoint

- Qual é a diferença entre `break` e `continue`?
- Que variável funciona como acumulador no exemplo da média?

<a id="sec-5"></a>

## 5. [EXTRA] `for...in` e diagnóstico rápido

### 5.1 `for...in` é para chaves

```js
const pessoa = { nome: "Ana", idade: 17 };

for (const chave in pessoa) {
    if (Object.prototype.hasOwnProperty.call(pessoa, chave)) {
        console.log(chave, pessoa[chave]);
    }
}
```

Para objetos simples, muitas vezes é mais claro:

```js
for (const [chave, valor] of Object.entries(pessoa)) {
    console.log(chave, valor);
}
```

### 5.2 Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Ciclo nunca acaba | Condição nunca passa a falsa | Atualizar variável de controlo |
| Último valor é `undefined` | Índice passou do fim | Usar `< length` |
| Saltou valores sem querer | `continue` mal colocado | Rever condição |
| Não encontrou valor | `break` cedo demais | Confirmar ordem da lógica |
| Percorre chaves em vez de valores | Uso de `for...in` em array | Usar `for...of` |

<a id="exercicios"></a>

## Exercícios - Ciclos

1. Escreve um `for` que mostre os números de 10 até 0.
2. Mostra apenas os múltiplos de 3 entre 1 e 30.
3. Pede números até receber `0`; mostra o quadrado de cada número antes de terminar.
4. Usa `do...while` para pedir uma nota válida entre 0 e 20.
5. Percorre um array de notas com `for...of` e calcula a média.
6. Encontra o primeiro número maior que 100 num array e termina o ciclo com `break`.
7. Cria um novo array com os números pares dobrados usando apenas ciclos.
8. Percorre um objeto com `Object.entries` e mostra as chaves e valores.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçados padrões de acumulação, pesquisa e construção de arrays.

![Footer](../Images/Footer.png)
