![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 07 · Arrays

> **Objetivo deste ficheiro**
>
> - Representar listas ordenadas com arrays.
> - Ler, acrescentar, remover, procurar e copiar elementos.
> - Distinguir métodos mutáveis de métodos que devolvem cópias.
> - Evitar erros de índice, referência e mutação inesperada.
> - Preparar a passagem para `map`, `filter`, `reduce` e outros métodos de alto nível.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que é um array](#sec-1)
- [2. [ESSENCIAL] Ler, alterar e percorrer](#sec-2)
- [3. [ESSENCIAL] Métodos mutáveis e cópias](#sec-3)
- [4. [ESSENCIAL+] Pesquisa e transformação inicial](#sec-4)
- [5. [EXTRA] Diagnóstico rápido](#sec-5)
- [Exercícios - Arrays](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Arrays são a estrutura base para listas: notas, produtos, tarefas, mensagens, resultados de APIs e elementos do DOM. Saber usá-los bem é essencial antes de entrar em métodos de alto nível e React.

- **Núcleo do tema:** índices, `length`, percorrer, adicionar, remover e copiar.
- **Aprofundamento:** mutação, imutabilidade e pesquisa.
- **Ligação ao percurso:** arrays aparecem em funções, DOM, `fetch`, React e MongoDB.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é um array

### 1.1 Modelo mental

Um array é uma lista ordenada. Cada posição tem um índice, começando em `0`.

```js
const notas = [12, 16, 9];

console.log(notas[0]); // 12
console.log(notas[1]); // 16
console.log(notas.length); // 3
```

```txt
índice:  0   1   2
valor:  12  16   9
```

### 1.2 Criar arrays

```js
const vazio = [];
const nomes = ["Ana", "Bruno", "Carla"];
const misto = [1, "dois", true];
const sequencia = Array.from({ length: 5 }, (_, i) => i + 1);
```

Prefere `[]` para arrays escritos diretamente.

### 1.3 Arrays são referências

```js
const a = [1, 2];
const b = a;

b.push(3);

console.log(a); // [1, 2, 3]
```

`a` e `b` apontam para o mesmo array.

### 1.4 Checkpoint

- Qual é o índice do primeiro elemento?
- O que significa `length`?
- Porque é que alterar `b` também alterou `a`?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Ler, alterar e percorrer

### 2.1 Ler e alterar por índice

```js
const tarefas = ["Estudar", "Praticar", "Rever"];

tarefas[1] = "Resolver exercícios";
console.log(tarefas);
```

Se leres fora do array:

```js
tarefas[99]; // undefined
```

### 2.2 Percorrer com `for...of`

```js
for (const tarefa of tarefas) {
    console.log(tarefa);
}
```

### 2.3 Índice e valor

```js
for (const [indice, tarefa] of tarefas.entries()) {
    console.log(`${indice}: ${tarefa}`);
}
```

### 2.4 Checkpoint

- Como percorres valores sem precisar de índice?
- Como obténs índice e valor ao mesmo tempo?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Métodos mutáveis e cópias

### 3.1 Métodos que alteram o original

```js
const nomes = ["Ana", "Bruno"];

nomes.push("Carla"); // acrescenta no fim
nomes.pop(); // remove do fim
nomes.unshift("Rita"); // acrescenta no início
nomes.shift(); // remove do início
```

`splice`, `sort` e `reverse` também alteram o array original.

```js
const numeros = [3, 1, 2];
numeros.sort((a, b) => a - b);
```

### 3.2 Criar cópias

```js
const base = [3, 1, 2];
const copia = [...base];
const ordenado = [...base].sort((a, b) => a - b);

console.log(base); // [3, 1, 2]
console.log(ordenado); // [1, 2, 3]
```

### 3.3 Métodos modernos que devolvem cópias

Em ambientes recentes:

```js
const ordenado = base.toSorted((a, b) => a - b);
const invertido = base.toReversed();
```

Se o ambiente não suportar estes métodos, usa `[...]` ou `slice()` antes do método mutável.

### 3.4 Erros comuns

- Usar `sort` sem função de comparação para números.
- Pensar que `const arr = []` impede alterações internas.
- Copiar com `const b = a` quando querias uma cópia independente.

### 3.5 Checkpoint

- Que métodos alteram o array original?
- Como crias uma cópia antes de ordenar?
- Porque é que `sort()` sozinho ordena números de forma estranha?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Pesquisa e transformação inicial

### 4.1 Procurar valores simples

```js
const nomes = ["Ana", "Bruno", "Carla"];

nomes.includes("Ana"); // true
nomes.indexOf("Carla"); // 2
```

### 4.2 Procurar objetos

```js
const produtos = [
    { id: 1, nome: "Caderno", preco: 2.5 },
    { id: 2, nome: "Lápis", preco: 0.8 },
];

const produto = produtos.find((item) => item.id === 2);
```

### 4.3 Preparação para `map` e `filter`

```js
const numeros = [1, 2, 3, 4];
const paresDobrados = [];

for (const numero of numeros) {
    if (numero % 2 === 0) {
        paresDobrados.push(numero * 2);
    }
}
```

No capítulo 11, esta lógica passa a:

```js
const paresDobrados = numeros.filter((n) => n % 2 === 0).map((n) => n * 2);
```

### 4.4 Checkpoint

- Quando usas `find` em vez de `includes`?
- Porque é que `filter` + `map` substitui alguns ciclos manuais?

<a id="sec-5"></a>

## 5. [EXTRA] Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Valor é `undefined` | Índice não existe | Confirmar `length` |
| Array original mudou | Método mutável | Criar cópia |
| Números mal ordenados | `sort()` sem comparação | Usar `(a, b) => a - b` |
| `[] === []` dá `false` | Referências diferentes | Comparar conteúdo |
| Pesquisa em objetos falha | `includes` compara referência | Usar `find` |

<a id="exercicios"></a>

## Exercícios - Arrays

1. Cria um array de tarefas e mostra cada tarefa com índice.
2. Cria `adicionarTarefa(lista, tarefa)` que devolve um novo array sem alterar o original.
3. Ordena `[5, 12, 1, 30]` corretamente sem alterar o array base.
4. Usa `find` para procurar um produto por `id`.
5. Verifica se todos os números de um array são positivos.
6. Cria um novo array apenas com números pares dobrados usando ciclos.
7. Demonstra a diferença entre `const copia = original` e `const copia = [...original]`.
8. Remove uma tarefa por índice criando uma nova lista.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçada a diferença entre mutação, cópia e referência.

![Footer](../Images/Footer.png)
