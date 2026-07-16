![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 14 · Assíncrono e Event Loop

> **Objetivo deste ficheiro**
>
> - Distinguir código síncrono de código assíncrono.
> - Perceber o papel do browser ou Node.js em tarefas demoradas.
> - Entender Call Stack, tarefas, microtarefas e Event Loop.
> - Usar Promises e `async/await` com tratamento de erros.
> - Evitar bloqueios, esperas desnecessárias e bugs de ordem de execução.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Síncrono vs assíncrono](#sec-1)
- [2. [ESSENCIAL] Event Loop, tarefas e microtarefas](#sec-2)
- [3. [ESSENCIAL] Promises](#sec-3)
- [4. [ESSENCIAL] `async/await`](#sec-4)
- [5. [ESSENCIAL+] Paralelo, timeout e cancelamento](#sec-5)
- [6. [EXTRA] Diagnóstico rápido](#sec-6)
- [Exercícios - Assíncrono e Event Loop](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

JavaScript corre numa única thread principal para o código da aplicação, mas consegue lidar com tempo, rede, eventos e ficheiros sem bloquear tudo. Isso acontece porque o ambiente, como o browser ou Node.js, ajuda a gerir tarefas demoradas.

- **Núcleo do tema:** síncrono, assíncrono, Promises e `async/await`.
- **Aprofundamento:** microtarefas, tarefas, paralelismo lógico e cancelamento.
- **Ligação ao percurso:** este capítulo prepara `fetch`, DOM, React `useEffect`, Node e APIs.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Síncrono vs assíncrono

### 1.1 Modelo mental

Código síncrono corre linha a linha.

```js
console.log("A");
console.log("B");
console.log("C");
```

Código assíncrono inicia uma tarefa que termina mais tarde.

```js
console.log("A");
setTimeout(() => console.log("B"), 1000);
console.log("C");
```

Resultado:

```txt
A
C
B
```

### 1.2 Porque isto existe

Se o JavaScript ficasse parado à espera de rede, tempo ou interação, a página congelava.

```js
const inicio = Date.now();

while (Date.now() - inicio < 2000) {
    // bloqueia a thread principal durante 2 segundos
}
```

Este exemplo mostra o problema: enquanto o ciclo corre, a interface não consegue responder.

### 1.3 Onde aparece

- `setTimeout`, `setInterval`
- `fetch`
- eventos de clique e input
- leitura de ficheiros em Node.js
- timers e operações de rede

### 1.4 Checkpoint

- O que significa “bloquear” a aplicação?
- Porque é que `setTimeout` não bloqueia a execução seguinte?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Event Loop, tarefas e microtarefas

### 2.1 Peças principais

- **Call Stack:** o que o JavaScript está a executar agora.
- **APIs do ambiente:** browser ou Node tratam timers, rede e eventos.
- **Fila de tarefas:** `setTimeout`, eventos, etc.
- **Fila de microtarefas:** callbacks de Promises, `queueMicrotask`.
- **Event Loop:** coordena quando o trabalho volta ao JavaScript.

### 2.2 Ordem importante

Quando a Call Stack fica vazia:

1. correm as microtarefas;
2. depois corre uma tarefa;
3. o ciclo repete.

### 2.3 Experiência rápida

```js
console.log("A");

setTimeout(() => console.log("B - timeout"), 0);

Promise.resolve().then(() => console.log("C - promise"));

console.log("D");
```

Ordem típica:

```txt
A
D
C - promise
B - timeout
```

### 2.4 Erros comuns

- Pensar que `setTimeout(..., 0)` corre imediatamente.
- Esperar que Promises e timeouts entrem na mesma fila.
- Ignorar que código síncrono pesado bloqueia tudo antes das filas serem processadas.

### 2.5 Checkpoint

- Porque é que a Promise aparece antes do timeout?
- O que precisa de acontecer à Call Stack antes de o Event Loop ir buscar trabalho?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Promises

### 3.1 Modelo mental

Uma Promise representa um resultado futuro:

- `pending`: ainda não terminou;
- `fulfilled`: terminou com sucesso;
- `rejected`: terminou com erro.

### 3.2 Criar uma Promise simples

```js
function esperar(ms, valor) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(valor), ms);
    });
}
```

### 3.3 Consumir com `.then/.catch`

```js
esperar(500, "Pronto")
    .then((valor) => valor.toUpperCase())
    .then((valor) => console.log(valor))
    .catch((erro) => console.error(erro.message))
    .finally(() => console.log("Terminou"));
```

Cada `.then` devolve uma nova Promise.

### 3.4 Checkpoint

- Quais são os três estados de uma Promise?
- Para que serve `.catch`?
- O que faz `.finally`?

<a id="sec-4"></a>

## 4. [ESSENCIAL] `async/await`

### 4.1 Ler Promises como passos

```js
async function exemplo() {
    const valor = await esperar(500, 10);
    return valor * 2;
}
```

Uma função `async` devolve sempre uma Promise.

### 4.2 Tratamento de erros

```js
async function carregar() {
    try {
        const dados = await esperar(500, { ok: true });
        return dados;
    } catch (erro) {
        console.error("Falhou:", erro.message);
        return null;
    }
}
```

### 4.3 Sequencial vs paralelo

Sequencial:

```js
const a = await esperar(300, 10);
const b = await esperar(300, 20);
```

Paralelo:

```js
const promessaA = esperar(300, 10);
const promessaB = esperar(300, 20);

const [a, b] = await Promise.all([promessaA, promessaB]);
```

Quando as tarefas são independentes, `Promise.all` evita tempo perdido.

### 4.4 Checkpoint

- O que devolve uma função `async`?
- Quando deves usar `Promise.all`?
- Porque é que `try/catch` combina bem com `await`?

<a id="sec-5"></a>

## 5. [ESSENCIAL+] Paralelo, timeout e cancelamento

### 5.1 `Promise.allSettled`

Quando queres saber o resultado de todas, mesmo que algumas falhem:

```js
const resultados = await Promise.allSettled([
    esperar(100, "A"),
    Promise.reject(new Error("Falhou")),
    esperar(200, "C"),
]);

console.table(resultados);
```

### 5.2 Timeout com `AbortController`

`AbortController` é especialmente útil com `fetch`, mas a ideia base é: criar um sinal que pode cancelar uma operação.

```js
async function getComTimeout(url, ms = 3000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    try {
        const resposta = await fetch(url, { signal: controller.signal });
        return resposta;
    } finally {
        clearTimeout(timeoutId);
    }
}
```

### 5.3 Checkpoint

- Quando usas `Promise.allSettled` em vez de `Promise.all`?
- Que objeto permite cancelar um `fetch`?

<a id="sec-6"></a>

## 6. [EXTRA] Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Logs aparecem fora de ordem | Tarefas assíncronas | Analisar Event Loop |
| App fica presa | Código síncrono pesado | Dividir trabalho ou evitar bloqueio |
| `await` não funciona | Fora de função `async` ou módulo | Marcar função ou usar módulo |
| Requisições independentes demoram muito | `await` sequencial | Usar `Promise.all` |
| Erro não é apanhado | Promise sem `await`/`catch` | Aguardar ou encadear tratamento |

<a id="exercicios"></a>

## Exercícios - Assíncrono e Event Loop

1. Preve a ordem dos logs com `console.log`, `setTimeout` e `Promise.resolve().then`.
2. Cria `esperar(ms, valor)` e consome com `.then`.
3. Reescreve o exercício anterior com `async/await`.
4. Cria duas Promises independentes e resolve-as com `Promise.all`.
5. Cria três Promises, uma delas rejeitada, e observa `Promise.allSettled`.
6. Cria uma função `carregarEstado()` que devolve `{ status: "success", data }` ou `{ status: "error", error }`.
7. Usa `setInterval` para atualizar um contador e `clearInterval` para parar.
8. Cria `getComTimeout(url, ms)` com `AbortController`.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçados Event Loop, Promises, `async/await`, paralelismo lógico e cancelamento.

![Footer](../Images/Footer.png)
