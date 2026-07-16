![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 08 · Objetos e `this`

> **Objetivo deste ficheiro**
>
> - Representar dados com objetos.
> - Ler, alterar, remover e percorrer propriedades.
> - Perceber o modelo mental de `this` em métodos.
> - Copiar objetos sem alterar acidentalmente o original.
> - Usar JSON para guardar ou transportar dados simples.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Objetos como pares chave/valor](#sec-1)
- [2. [ESSENCIAL] Ler, alterar e percorrer propriedades](#sec-2)
- [3. [ESSENCIAL] `this` em métodos](#sec-3)
- [4. [ESSENCIAL+] Copiar, atualizar e serializar](#sec-4)
- [5. [EXTRA] Diagnóstico rápido](#sec-5)
- [Exercícios - Objetos e this](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Objetos permitem juntar dados relacionados numa única estrutura. São a base de configurações, registos, respostas JSON, estado em React e documentos em MongoDB.

- **Núcleo do tema:** criar, ler, escrever e percorrer objetos.
- **Aprofundamento:** `this`, cópias superficiais e JSON.
- **Ligação ao percurso:** objetos aparecem em módulos, classes, APIs, DOM, Node e bases de dados.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Objetos como pares chave/valor

### 1.1 Modelo mental

Um objeto é uma coleção de pares:

```js
const pessoa = {
    nome: "Ana",
    idade: 17,
    ativo: true,
};
```

```txt
chave -> valor
nome  -> "Ana"
idade -> 17
ativo -> true
```

### 1.2 Chaves e valores

As chaves são strings ou `Symbol`. Os valores podem ser de qualquer tipo.

```js
const produto = {
    nome: "Caderno",
    preco: 2.5,
    tags: ["papelaria", "escola"],
    stock: {
        loja: 12,
        armazem: 40,
    },
};
```

### 1.3 Chaves calculadas

```js
const campo = "nota";
const registo = {
    nome: "Marta",
    [campo]: 18,
};
```

### 1.4 Checkpoint

- O que é uma chave?
- Que tipos de valores podem existir dentro de um objeto?
- Para que servem chaves calculadas?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Ler, alterar e percorrer propriedades

### 2.1 Notação com ponto e colchetes

```js
const pessoa = { nome: "Ana", idade: 17 };

console.log(pessoa.nome);
console.log(pessoa["idade"]);
```

Usa colchetes quando a chave vem de uma variável.

```js
const campo = "nome";
console.log(pessoa[campo]);
```

### 2.2 Alterar e remover

```js
pessoa.idade = 18;
pessoa.email = "ana@example.com";
delete pessoa.email;
```

### 2.3 Percorrer

```js
for (const [chave, valor] of Object.entries(pessoa)) {
    console.log(chave, valor);
}
```

Também existem:

```js
Object.keys(pessoa);
Object.values(pessoa);
Object.entries(pessoa);
```

### 2.4 Erros comuns

- Ler uma chave que não existe e receber `undefined`.
- Usar ponto quando a chave está numa variável.
- Alterar objetos partilhados sem criar cópia.

### 2.5 Checkpoint

- Quando usas `obj[chave]` em vez de `obj.chave`?
- O que devolve uma propriedade inexistente?

<a id="sec-3"></a>

## 3. [ESSENCIAL] `this` em métodos

### 3.1 Modelo mental

`this` é o objeto que está a executar o método.

```js
const conta = {
    saldo: 100,
    depositar(valor) {
        this.saldo += valor;
    },
};

conta.depositar(50);
console.log(conta.saldo); // 150
```

Na chamada `conta.depositar(50)`, o `this` dentro de `depositar` é `conta`.

### 3.2 Arrow functions e `this`

Arrow functions não têm `this` próprio.

```js
const contador = {
    valor: 0,
    incrementar() {
        this.valor++;
    },
};
```

Para métodos que usam `this`, prefere a sintaxe normal de método.

### 3.3 Perder o `this`

```js
const incrementar = contador.incrementar;
// incrementar(); // this perdeu o objeto original
```

Isto aparece muito em callbacks e classes. Mais tarde, em React, evita-se depender de `this` usando funções e hooks.

### 3.4 Checkpoint

- O que representa `this` em `conta.depositar()`?
- Porque é que arrow functions não são ideais para métodos com `this`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Copiar, atualizar e serializar

### 4.1 Cópia superficial

```js
const original = { nome: "Ana", ativo: true };
const copia = { ...original };

copia.nome = "Rita";

console.log(original.nome); // "Ana"
```

### 4.2 Objetos aninhados

```js
const perfil = {
    nome: "Ana",
    morada: { cidade: "Viseu" },
};

const atualizado = {
    ...perfil,
    morada: {
        ...perfil.morada,
        cidade: "Porto",
    },
};
```

A cópia com `...` é superficial. Se houver objetos dentro, copia também esses níveis.

### 4.3 Defaults e overrides

```js
const defaults = { tema: "claro", notificacoes: true };
const preferencias = { notificacoes: false };

const final = { ...defaults, ...preferencias };
```

O que vem depois sobrepõe o que veio antes.

### 4.4 JSON

```js
const texto = JSON.stringify({ nome: "Ana", nota: 18 });
const dados = JSON.parse(texto);
```

JSON é texto. Não guarda métodos, comentários nem `undefined`.

### 4.5 Checkpoint

- O que significa cópia superficial?
- Porque é que a ordem no spread importa?
- O que se perde ao converter um objeto para JSON?

<a id="sec-5"></a>

## 5. [EXTRA] Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Valor vem `undefined` | Chave inexistente | Confirmar nome da chave |
| Método não altera objeto certo | `this` perdido | Chamar pelo objeto ou usar `bind` |
| Original mudou sem querer | Cópia superficial incompleta | Copiar níveis internos |
| `JSON.parse` falha | Texto não é JSON válido | Usar `try/catch` |
| Métodos desaparecem no JSON | JSON só guarda dados | Converter para objeto simples |

<a id="exercicios"></a>

## Exercícios - Objetos e this

1. Cria um objeto `pessoa` com `nome`, `idade` e `email`; altera a idade e remove o email.
2. Cria `obterCampo(obj, campo)` que lê uma propriedade usando colchetes.
3. Percorre um objeto com `Object.entries` e mostra uma tabela com chave e valor.
4. Cria um objeto `conta` com `saldo`, `depositar` e `levantar`, usando `this`.
5. Demonstra a diferença entre copiar um objeto simples e um objeto com outro objeto dentro.
6. Cria `mergeConfig(defaults, overrides)` usando spread.
7. Converte um objeto para JSON e volta a objeto com `JSON.parse`.
8. Cria `atualizarMorada(perfil, cidade)` que devolve novo objeto sem alterar o original.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçado o modelo mental de `this`, cópia superficial e JSON.

![Footer](../Images/Footer.png)
