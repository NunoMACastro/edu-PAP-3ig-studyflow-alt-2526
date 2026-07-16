![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 09 · Exceções

> **Objetivo deste ficheiro**
>
> - Perceber o que acontece quando o JavaScript encontra um erro.
> - Usar `try`, `catch`, `finally` e `throw`.
> - Lançar erros com objetos `Error` adequados.
> - Tratar erros síncronos e assíncronos.
> - Criar funções que falham de forma previsível.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que é uma exceção](#sec-1)
- [2. [ESSENCIAL] `try/catch/finally`](#sec-2)
- [3. [ESSENCIAL] Lançar erros com `throw`](#sec-3)
- [4. [ESSENCIAL+] Erros assíncronos](#sec-4)
- [5. [EXTRA] Erros personalizados e diagnóstico](#sec-5)
- [Exercícios - Exceções](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Erros não são apenas “coisas más”. São sinais de que o programa encontrou uma situação que não consegue continuar a tratar da forma normal.

- **Núcleo do tema:** apanhar, lançar e limpar depois de erros.
- **Aprofundamento:** erros assíncronos e classes de erro.
- **Ligação ao percurso:** exceções aparecem em validação, `fetch`, Node, Express, MongoDB e testes.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é uma exceção

### 1.1 Modelo mental

Quando uma função encontra um problema grave, pode **lançar** uma exceção. O fluxo normal pára e o JavaScript procura um `catch`.

```txt
função lança erro
   ↓
o fluxo normal pára
   ↓
um catch trata o erro
```

### 1.2 Exemplo simples

```js
function dividir(a, b) {
    if (b === 0) {
        throw new RangeError("Divisão por zero");
    }

    return a / b;
}
```

Quem chama a função deve decidir como tratar a falha.

### 1.3 Erros comuns

- Ignorar entradas inválidas e deixar o programa falhar mais tarde.
- Lançar strings em vez de `Error`.
- Apanhar todos os erros e esconder o problema.

### 1.4 Checkpoint

- O que acontece ao fluxo normal quando há `throw`?
- Porque é que `throw new Error(...)` é melhor do que `throw "erro"`?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `try/catch/finally`

### 2.1 Estrutura base

```js
try {
    // código que pode falhar
} catch (erro) {
    // tratamento do erro
} finally {
    // corre sempre
}
```

### 2.2 Exemplo completo

```js
function lerJSON(texto) {
    try {
        return JSON.parse(texto);
    } catch (erro) {
        console.warn("JSON inválido:", erro.message);
        return null;
    } finally {
        console.log("Tentativa de leitura concluída");
    }
}

console.log(lerJSON('{"ok": true}'));
console.log(lerJSON("{ inválido }"));
```

### 2.3 `finally`

`finally` é útil para limpar recursos:

```js
let aberto = false;

try {
    aberto = true;
    throw new Error("Falhou");
} catch (erro) {
    console.error(erro.message);
} finally {
    aberto = false;
}
```

### 2.4 Checkpoint

- Quando corre o `finally`?
- O que deve acontecer dentro de um `catch`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Lançar erros com `throw`

### 3.1 Validar e falhar cedo

```js
function calcularMedia(notas) {
    if (!Array.isArray(notas)) {
        throw new TypeError("Notas deve ser um array");
    }

    if (notas.length === 0) {
        throw new RangeError("Notas não pode estar vazio");
    }

    const soma = notas.reduce((total, nota) => total + nota, 0);
    return soma / notas.length;
}
```

### 3.2 Tipos de erro úteis

- `Error`: erro genérico.
- `TypeError`: tipo errado.
- `RangeError`: valor fora de intervalo.
- `SyntaxError`: sintaxe inválida, como JSON mal formado.

### 3.3 Voltar a lançar

Se o erro não é esperado, podes voltar a lançá-lo.

```js
try {
    calcularMedia("12,14");
} catch (erro) {
    if (erro instanceof TypeError) {
        console.warn("Entrada com tipo errado");
    } else {
        throw erro;
    }
}
```

### 3.4 Checkpoint

- Que erro faz sentido para tipo errado?
- Que erro faz sentido para valor fora de intervalo?
- Quando deves voltar a lançar um erro?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Erros assíncronos

### 4.1 Com Promises

```js
fetch("/api/dados")
    .then((resposta) => {
        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        return resposta.json();
    })
    .then((dados) => console.log(dados))
    .catch((erro) => console.error("Falhou:", erro.message));
```

### 4.2 Com `async/await`

```js
async function getJSON(url) {
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
    }

    return resposta.json();
}

try {
    const dados = await getJSON("/api/dados");
    console.log(dados);
} catch (erro) {
    console.error("Não foi possível carregar:", erro.message);
}
```

### 4.3 `try/catch` e `setTimeout`

Este `try/catch` não apanha o erro dentro do `setTimeout`:

```js
try {
    setTimeout(() => {
        throw new Error("Falha atrasada");
    }, 100);
} catch (erro) {
    console.log("Não chega aqui");
}
```

O erro tem de ser tratado dentro da callback ou modelado como Promise.

### 4.4 Checkpoint

- Porque é que `await` permite usar `try/catch`?
- Porque é que erros dentro de `setTimeout` precisam de cuidado especial?

<a id="sec-5"></a>

## 5. [EXTRA] Erros personalizados e diagnóstico

### 5.1 Classe de erro

```js
class NotaInvalidaError extends Error {
    constructor(nota) {
        super(`Nota inválida: ${nota}`);
        this.name = "NotaInvalidaError";
    }
}

function validarNota(nota) {
    if (typeof nota !== "number" || nota < 0 || nota > 20) {
        throw new NotaInvalidaError(nota);
    }

    return nota;
}
```

### 5.2 Resultado seguro

```js
function executarComSeguranca(fn) {
    try {
        return { ok: true, valor: fn() };
    } catch (erro) {
        return { ok: false, erro };
    }
}
```

### 5.3 Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Programa pára | Erro sem `catch` | Envolver chamada arriscada |
| `catch` não apanha timeout | Erro noutro ciclo do Event Loop | Tratar dentro da callback |
| Stack trace pouco útil | Foi lançada string | Lançar `Error` |
| Erro esperado vira 500 numa API | Falta mapeamento de erro | Usar códigos/nomes claros |

<a id="exercicios"></a>

## Exercícios - Exceções

1. Cria `dividir(a, b)` que lança `TypeError` se os argumentos não forem números e `RangeError` se `b` for `0`.
2. Cria `lerJSONSeguro(texto, fallback)` que devolve `fallback` se o JSON for inválido.
3. Cria `validarNota(nota)` que lança `RangeError` para valores fora de 0-20.
4. Cria uma classe `NotaInvalidaError` e usa-a numa função de validação.
5. Cria `executarComSeguranca(fn)` que devolve `{ ok, valor }` ou `{ ok, erro }`.
6. Simula uma Promise que rejeita e trata-a com `.catch`.
7. Reescreve o exercício anterior com `async/await` e `try/catch`.
8. Usa `Promise.allSettled` com três Promises e mostra quais falharam.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçado o tratamento de erros síncronos, assíncronos e personalizados.

![Footer](../Images/Footer.png)
