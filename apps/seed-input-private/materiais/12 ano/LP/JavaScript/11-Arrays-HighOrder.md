![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 11 · Métodos de alto nível em arrays

> **Objetivo deste ficheiro**
>
> - Usar `map`, `filter`, `reduce`, `find`, `some` e `every`.
> - Escrever código mais declarativo para transformar listas.
> - Perceber quando usar `forEach` e quando evitar.
> - Encadear operações sem perder legibilidade.
> - Evitar mutações acidentais dentro de callbacks.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que são métodos de alto nível](#sec-1)
- [2. [ESSENCIAL] `map`, `filter` e `reduce`](#sec-2)
- [3. [ESSENCIAL] Procurar e verificar](#sec-3)
- [4. [ESSENCIAL+] Encadear com clareza](#sec-4)
- [5. [EXTRA] Diagnóstico rápido](#sec-5)
- [Exercícios - Métodos de alto nível em arrays](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Depois de aprender ciclos, este capítulo mostra uma forma mais declarativa de trabalhar com listas. Em vez de escreveres todos os passos do ciclo, descreves a transformação que queres.

- **Núcleo do tema:** transformar, filtrar, acumular, procurar e verificar.
- **Aprofundamento:** encadeamento, callbacks e legibilidade.
- **Ligação ao percurso:** estes métodos aparecem muito em DOM, React, respostas de APIs e processamento de dados.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que são métodos de alto nível

### 1.1 Modelo mental

Métodos como `map` e `filter` recebem uma função callback.

```js
array.metodo((valor, indice, arrayCompleto) => {
    // regra aplicada a cada elemento
});
```

Tu descreves a regra; o método trata da repetição.

### 1.2 Ciclo manual vs método

```js
const numeros = [1, 2, 3];
const dobrados = [];

for (const numero of numeros) {
    dobrados.push(numero * 2);
}
```

Com `map`:

```js
const dobrados = numeros.map((numero) => numero * 2);
```

### 1.3 Checkpoint

- O que significa passar uma callback a um método?
- Que parte do trabalho fica escondida dentro de `map`?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `map`, `filter` e `reduce`

### 2.1 `map`: transformar

Mantém o mesmo número de elementos.

```js
const notas = [10, 12, 18];
const percentagens = notas.map((nota) => nota * 5);
```

Útil para extrair campos:

```js
const produtos = [
    { nome: "Caderno", preco: 2.5 },
    { nome: "Lápis", preco: 0.8 },
];

const nomes = produtos.map((produto) => produto.nome);
```

### 2.2 `filter`: selecionar

```js
const aprovados = notas.filter((nota) => nota >= 10);
```

Mantém apenas os elementos cuja callback devolve `true`.

### 2.3 `reduce`: acumular

```js
const soma = notas.reduce((total, nota) => total + nota, 0);
const media = notas.length === 0 ? 0 : soma / notas.length;
```

Passa sempre valor inicial. Evita bugs com arrays vazios.

### 2.4 Erros comuns

- Usar `map` quando não queres guardar o resultado.
- Usar `filter` e esquecer que a callback tem de devolver booleano.
- Usar `reduce` sem valor inicial.

### 2.5 Checkpoint

- Que método mantém o mesmo tamanho da lista?
- Que método pode reduzir a lista?
- Porque é importante o valor inicial em `reduce`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Procurar e verificar

### 3.1 `find` e `findIndex`

```js
const produtos = [
    { id: 1, nome: "Caderno" },
    { id: 2, nome: "Lápis" },
];

const produto = produtos.find((item) => item.id === 2);
const indice = produtos.findIndex((item) => item.id === 2);
```

`find` devolve o elemento ou `undefined`. `findIndex` devolve o índice ou `-1`.

### 3.2 `some` e `every`

```js
const temNegativos = [3, -1, 5].some((n) => n < 0);
const todosValidos = [12, 16, 18].every((nota) => nota >= 0 && nota <= 20);
```

### 3.3 `forEach`

`forEach` é para efeitos colaterais.

```js
produtos.forEach((produto) => console.log(produto.nome));
```

Não uses `forEach` quando precisas de criar novo array; usa `map` ou `filter`.

### 3.4 Checkpoint

- Quando usas `some` em vez de `find`?
- Porque é que `forEach` não é ideal para transformar dados?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Encadear com clareza

### 4.1 Pipeline simples

```js
const produtos = [
    { nome: "Caderno", preco: 2.5, ativo: true },
    { nome: "Caneta", preco: 1.2, ativo: false },
    { nome: "Lápis", preco: 0.8, ativo: true },
];

const nomesAtivos = produtos
    .filter((produto) => produto.ativo)
    .map((produto) => produto.nome)
    .sort((a, b) => a.localeCompare(b, "pt-PT"));
```

### 4.2 Variáveis intermédias

Se a cadeia ficar difícil, separa.

```js
const ativos = produtos.filter((produto) => produto.ativo);
const nomes = ativos.map((produto) => produto.nome);
```

Legibilidade vem antes de mostrar tudo numa linha.

### 4.3 Evitar mutação nas callbacks

```js
const atualizados = produtos.map((produto) => ({
    ...produto,
    preco: produto.preco * 1.23,
}));
```

Evita alterar o próprio objeto dentro do `map`, a menos que seja mesmo essa a intenção.

### 4.4 Checkpoint

- Quando deves partir uma cadeia em variáveis?
- Como atualizas objetos num `map` sem mutar o original?

<a id="sec-5"></a>

## 5. [EXTRA] Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Array cheio de `undefined` | `map` sem `return` | Devolver valor |
| `reduce` falha em array vazio | Sem valor inicial | Passar `0`, `{}` ou `[]` |
| Resultado original mudou | Mutação dentro da callback | Criar cópias |
| `find` não encontra objeto | Comparação errada | Comparar uma chave |
| Código encadeado ilegível | Pipeline grande demais | Criar variáveis intermédias |

<a id="exercicios"></a>

## Exercícios - Métodos de alto nível em arrays

1. Usa `map` para dobrar `[1, 2, 3, 4]`.
2. Usa `filter` para obter notas maiores ou iguais a 10.
3. Usa `reduce` para calcular a soma e a média de uma lista de notas.
4. Usa `find` para procurar um produto por `id`.
5. Usa `some` para verificar se existe algum preço acima de 100.
6. Usa `every` para validar se todas as notas estão entre 0 e 20.
7. Cria um pipeline que filtre produtos ativos, extraia nomes e ordene alfabeticamente.
8. Reescreve um ciclo manual do capítulo anterior usando `filter` + `map`.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçada a escolha entre `map`, `filter`, `reduce`, `find`, `some`, `every` e `forEach`.

![Footer](../Images/Footer.png)
