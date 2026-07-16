![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 17 · Outros tópicos úteis no browser

> **Objetivo deste ficheiro**
>
> - Usar APIs modernas do browser em cenários frequentes.
> - Trabalhar com `URL`, `URLSearchParams`, History API e IntersectionObserver.
> - Formatar dados com `Intl` para Português de Portugal.
> - Aplicar cuidados básicos de acessibilidade, segurança e performance.
> - Fechar o percurso de JavaScript preparando projetos maiores.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] URLs e query strings](#sec-1)
- [2. [ESSENCIAL] History API](#sec-2)
- [3. [ESSENCIAL] IntersectionObserver](#sec-3)
- [4. [ESSENCIAL+] `Intl` e formatação local](#sec-4)
- [5. [EXTRA] Acessibilidade, segurança e performance](#sec-5)
- [Exercícios - Tópicos úteis no browser](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo junta ferramentas do browser que aparecem quando uma página deixa de ser estática: URLs com filtros, navegação sem recarregar, carregamento preguiçoso, formatação local, acessibilidade, segurança e performance.

- **Núcleo do tema:** APIs do browser para navegação, visibilidade e URLs.
- **Aprofundamento:** internacionalização, medição, debounce e boas práticas de UI.
- **Ligação ao percurso:** estes tópicos aparecem naturalmente em React Router, filtros, paginação, dashboards e projetos fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] URLs e query strings

### 1.1 Modelo mental

Uma URL pode transportar estado simples da página.

```txt
/produtos?q=caderno&page=2
```

Aqui:

- `q` representa pesquisa;
- `page` representa paginação.

### 1.2 Ler parâmetros

```js
const params = new URLSearchParams(location.search);

const pesquisa = params.get("q") ?? "";
const pagina = Number(params.get("page") ?? 1);
```

Valida sempre valores convertidos.

```js
const paginaSegura = Number.isNaN(pagina) || pagina < 1 ? 1 : pagina;
```

### 1.3 Construir URLs

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

const url = urlComParams("/produtos", { q: "caderno A5", page: 2 });
```

### 1.4 Checkpoint

- Para que serve uma query string?
- Porque é que `URLSearchParams` é melhor do que concatenar strings?
- Porque deves validar `page` depois de converter?

<a id="sec-2"></a>

## 2. [ESSENCIAL] History API

### 2.1 Modelo mental

History API permite alterar a URL sem recarregar a página.

```js
history.pushState({ view: "sobre" }, "", "/sobre");
```

Isto é uma das bases de SPAs simples.

### 2.2 Exemplo mínimo

```html
<nav>
    <a href="/home" data-view="home">Home</a>
    <a href="/sobre" data-view="sobre">Sobre</a>
</nav>
<main id="app"></main>
```

```js
const app = document.querySelector("#app");

function render(view) {
    app.textContent = view === "sobre" ? "Página Sobre" : "Página Home";
}

document.querySelector("nav").addEventListener("click", (event) => {
    const link = event.target.closest("a[data-view]");
    if (!link) return;

    event.preventDefault();

    const view = link.dataset.view;
    history.pushState({ view }, "", link.href);
    render(view);
});

window.addEventListener("popstate", (event) => {
    render(event.state?.view ?? "home");
});

render("home");
```

### 2.3 Checkpoint

- O que faz `pushState`?
- Para que serve o evento `popstate`?
- Porque é que `preventDefault` aparece no clique dos links?

<a id="sec-3"></a>

## 3. [ESSENCIAL] IntersectionObserver

### 3.1 Modelo mental

IntersectionObserver observa quando um elemento entra ou sai da zona visível.

Usos comuns:

- lazy loading de imagens;
- carregar mais itens ao chegar ao fim;
- ativar animações quando uma secção aparece.

### 3.2 Lazy loading simples

```html
<img data-src="foto-grande.jpg" alt="Paisagem" class="lazy" width="600" />
```

```js
const observer = new IntersectionObserver(
    (entries, obs) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            const img = entry.target;
            img.src = img.dataset.src;
            obs.unobserve(img);
        }
    },
    {
        rootMargin: "0px 0px 200px 0px",
        threshold: 0.01,
    }
);

document.querySelectorAll("img.lazy").forEach((img) => observer.observe(img));
```

### 3.3 Checkpoint

- Para que serve `rootMargin`?
- Porque é útil chamar `unobserve` depois de carregar a imagem?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] `Intl` e formatação local

### 4.1 Moeda

```js
const eur = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
});

console.log(eur.format(1234.5));
```

### 4.2 Datas

```js
const data = new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
});

console.log(data.format(new Date()));
```

### 4.3 Ordenação

```js
const collator = new Intl.Collator("pt-PT");
const nomes = ["maçã", "manga", "abacate"];

nomes.sort(collator.compare);
```

### 4.4 Datas relativas

```js
const relativo = new Intl.RelativeTimeFormat("pt-PT", {
    numeric: "auto",
});

console.log(relativo.format(-5, "minute"));
```

### 4.5 Checkpoint

- Porque é que `Intl` é melhor do que criar formatações à mão?
- Que locale usas para Português de Portugal?
- Como ordenas texto respeitando acentos?

<a id="sec-5"></a>

## 5. [EXTRA] Acessibilidade, segurança e performance

### 5.1 Acessibilidade básica

- Usa HTML semântico: `<button>`, `<nav>`, `<main>`, `<header>`.
- Associa labels a inputs.
- Mantém foco visível.
- Usa `aria-label` quando um botão não tem texto.

```html
<button aria-label="Abrir menu">
    ☰
</button>
```

### 5.2 Segurança no frontend

```js
const comentario = document.createElement("p");
comentario.textContent = textoVindoDeFora;
container.append(comentario);
```

Regra prática:

- dados externos -> `textContent`;
- HTML dinâmico -> só se for confiável e controlado.

Nunca coloques segredos no frontend. Tudo o que vai para o browser pode ser visto.

### 5.3 Performance: debounce

```js
function debounce(fn, delay = 300) {
    let timeoutId;

    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

const pesquisar = debounce((event) => {
    console.log("Pesquisar:", event.target.value);
}, 300);

document.querySelector("#q").addEventListener("input", pesquisar);
```

### 5.4 Performance: medir

```js
console.time("render");
// código a medir
console.timeEnd("render");
```

Mede antes de tentar otimizar.

### 5.5 Erros comuns

- Guardar filtros só em variáveis e perder o estado ao recarregar.
- Alterar a URL com History API e esquecer de renderizar a vista correspondente.
- Usar formatação manual para datas e moedas.
- Disparar lógica pesada em todos os eventos de `input` ou `scroll`.
- Remover foco visível e tornar a navegação por teclado difícil.

### 5.6 Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Filtros perdem-se ao recarregar | Estado só em memória | Guardar em query string |
| Voltar/avançar não atualiza UI | Falta `popstate` | Ouvir evento |
| Imagens carregam todas de uma vez | Sem lazy loading | Usar IntersectionObserver |
| Datas em formato estranho | Formatação manual | Usar `Intl` |
| Input dispara lógica demais | Evento muito frequente | Usar debounce |

<a id="exercicios"></a>

## Exercícios - Tópicos úteis no browser

1. Lê `q` e `page` da query string e preenche um formulário.
2. Cria `urlComParams` e usa-a para atualizar uma URL de pesquisa.
3. Cria uma navegação simples com History API entre duas vistas.
4. Garante que o botão voltar do browser atualiza a vista com `popstate`.
5. Usa IntersectionObserver para carregar imagens com `data-src`.
6. Formata preços em EUR e datas em `pt-PT` com `Intl`.
7. Cria um input de pesquisa com `debounce`.
8. Revê uma pequena página e identifica uma melhoria de acessibilidade, uma de segurança e uma de performance.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçadas APIs modernas do browser, acessibilidade, segurança e performance.

![Footer](../Images/Footer.png)
