![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 15 · DOM básico

> **Objetivo deste ficheiro**
>
> - Perceber o DOM como a árvore da página.
> - Selecionar, ler, alterar, criar e remover elementos.
> - Reagir a eventos com `addEventListener`.
> - Ler formulários com `FormData`.
> - Evitar riscos comuns como `innerHTML` com dados do utilizador.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que é o DOM](#sec-1)
- [2. [ESSENCIAL] Selecionar e alterar elementos](#sec-2)
- [3. [ESSENCIAL] Criar elementos e trabalhar com classes](#sec-3)
- [4. [ESSENCIAL] Eventos e formulários](#sec-4)
- [5. [ESSENCIAL+] Delegação, segurança e acessibilidade](#sec-5)
- [6. [EXTRA] Diagnóstico rápido](#sec-6)
- [Exercícios - DOM básico](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

O DOM é a ponte entre HTML e JavaScript no browser. Com ele, o programa deixa de estar limitado à consola e passa a alterar a página em resposta a ações.

- **Núcleo do tema:** selecionar, alterar, criar, remover e reagir a eventos.
- **Aprofundamento:** delegação de eventos, segurança e acessibilidade.
- **Ligação ao percurso:** DOM prepara a transição para React, onde a UI passa a ser descrita de forma declarativa.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é o DOM

### 1.1 Modelo mental

Quando o browser carrega HTML, cria uma árvore de objetos.

```html
<main>
    <h1>Catálogo</h1>
    <ul id="lista">
        <li>Caderno</li>
        <li>Lápis</li>
    </ul>
</main>
```

```txt
document
  main
    h1
    ul#lista
      li
      li
```

JavaScript consegue ler e alterar essa árvore.

### 1.2 Onde carregar o script

```html
<script type="module" src="./main.js" defer></script>
```

`defer` garante que o HTML é analisado antes de o script correr.

### 1.3 Checkpoint

- O que é o DOM?
- Porque é que o script deve correr depois de o HTML existir?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Selecionar e alterar elementos

### 2.1 Seletores principais

```js
const titulo = document.querySelector("h1");
const lista = document.querySelector("#lista");
const itens = document.querySelectorAll("#lista li");
```

`querySelector` devolve o primeiro elemento que encontra. `querySelectorAll` devolve vários.

### 2.2 Texto seguro

```js
titulo.textContent = "Produtos disponíveis";
```

Usa `textContent` para texto vindo de formulários, APIs ou utilizadores.

### 2.3 Atributos e `dataset`

```html
<button data-id="42">Remover</button>
```

```js
const botao = document.querySelector("button");

console.log(botao.dataset.id); // "42"
botao.setAttribute("aria-label", "Remover produto");
```

### 2.4 Erros comuns

- Seletor errado devolve `null`.
- Script corre antes do elemento existir.
- Usar `innerHTML` com texto vindo de fora.

### 2.5 Checkpoint

- Qual é a diferença entre `querySelector` e `querySelectorAll`?
- Porque é que `textContent` é mais seguro do que `innerHTML`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Criar elementos e trabalhar com classes

### 3.1 Criar e inserir

```js
const item = document.createElement("li");
item.textContent = "Borracha";

lista.append(item);
```

### 3.2 Inserir vários elementos

```js
const produtos = ["Caderno", "Lápis", "Borracha"];
const fragmento = document.createDocumentFragment();

for (const produto of produtos) {
    const li = document.createElement("li");
    li.textContent = produto;
    fragmento.append(li);
}

lista.append(fragmento);
```

`DocumentFragment` permite montar vários elementos antes de mexer na página.

### 3.3 Classes

```js
lista.classList.add("ativa");
lista.classList.remove("oculta");
lista.classList.toggle("compacta");
```

Prefere classes CSS em vez de mexer em muitos estilos diretamente no JavaScript.

### 3.4 Checkpoint

- Para que serve `createElement`?
- Porque é que `DocumentFragment` é útil?
- Quando usas `classList.toggle`?

<a id="sec-4"></a>

## 4. [ESSENCIAL] Eventos e formulários

### 4.1 `addEventListener`

```html
<button id="adicionar">Adicionar</button>
<p id="estado"></p>
```

```js
const adicionar = document.querySelector("#adicionar");
const estado = document.querySelector("#estado");

adicionar.addEventListener("click", () => {
    estado.textContent = "Clique recebido";
});
```

### 4.2 Evento `input`

```html
<input id="pesquisa" />
<p id="resultado"></p>
```

```js
const pesquisa = document.querySelector("#pesquisa");
const resultado = document.querySelector("#resultado");

pesquisa.addEventListener("input", () => {
    resultado.textContent = `Pesquisa: ${pesquisa.value}`;
});
```

### 4.3 Formulários

```html
<form id="form-produto">
    <label>
        Nome
        <input name="nome" required />
    </label>
    <label>
        Preço
        <input name="preco" type="number" step="0.01" required />
    </label>
    <button>Guardar</button>
</form>
```

```js
const form = document.querySelector("#form-produto");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const dados = Object.fromEntries(new FormData(form).entries());
    const preco = Number(dados.preco);

    if (dados.nome.trim() === "" || Number.isNaN(preco)) {
        console.warn("Dados inválidos");
        return;
    }

    console.log({ nome: dados.nome.trim(), preco });
});
```

### 4.4 Checkpoint

- Para que serve `preventDefault` num formulário?
- Porque é necessário converter `dados.preco`?

<a id="sec-5"></a>

## 5. [ESSENCIAL+] Delegação, segurança e acessibilidade

### 5.1 Delegação de eventos

Em listas dinâmicas, podes colocar um listener no elemento pai.

```html
<ul id="produtos">
    <li data-id="1">Caderno <button data-acao="remover">Remover</button></li>
    <li data-id="2">Lápis <button data-acao="remover">Remover</button></li>
</ul>
```

```js
const produtos = document.querySelector("#produtos");

produtos.addEventListener("click", (event) => {
    const botao = event.target.closest("button[data-acao='remover']");
    if (!botao) return;

    const item = botao.closest("li");
    item.remove();
});
```

### 5.2 Segurança: evitar XSS

```js
const texto = '<img src=x onerror="alert(1)" />';

const p = document.createElement("p");
p.textContent = texto;
document.body.append(p);
```

Com `textContent`, o texto aparece como texto. Não é interpretado como HTML.

### 5.3 Acessibilidade mínima

- Usa `<button>` para ações.
- Associa `<label>` a inputs.
- Mantém foco visível.
- Botões só com ícone precisam de `aria-label`.

```html
<button aria-label="Remover produto">×</button>
```

### 5.4 Checkpoint

- Porque é que delegação ajuda em listas dinâmicas?
- O que é XSS?
- Que cuidado precisas de ter com botões sem texto visível?

<a id="sec-6"></a>

## 6. [EXTRA] Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| `Cannot read properties of null` | Seletor não encontrou elemento | Confirmar HTML e timing |
| Página recarrega no submit | Falta `preventDefault` | Chamar no início do handler |
| Texto executa HTML | Uso inseguro de `innerHTML` | Usar `textContent` |
| Listener não funciona em itens novos | Listener estava nos filhos antigos | Usar delegação |
| Valor de input vem string | FormData devolve texto | Converter e validar |

<a id="exercicios"></a>

## Exercícios - DOM básico

1. Seleciona um `<h1>` e altera o texto com `textContent`.
2. Cria uma lista a partir de um array usando `createElement`.
3. Adiciona e remove uma classe ao clicar num botão.
4. Cria um formulário de produto, lê com `FormData` e valida preço.
5. Implementa uma lista de tarefas com botão para remover cada tarefa.
6. Reescreve a remoção das tarefas usando delegação de eventos.
7. Mostra texto vindo de um input usando `textContent` e justifica porque é seguro.
8. Adiciona `aria-label` a um botão sem texto visível.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçados eventos, formulários, delegação, XSS e acessibilidade básica.

![Footer](../Images/Footer.png)
