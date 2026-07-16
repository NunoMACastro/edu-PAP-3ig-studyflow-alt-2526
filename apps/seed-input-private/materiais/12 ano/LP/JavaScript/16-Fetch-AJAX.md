![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 16 · Fetch/AJAX

> **Objetivo deste ficheiro**
>
> - Fazer pedidos HTTP com `fetch`.
> - Ler e enviar JSON.
> - Tratar erros de rede e erros HTTP.
> - Construir query strings com `URL` e `URLSearchParams`.
> - Usar timeout, cancelamento e `FormData` quando fizer sentido.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] HTTP, APIs e JSON](#sec-1)
- [2. [ESSENCIAL] `fetch` para ler dados](#sec-2)
- [3. [ESSENCIAL] Enviar dados e query strings](#sec-3)
- [4. [ESSENCIAL+] Timeout, cancelamento e estados de UI](#sec-4)
- [5. [EXTRA] CORS, autenticação e diagnóstico](#sec-5)
- [Exercícios - Fetch/AJAX](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

`fetch` permite que uma página comunique com ficheiros, APIs e servidores. É a base para carregar dados, enviar formulários, pesquisar, paginar e integrar frontend com backend.

- **Núcleo do tema:** GET, POST, JSON, status codes e erros.
- **Aprofundamento:** query strings, timeout, cancelamento, CORS e autenticação.
- **Ligação ao percurso:** `fetch` aparece em React, Node/Express, contratos de API e projetos fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] HTTP, APIs e JSON

### 1.1 Modelo mental

Um pedido HTTP é uma conversa:

```txt
cliente -> pedido -> servidor
cliente <- resposta <- servidor
```

Uma API define endereços e regras para essa conversa.

### 1.2 Métodos comuns

- `GET`: ler dados.
- `POST`: criar/enviar dados.
- `PUT`/`PATCH`: atualizar.
- `DELETE`: remover.

### 1.3 JSON

JSON é texto estruturado.

```json
{
    "nome": "Caderno",
    "preco": 2.5
}
```

Em JavaScript:

```js
const texto = JSON.stringify({ nome: "Caderno", preco: 2.5 });
const dados = JSON.parse(texto);
```

### 1.4 Checkpoint

- Que método HTTP usas para ler dados?
- O que é JSON?
- Porque é que uma API precisa de regras claras?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `fetch` para ler dados

### 2.1 GET simples

```js
async function getJSON(url) {
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
    }

    return resposta.json();
}
```

Uso:

```js
try {
    const produtos = await getJSON("/api/produtos");
    console.table(produtos);
} catch (erro) {
    console.error("Falhou:", erro.message);
}
```

### 2.2 Erro de rede vs erro HTTP

- Erro de rede: `fetch` rejeita a Promise.
- Erro HTTP (`404`, `500`, etc.): `fetch` resolve, mas `resposta.ok` vem `false`.

Por isso verificamos sempre `resposta.ok`.

### 2.3 Renderizar resultado no DOM

```js
function renderProdutos(produtos, lista) {
    lista.textContent = "";

    const fragmento = document.createDocumentFragment();

    for (const produto of produtos) {
        const li = document.createElement("li");
        li.textContent = `${produto.nome} - ${produto.preco} €`;
        fragmento.append(li);
    }

    lista.append(fragmento);
}
```

Repara no uso de `textContent`: dados vindos da API não devem ser inseridos com `innerHTML`.

### 2.4 Erros comuns

- Assumir que `fetch` lança erro para `404` ou `500`.
- Tentar ler JSON duas vezes da mesma resposta.
- Inserir dados externos com `innerHTML`.
- Esquecer de tratar estado vazio quando a API devolve `[]`.

### 2.5 Checkpoint

- Porque é que `fetch` não lança erro automaticamente para `404`?
- Para que serve `resposta.ok`?
- Porque é que `textContent` é importante ao mostrar dados externos?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Enviar dados e query strings

### 3.1 POST JSON

```js
async function enviarJSON(url, metodo, dados) {
    const resposta = await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
    }

    return resposta.json();
}

await enviarJSON("/api/produtos", "POST", {
    nome: "Caderno",
    preco: 2.5,
});
```

### 3.2 Query strings

Evita concatenar URLs à mão.

```js
function urlComParams(base, params) {
    const url = new URL(base, location.origin);

    for (const [chave, valor] of Object.entries(params)) {
        if (valor !== undefined && valor !== null && valor !== "") {
            url.searchParams.set(chave, valor);
        }
    }

    return url.toString();
}

const url = urlComParams("/api/produtos", { q: "caderno", page: 2 });
```

### 3.3 `FormData`

Para ficheiros ou formulários multipart:

```js
async function enviarFormulario(url, form) {
    const dados = new FormData(form);
    const resposta = await fetch(url, {
        method: "POST",
        body: dados,
    });

    if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
    }

    return resposta.json();
}
```

Não definas manualmente `Content-Type` quando usas `FormData`; o browser trata disso.

### 3.4 Checkpoint

- Que header usas ao enviar JSON?
- Porque é que `URLSearchParams` evita erros?
- Porque não deves definir `Content-Type` manualmente com `FormData`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Timeout, cancelamento e estados de UI

### 4.1 Timeout com `AbortController`

```js
async function getComTimeout(url, ms = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    try {
        return await getJSON(url, { signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
}
```

Para isto funcionar, `getJSON` deve aceitar opções:

```js
async function getJSON(url, options = {}) {
    const resposta = await fetch(url, options);

    if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
    }

    return resposta.json();
}
```

### 4.2 Estados de UI

```js
async function carregarProdutos() {
    estado.textContent = "A carregar...";

    try {
        const produtos = await getJSON("/api/produtos");
        renderProdutos(produtos, lista);
        estado.textContent = "Concluído";
    } catch (erro) {
        estado.textContent = "Não foi possível carregar";
        console.error(erro);
    }
}
```

Estados típicos:

- `idle`
- `loading`
- `success`
- `error`
- `empty`

### 4.3 Checkpoint

- Para que serve `AbortController`?
- Que estados de UI deves prever quando carregas dados?

<a id="sec-5"></a>

## 5. [EXTRA] CORS, autenticação e diagnóstico

### 5.1 CORS

CORS é uma regra de segurança do browser. Se uma página numa origem tenta chamar outra origem, o servidor precisa de autorizar.

```txt
http://localhost:5173 -> http://localhost:3000
```

Mesmo sendo ambos `localhost`, portas diferentes contam como origens diferentes.

### 5.2 Autenticação

Algumas APIs exigem credenciais.

```js
async function getPrivado(url, token) {
    const resposta = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
    }

    return resposta.json();
}
```

Não coloques chaves secretas no frontend. Código no browser é público.

### 5.3 Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| `404` | URL errada ou recurso inexistente | Confirmar endpoint |
| `500` | Erro no servidor | Ver logs do backend |
| `Failed to fetch` | Rede, CORS ou servidor desligado | Ver DevTools/Network |
| `Unexpected token <` | Recebeste HTML em vez de JSON | Confirmar URL |
| Pedido nunca termina | Servidor lento | Usar timeout |

<a id="exercicios"></a>

## Exercícios - Fetch/AJAX

1. Cria `getJSON(url)` e testa com um ficheiro `produtos.json`.
2. Mostra os produtos numa `<ul>` usando `textContent`.
3. Simula erro trocando o URL e mostra uma mensagem amigável.
4. Cria `urlComParams("/api/produtos", { q, page })`.
5. Cria um formulário e envia JSON com `POST` para uma API de testes.
6. Cria `getComTimeout(url, ms)` com `AbortController`.
7. Mostra estados `loading`, `success`, `error` e `empty` no DOM.
8. Analisa um erro CORS nas DevTools e identifica onde aparece.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçados erros HTTP, CORS, segurança no frontend, timeout e estados de UI.

![Footer](../Images/Footer.png)
