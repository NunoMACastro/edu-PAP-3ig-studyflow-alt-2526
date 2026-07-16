![Header](../../Images/Header.png)

# Tutorial passo a passo - Migração da Pokédex Explorer (Tutorial 02 - Parte I) para Pokédex v2 com Router (Tutorial 02 - Parte 2) (12.º ano)

Este tutorial **continua diretamente a Ficha 3**.
A ideia é simples: **mantemos a mesma app**, o mesmo visual e os mesmos dados,
mas **substituímos a navegação por estado** por **rotas reais** com React Router.

---

## 0) O que vais construir (igual à Ficha 3, agora com Router)

### Ponto da situação (onde estamos)

- Na Ficha 3 a app já funciona: lista, pesquisa, filtro por tipo, favoritos e detalhe.
- Mas a navegação para as páginas de Pokémon individual, não é uma URL real: é um “modo” controlado por estado (`currentPage`, `selectedPokemon`).

### O que vamos fazer neste ponto (objetivo)

- Manter tudo o que já existe **igual**, mas trocar a navegação por estado por:
    - rotas reais (`/`, `/pokemon/:id`, `/favoritos`)
    - query string para filtros (`?q=...&type=...`)
    - fallback 404 (`*`)

### Como vamos fazer (passos)

1. Ligar o Router no `main.jsx` (Router mínimo).
2. Criar um Layout com `Outlet` + navegação (moldura fixa).
3. Extrair a lista para uma Page (rota `/`).
4. Migrar detalhes para rota dinâmica (`/pokemon/:id`).
5. Migrar filtros para a URL (query string).
6. Criar favoritos e 404.

### Conceitos novos

- **Rota:** “quando a URL é X, mostra o componente Y”. Uma rota é uma regra de mapeamento. É uma correspondência entre URL e componente.
- **Rota dinâmica:** uma parte da URL é variável (`/pokemon/:id`).
- **Query string:** pares `chave=valor` depois de `?` (ideal para filtros partilháveis).

### Conceitos adjacentes

- `useParams()` e `useSearchParams()` devolvem valores como **string** (ou `null`).
  O `useParams()` lê do caminho; o `useSearchParams()` lê da query string. É com estas funções que vamos obter os id's dos Pokemons e quais os filtros a aplicar.

### Propósito do componente/página

- Ainda não criamos nada aqui: estamos a alinhar o “mapa mental” do que vem a seguir.

### Checkpoint

- Consegues explicar, numa frase, a mudança principal?
    - “Antes eu mudava ecrãs por estado; agora mudo ecrãs pela URL.”

---

### O que vamos fazer...

Uma Pokédex digital com dados reais da **PokéAPI**, agora com rotas reais:

- Lista dos **151 Pokémon (Gen 1)**
- Pesquisa por nome (input controlado)
- Filtro por tipo (botões)
- Favoritos com persistência (`localStorage`)
- Página de detalhes **com rota dinâmica** `/pokemon/:id`
- Query string para partilhar filtros: `?q=...&type=...`
- Layout com menu e rota 404

### 0.1) Ligações diretas aos temas dos ficheiros de React (1 ao 10)

1. **Fundamentos e setup** - Vite, estrutura base, `index.html`, `main.jsx`.
2. **JSX e componentes** - UI dividida em componentes pequenos.
3. **Props e composição** - dados e handlers via props.
4. **Estado e eventos** - `useState`, cliques, inputs.
5. **Listas e condicionais** - `map`, `filter`, `&&`, ternários.
6. **Formulários controlados** - input com `value` e `onChange`.
7. **Assíncrono** - `fetch`, `async/await`, `Promise.all`.
8. **useEffect e dados externos** - carregar API e guardar/ler do `localStorage`.
9. **React Router fundamentos** - `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`.
10. **Navegação e rotas dinâmicas** - `useParams`, `useNavigate`, query string e 404.

### 0.2) Mapa de fases (visão rápida)

- Fase 1 - Router mínimo (BrowserRouter + App com Routes simples)
- Fase 2 - Layout com `Outlet` + `NavLink`
- Fase 2.5 - Router sem mexer na lógica (só no return)
- Fase 3 - Extrair lista para `PokemonListPage` (ainda sem query string)
- Fase 4 - Migrar detalhes para `/pokemon/:id`
- Fase 5 - Migrar filtros para query string (`q` e `type`)
- Fase 6 - FavoritesPage e rota 404 (`*`)

**Vocabulário rápido**

- **Página (Page)**: componente que representa um “ecrã” ligado a uma rota.
- **Componente (Component)**: peça reutilizável de UI.
- **Rota (Route)**: regra “URL → componente”.

**Debug rápido para toda a ficha**

1. `BrowserRouter` está no `main.jsx`?
2. `Outlet` existe no `Layout`?
3. Console do browser mostra erros?
4. URL muda quando clicas num `NavLink`?
5. Os `path` das rotas filhas são **relativos**?

**Pontos de paragem**

- **Paragem A**: Router mínimo ligado (Home/Sobre/Contactos funciona).
- **Paragem B**: Layout + Outlet funcionam com a lista na rota index.
- **Paragem C**: Detalhes por URL `/pokemon/:id` funcionam.
- **Paragem D**: Filtros na URL + favoritos + 404 prontos.

**Tabela rápida - Antes (State) vs Depois (URL)**

| Aspeto       | Tutorial 02 - Parte I (state)   | Tutorial 02 - Parte 2 (URL) |
| ------------ | ------------------------------- | --------------------------- |
| Detalhes     | `currentPage`/`selectedPokemon` | `/pokemon/:id`              |
| Filtros      | estado local                    | `?q=...&type=...`           |
| Back/Forward | manual                          | nativo do browser           |
| Refresh      | perde “página”                  | mantém rota                 |

---

## 1) Pré‑requisitos

### Ponto da situação (onde estamos)

- Vais pegar numa app já feita (Ficha 3) e migrar para Router.
- Se a Ficha 3 não estiver estável, vais misturar bugs antigos com bugs do Router. Por isso certifica-te que a ficha 3 está OK antes de começar.

### O que vamos fazer neste ponto (objetivo)

- Garantir que tens um “ponto de partida limpo” antes de começar a ficha 4.

### Como vamos fazer (passos)

- Confirmar que a Ficha 3 corre (`npm run dev`) e que lista/detalhe/favoritos funcionam.

---

## 2) Criar a v2 a partir da v1 (sem recomeçar do zero)

Vamos criar uma cópia do projeto da Ficha 3 para migrar para Router.

- Opção A (mais simples): duplicar a pasta.
- Opção B (mais profissional): criar uma branch no repositório de GIT.
- Depois: instalar `react-router-dom` no projeto novo.

```bash
npm install react-router-dom
```

### Observações

- Ao duplicares a pasta, pode ficar um `node_modules` antigo. Em caso de dúvidas:
    - apaga `node_modules` e corre `npm install` novamente.
- A instalação do Router não “ativa” nada por si - só instala a biblioteca.

### 2.1) Duplicar a pasta (opção simples)

```bash
cp -R pokedex-explorer pokedex-v2
cd pokedex-v2
```

**No Windows:** duplica a pasta no Explorador **ou** usa:

```bat
xcopy /E /I pokedex-explorer pokedex-v2
cd pokedex-v2
```

### 2.2) OU criar uma branch (se usares Git)

No terminal da pasta do projeto da Ficha 3:

```bash
git checkout -b ficha4-router
```

### 2.3) Instalar o React Router

Entra na pasta do projeto (se ainda não estiveres lá) e, se ainda não o fizeste, instala o React Router:

```bash
npm install react-router-dom
```

### 2.4) Alias `@` (mantém o da Ficha 3)

Na ficha 3 usaste o alias `@` para evitar `../../..` nos imports.
Basicamente é uma “atalho” para `src/`.

Para usar o alias `@`, precisas de duas coisas:

1. Configuração no `vite.config.js`
2. Configuração no editor (ex.: `jsconfig.json` para VS Code)

Isso já deve ter sido feito na Ficha 3.

Não mexas no `vite.config.js` - mantém exatamente o da Ficha 3.
Mantém também o `jsconfig.json` igual ao da Ficha 3 para o VS Code.

### Checkpoint

- `import App from "@/App.jsx"` funciona sem erros?

---

## 3) Reaproveitar o que já existe

### Ponto da situação (onde estamos)

- A app já tem componentes, serviços e estilos prontos.

### O que vamos fazer neste ponto (objetivo)

- Definir o que não mexemos nesta migração para a ficha 4.

### Como vamos fazer (passos)

1. Manter componentes e serviços existentes.
2. Só adicionar os novos ficheiros (Layout, Pages, NotFound).
3. Ajustar imports apenas quando necessário.

**Nota de organização:**

- Em contexto profissional, separar `pages/` de `components/` faz sentido.
- Aqui **não** fazemos já essa separação para não criar mais uma mudança estrutural.

Nesta migração, **não voltas a escrever tudo**. Vais **reaproveitar**:

- Manténs sem reescrever: `SearchBar`, `TypeFilter`, `PokemonCard`, `LoadingSpinner`, `ErrorMessage`
- Manténs sem reescrever: `services/pokeApi.js`
- Manténs sem reescrever: `typeData.js` (com **cores e gradientes** da Ficha 3)
- Manténs sem reescrever: `styles/index.css` e `styles/pokedex.css` **da Ficha 3**
- Vais **editar**: `PokemonDetailsPage` (para ler `useParams`) e `App.jsx` (para rotas)
- Vais **criar**: `Layout`, `PokemonListPage`, `FavoritesPage`, `NotFound`

**Nota de organização:**

nesta ficha **mantemos a estrutura da Ficha 3**.
As novas “páginas” do Router ficam em `components/` para não introduzir uma
mudança estrutural agora. Em contexto profissional, faz sentido separar
`pages/` e `data/`, mas isso fica para uma ficha futura.

---

## 4) Estrutura final (objetivo da ficha)

### O que vamos fazer aqui

- Definir desde já onde cada ficheiro vai viver, para não “andar perdido”.

### Como vamos fazer

- Manter `services/`, `styles/` e componentes reutilizados.
- Criar “páginas” como componentes (Layout, ListPage, DetailsPage, FavoritesPage, NotFound).

```
src/
  main.jsx
  App.jsx
  styles/
    index.css
    pokedex.css
  services/
    pokeApi.js
  components/
    ErrorMessage.jsx
    LoadingSpinner.jsx
    PokemonCard.jsx
    PokemonDetailsPage.jsx
    SearchBar.jsx
    TypeFilter.jsx
    typeData.js
    Layout.jsx
    PokemonListPage.jsx
    FavoritesPage.jsx
    NotFound.jsx
```

---

**Checklist de migração por ficheiro (antes → depois)**

- `App.jsx`: deixa de ter navegação por estado → passa a ter `Routes`/`Route`.
- `Layout.jsx`: adiciona `NavLink` + `Outlet`.
- `PokemonListPage.jsx`: continua a lista, passa a ser **page** da rota `/`.
- `PokemonDetailsPage.jsx`: lê `useParams()` para saber o `id`.
- `FavoritesPage.jsx`: filtra favoritos e fica na rota `/favoritos`.

## 5) Conceitos essenciais antes do Router (revisão rápida)

### Ponto da situação

- Vais começar a ver novas palavras: `Routes`, `Route`, `Outlet`, `NavLink`…

### O que vamos fazer

- Criar uma base mínima de conceitos para o resto da ficha não “cair do céu”.

### Como vamos fazer

- Ler com calma esta secção e voltar aqui sempre que algo não fizer sentido.

Antes de entrares nas fases, revê estes conceitos. Esta secção liga a Ficha 3
à Ficha 4 e evita que os temas “caiam do céu”.

### 5.1) O que são rotas

Rotas são **caminhos de URL** que mapeiam para componentes.
Numa SPA (Single Page App), mudar de rota **não recarrega a página**:
apenas muda o componente que aparece no ecrã.

**Porquê isto importa?**

Porque permite URLs partilháveis, refresh sem perder a página e navegação nativa (back/forward).

### 5.2) O que é o React Router

O React Router é a biblioteca que **interpreta a URL** e decide
**que componente renderizar**. Ele também trata da navegação sem reload
quando usas `Link`/`NavLink`.

### 5.3) BrowserRouter, Routes, Route (o “mapa”)

- `BrowserRouter` liga a app ao histórico do browser.
- `Routes` é o contentor onde declaras as rotas.
- `Route` diz: “quando a URL é X, mostra Y”.

Exemplo mental: `Route` é uma regra do mapa; `Routes` é o conjunto de regras.

### 5.4) Navegação sem reload (Link, NavLink, useNavigate)

Regra geral, em React não existe o reload da página. Para navegar sem recarregar, usamos:

- `Link` navega sem recarregar a página.
- `NavLink` faz o mesmo, mas adiciona estado “ativo” para estilos.
- `useNavigate` permite navegar **por código** (ex.: clique num card).

**Se estás perdido: mini‑teste opcional**

Se este mini‑teste funcionar, o Router está OK e o problema está na migração da app.

### 5.4.1) Teste do Router (3 ficheiros, sem Pokédex)

Se estiveres perdido, faz este mini-teste isolado antes de continuar. Se já tiveres percebido, podes saltar esta parte.

```jsx
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);
```

```jsx
// src/App.jsx
import { Routes, Route, NavLink } from "react-router-dom";

function Home() {
    return <h1>Home</h1>;
}

function Sobre() {
    return <h1>Sobre</h1>;
}

function Contactos() {
    return <h1>Contactos</h1>;
}

function App() {
    return (
        <div>
            <nav>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/sobre">Sobre</NavLink>
                <NavLink to="/contactos">Contactos</NavLink>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/contactos" element={<Contactos />} />
            </Routes>
        </div>
    );
}

export default App;
```

### 5.5) Outlet e rotas aninhadas

`Outlet` é o “buraco” onde aparece a rota filha.
Rotas aninhadas permitem ter **um Layout fixo** (menu/hero) e trocar apenas
o conteúdo.

Basicamente, o Layout define a estrutura geral fixa, e o `Outlet` é o sítio onde o conteúdo muda dependendo da rota que o user escolhe.

### 5.5.6) O que são hooks

Hooks são funções do React que “ligam” o componente a estado, efeitos
ou ao Router. Só podem ser chamados **dentro de componentes**
e **sempre na mesma ordem**.

Já vimos vários hooks:

- `useState()` cria estado local.
- `useEffect()` cria efeitos colaterais (fetch, timers…).
- `useNavigate()`, `useParams()`, `useSearchParams()`, `useLocation()` são hooks do Router.

### 5.5.7) Hooks do Router usados nesta ficha

- `useParams()` lê valores dinâmicos do caminho (`/pokemon/:id`).
- `useSearchParams()` lê/escreve a query string (`?q=...&type=...`).
- `useNavigate()` navega programaticamente.
- `useLocation()` dá acesso à URL atual (inclui `search`).

### 5.5.8) Query string como estado

A query string é parte da URL e é perfeita para filtros: é **partilhável**,
**reproduzível** e sobrevive a refresh. Na Ficha 4, `searchTerm` fica em `q`
e o tipo fica em `type`.

### 5.5.9) Rota 404 (fallback)

A rota `*` é um “apanha tudo”. Se nenhuma rota coincidir, aparece a 404.

### 5.5.10) Dev vs Prod (resumo rápido)

**Observações (Dev vs Prod):**

- **Dev** é o modo de desenvolvimento local (`npm run dev`): mais avisos e verificações. É normal ver efeitos duplicados.
- **Prod** é o build final (`npm run build` + `npm run preview`): código otimizado, mais rápido e sem efeitos duplicados do StrictMode. É o código que vai ser colocado no servidor.

**Observações:**

- Nesta ficha **não mudamos UI nem dados**: só mudamos a navegação. Mudamos a forma de navegar, não o que é navegado.

---

## 6) Observações do React Router

### Ponto da situação

- A partir daqui vais começar a “mexer no mapa” da aplicação (rotas).

### O que vamos fazer neste ponto

- Organizar o Router em 3 ideias simples:
    1. Layout + Outlet
    2. Params vs SearchParams
    3. 404 com `*`
- E deixar claro o que vai desaparecer da Ficha 3 (navegação por estado).

Este capítulo organiza o Router em 3 ideias simples (6.1–6.3) e termina
com uma lista do que vais **substituir/remover** quando chegares à fase certa
(6.4). Lê agora e volta aqui sempre que precisares de contexto.

### 6.1) Outlet e rotas aninhadas (pai e filha)

**Observações:**

- A rota **pai** define a moldura (menu, cabeçalho).
- A rota **filha** é o conteúdo que muda.
- O `<Outlet />` é a “janela” onde a filha aparece.

Exemplo curto:

```jsx
<Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="sobre" element={<Sobre />} />
</Route>
```

Snippet (o `Layout` com `Outlet`):

(Como eu sei que o Guilherme vai perguntar, um snippet é um bloquinho de código reutilizável que podes colar rapidamente no teu editor.)

```jsx
import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <div>
            <nav>...</nav>
            <Outlet />
        </div>
    );
}
// Sem <Outlet />, a rota filha nunca aparece.
```

> Então, resumindo:
> -> O Layout é a moldura fixa.
> -> O Outlet é o sítio onde a página da rota aparece.

**Erros comuns:**

- Esquecer o `<Outlet />` no `Layout` e ver a página vazia.
- Escrever `path="/sobre"` na rota filha (quebra a lógica do layout).

**Boas práticas:**

- Mantém os `path` das rotas filhas **relativos** ao `Layout`.
- Deixa o `Layout` focado em moldura (sem lógica de dados).
- Usa `NavLink` quando precisares de estado ativo no menu.

**Como depurar:**

- Se o menu aparece mas o conteúdo não, confirma o `<Outlet />`.
- Se a rota filha não aparece, revê se o `path` é relativo.
- Se o resto da app falha, confirma se o Router está ativo.

### 6.2) `useParams` vs `useSearchParams` (tudo vem como texto)

**Observações:**

- `useParams()` lê valores do **caminho**: `/pokemon/:id`.
- `useSearchParams()` lê valores da **query string**: `?q=pika&type=fire`.

**Regra:** tudo vem como **string** (ou `null`).

Exemplos:

```jsx
const { id } = useParams();
const numericId = Number(id); // Converte para número

const [params] = useSearchParams();
const searchTerm = params.get("q") ?? ""; // Evita null
```

**Erros comuns:**

- Comparar `id` (string) com número e não encontrar resultados. Ou convertes tudo para número e comparas com número, ou comparas tudo como string.
- Fazer `searchParams.get("q").trim()` quando o valor é `null`.
- Esquecer que `useSearchParams` **não atualiza** estado local automaticamente.

**Boas práticas:**

- Converte `id` para número com `Number(id)` antes de comparar.
- Normaliza `searchTerm` (de `q`) e `type` com `|| ""` para evitar `null`.
- Mantém a URL como fonte de verdade dos filtros.

(E novamente, respondendo ao Guilherme, fonte de verdade é uma expressão que significa que a informação mais confiável e oficial vem de um lugar específico - neste caso, a URL.)

### 6.3) Rota `*` no fim (apanha tudo)

**Observações:**

- A rota `*` é o **fallback**.
- Se nenhuma rota chamada combinar com o que está definido na App, ela aparece.

**Erros comuns:**

- Colocar `*` no meio e todas as rotas seguintes desaparecem porque nem chegam a ser executadas.
- Esquecer a rota `*` e ver uma página vazia em caminhos inválidos.

**Boas práticas:**

- Coloca a rota `*` **sempre no fim** da lista de rotas.
- Usa uma página 404 simples com `Link` para voltar.

**Como depurar quando estiver a funcionar:**

- Abre `/qualquer-coisa` e confirma que aparece a 404.
- Se não aparece, revê a ordem das rotas no `Routes`.

---

Estes 3 capítulos (6.1 a 6.3) são o “mapa mental” do Router. Para já ainda não implementamos nada. Apenas estamos a preparar o terreno.

---

## 6.4) O que vai ser removido/substituído mais à frente

Agora vamos abordar o que vamos alterar em relação à ficha 3. Ainda não vamos alterar nada, apenas fazer um mapa mental!!

Na migração para Router, **mais à frente** deixamos de usar navegação por estado da ficha 3.
Na **Fase 2.5** essa navegação ainda existe (é a ponte), e só depois é que a
substituímos por rotas reais.

**Vai ser removido/substituído:**

- `currentPage` (a página passa a ser decidida pela **URL**).
- `selectedPokemon` (o Pokémon vem de `/pokemon/:id`).
- `handlePokemonClick` + `handleBackToList` por `useNavigate` e rotas reais.

**Observações:**  
a URL passa a ser a **fonte de verdade** da navegação.

---

## 6.5) Backup do `App` da Ficha 3

Antes de começares a mexer no Router, guarda o `App.jsx` da Ficha 3.
Assim consegues comparar ou voltar atrás sem stress.

Escolhe **uma** destas opções:

- **Backup rápido:** copia `src/App.jsx` para `src/App.ficha3.jsx`.
- **Git:** faz commit antes de mexer e se precisares voltas à branch da Ficha 3.

---

## 7) Fase 1 - Router mínimo

Vamos implementar um Router mínimo para garantir que tudo está a funcionar...

### Ponto da situação

- Neste momento o Router pode estar instalado (npm), mas ainda não está “a controlar” a app.
- Sem Router ativo, tudo o que vem depois (Routes, NavLink, hooks) falha.

### O que vamos fazer neste ponto

- Confirmar o “fio elétrico” do Router:
    - `BrowserRouter` a envolver a app
    - `Routes` a renderizar algo simples

### Como vamos fazer (passos)

1. Editar `main.jsx` e garantir `<BrowserRouter>`.
2. Trocar temporariamente o `App.jsx` por uma versão mínima.
3. Ver “Router OK” no ecrã.

### Conceitos novos (explicar)

- `BrowserRouter`: dá ao Router acesso à URL e ao histórico do browser. Basicamente funciona como o “motor” do Router.
- `Routes`: contentor de regras. Ou seja, é onde defines as rotas. Imagina uma caixa com várias regras dentro.
- `Route`: regra individual. É onde dizes: "para esta URL, mostra este componente".

### Conceitos adjacentes

- Se vires erro `useRoutes() may be used only in the context of a <Router>` → falta `BrowserRouter`.

Objetivo: garantir que o Router está a funcionar **antes** de migrar a UI.

### Observações

Primeiro garantimos a **ligação do Router**.
Se o Router não estiver ativo, tudo o resto falha (Routes, NavLink, useParams).
Nesta fase, o objetivo é apenas confirmar o “fio elétrico” entre `main.jsx` e `App.jsx`.

### 7.1) `src/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import "@/styles/index.css";
import "@/styles/pokedex.css";

/**
 * ============================================
 * PONTO DE ENTRADA
 * ============================================
 *
 * Descrição: Lê o elemento root e monta o componente
 * principal da Pokédex dentro de React StrictMode.
 *
 * CONCEITOS APLICADOS:
 * - Fundamentos (entrada do React + StrictMode)
 * - React Router (BrowserRouter)
 * - Imports via alias (@)
 * - Estilos globais carregados antes da renderização
 *
 * NOTAS PEDAGÓGICAS:
 * - Sem BrowserRouter, Link/Routes/useParams falham.
 * - Este ficheiro não deve ter lógica de UI.
 *
 * @returns {void}
 */
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        {/* O Router tem de envolver toda a app */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);
```

### 7.2) `src/App.jsx` (versão mínima)

Este bloco **SUBSTITUI** temporariamente o `App.jsx` da Ficha 3.
Fazemos isto para testar o Router sem interferir com a UI da Ficha 3.

```jsx
import { Routes, Route } from "react-router-dom";

/**
 * ============================================
 * App (Fase 1)
 * ============================================
 *
 * Descrição: Router mínimo para confirmar que as rotas
 * estão a funcionar antes de migrar o resto da app.
 *
 * CONCEITOS APLICADOS:
 * - Routes + Route
 */
function App() {
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: este return devolve o “mapa” de rotas que o React Router vai usar para decidir o que mostrar.
    // Programação: usamos <Routes> como contentor e <Route> como regras; cada <Route> tem um path e um element.
    // Como isto é JSX, estás a devolver uma árvore de elementos (componentes) em vez de HTML direto.
    return (
        <Routes>
            <Route
                path="/"
                element={<p className="pokedex__empty">Router OK</p>}
            />
        </Routes>
    );
}

export default App;
```

### Erros comuns

- Esquecer o `BrowserRouter` e ver erros ao usar `Routes`.
- Manter o `App.jsx` antigo ao lado (duas versões no mesmo ficheiro).
- Não ter `div#root` no `index.html` e a app não montar.

(Guilherme, montar é uma expressão técnica que significa “iniciar” ou “carregar” a aplicação na página web.)

### Como depurar

- Se vires ecrã branco, confirma se o `App.jsx` foi mesmo substituído.
- Abre o console e confirma se há erros do Router (ex.: `useRoutes()`).

### Checkpoint

- A página mostra “Router OK”?

**Checkpoint visual**

- No ecrã deves ver o título “Router OK” sem erros no console.

### 7.3) Voltar ao App da Ficha 3 (antes de avançar)

Agora que confirmaste o Router, **repõe o `App.jsx` original da Ficha 3**.
A Fase 2.5 assume que toda a lógica (estado, handlers, `currentPage`/`selectedPokemon`) já existe.

Escolhe uma opção:

- Se fizeste backup: copia `src/App.ficha3.jsx` para `src/App.jsx`.
- Se usas Git: volta ao ficheiro com `git checkout -- src/App.jsx`.

Sem isto, a Fase 2.5 não funciona.

---

## 8) Fase 2 - Layout com `Outlet` + `NavLink`

### Ponto da situação

- O Router já funciona minimamente.

### O que vamos fazer neste ponto

- Criar o componente `Layout` (moldura fixa).
- Usar `<Outlet />` para mostrar a rota filha.
- Criar navegação com `NavLink`.

### Como vamos fazer (passos)

1. Criar `src/components/Layout.jsx`.
2. Atualizar `App.jsx` para ter rota pai (`Layout`) e rota filha (`index`). (posteriormente vamos adicionar mais rotas filhas)

**Atenção: `Outlet` é obrigatório**

Sem `<Outlet />`, as rotas filhas não aparecem e vais ver “página vazia”.

### Conceitos novos (explicar)

- `Outlet`: local onde a rota filha aparece. É um componente especial do Router. Não somos nós que o criamos; ele vem do Router.
- `NavLink`: link que consegue saber se está ativo (para estilo de navegação).
- Rotas aninhadas: `Route` dentro de `Route`.

### Conceitos adjacentes

- `end` no `NavLink` evita “match por prefixo” (senão o link da lista fica ativo em tudo).

### Propósito do componente

- `Layout` existe para: **hero + navegação + espaço para páginas**.  
  Não deve ter lógica pesada de dados (isso vem mais tarde e com cuidado).

### Observações

Aqui ainda não ligamos dados; só garantimos que a moldura aparece em todas as rotas.
Nota: nesta fase os contadores ainda são placeholders e o link “Favoritos”
pode abrir 404. Isto é **esperado** e será resolvido nas Fases 5 e 6.

### 8.1) `src/components/Layout.jsx`

Cria o ficheiro. Vamos **reutilizar as classes CSS da Ficha 3** para
não mexer nos estilos.

```jsx
import { NavLink, Outlet } from "react-router-dom";

/**
 * ============================================
 * Layout
 * ============================================
 *
 * Descrição: Moldura base da app com hero e navegação.
 *
 * CONCEITOS APLICADOS:
 * - Layout route + Outlet
 * - NavLink para estado ativo
 *
 * NOTAS PEDAGÓGICAS:
 * - Sem <Outlet />, as páginas filhas não aparecem.
 * - Reutilizamos classes existentes para manter o visual.
 */

/**
 * @returns {JSX.Element} Layout principal.
 */
function Layout() {
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: este return devolve a “moldura” fixa (hero + navegação) e deixa o espaço
    // para a página da rota ativa aparecer através do <Outlet />.
    // Programação: usamos <NavLink> para aplicar estado ativo (classe + style inline via isActive)
    // e garantimos que a rota filha renderiza dentro do layout sem recarregar a página.
    return (
        <div className="pokedex">
            <header className="pokedex__hero">
                <div>
                    <h1 className="pokedex__hero-title">Pokédex Digital</h1>
                    <p className="pokedex__hero-subtitle">
                        Descobre e explora os 151 Pokémon originais
                    </p>
                    <div className="pokedex__hero-stats">
                        <div className="pokedex__hero-stat">
                            Total de Pokémon
                            <strong>151</strong>
                        </div>
                        <div className="pokedex__hero-stat">
                            Favoritos
                            <strong>0</strong>
                        </div>
                        <div className="pokedex__hero-stat">
                            Resultados filtrados
                            <strong>0</strong>
                        </div>
                    </div>
                </div>
                <div className="pokedex__hero-pokeball" aria-hidden="true" />
            </header>

            {/*
                Navegação com classes já existentes (sem alterar CSS).
                O NavLink aplica a classe "active" e o style mantém a aparência
                de botão (inclui background/border e realce ativo).
            */}
            <nav className="type-filter" aria-label="Navegação principal">
                <span className="type-filter__label">Navegação</span>
                <div className="type-filter__buttons">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `type-filter__button${isActive ? " active" : ""}`
                        }
                        style={({ isActive }) => ({
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isActive
                                ? "var(--primary)"
                                : "var(--bg-surface)",
                            border: isActive
                                ? "3px solid var(--primary)"
                                : "3px solid var(--border)",
                            color: isActive ? "#fff" : "var(--text-dark)",
                        })}
                    >
                        Lista
                    </NavLink>
                    <NavLink
                        to="/favoritos"
                        className={({ isActive }) =>
                            `type-filter__button${isActive ? " active" : ""}`
                        }
                        style={({ isActive }) => ({
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isActive
                                ? "var(--primary)"
                                : "var(--bg-surface)",
                            border: isActive
                                ? "3px solid var(--primary)"
                                : "3px solid var(--border)",
                            color: isActive ? "#fff" : "var(--text-dark)",
                        })}
                    >
                        Favoritos
                    </NavLink>
                </div>
            </nav>

            {/* A rota filha aparece aqui */}
            <Outlet />
        </div>
    );
}

export default Layout;
```

> Os contadores ainda são placeholders. Vamos ligá‑los na Fase 5.

### 8.2) `src/App.jsx` (com Layout)

Este bloco **SUBSTITUI** o `App.jsx` da fase anterior.
Precisamos do `Layout` para ter `Outlet` e navegação comum em todas as rotas.

```jsx
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout.jsx";

/**
 * ============================================
 * App (Fase 2)
 * ============================================
 *
 * Descrição: Estrutura base com Layout + rota filha.
 *
 * CONCEITOS APLICADOS:
 * - Routes aninhadas
 * - Layout route
 */
function App() {
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: este return devolve o “mapa” de rotas que o React Router vai usar para decidir o que mostrar.
    // Programação: usamos <Routes> como contentor e <Route> como regras; cada <Route> tem um path e um element.
    // Como isto é JSX, estás a devolver uma árvore de elementos (componentes) em vez de HTML direto.
    return (
        <Routes>
            {/* Rota pai com Layout (moldura fixa). */}
            <Route path="/" element={<Layout />}>
                {/* Rota filha index = "/". */}
                <Route
                    index
                    element={
                        <p className="pokedex__empty">
                            Página temporária (fase 2). A lista vem na fase 3.
                        </p>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
```

### Erros comuns

- Esquecer o `<Outlet />` no `Layout` e ver só o hero.
- Usar `<a href>` em vez de `NavLink` (recarrega a página).
- Esquecer o `end` no link da lista e ele ficar ativo em todas as rotas.

### Como depurar

- Se o menu aparece e o conteúdo não, revê o `Outlet`.
- Confirma se a rota filha está dentro de `<Route path=\"/\" element={<Layout />}>`.

### Checkpoint

- O hero aparece?
- “Lista” fica ativa apenas em `/`?

**Checkpoint visual**

- No ecrã deves ver o hero e o menu de navegação com o link correto ativo.

---

## 8.5) Fase 2.5 - Router sem mexer na lógica

### Ponto da situação

- Tens Router + Layout, mas ainda não migraste a lógica real da app.
- Se tentares migrar lista + detalhes + filtros tudo de uma vez, vais quebrar tudo.

### O que vamos fazer neste ponto

- Fazer uma “ponte”:
    - A UI e lógica ficam iguais à Ficha 3.
    - Só mudas o `return` para ficar “dentro” do Router.

### Como vamos fazer (detalhadamente)

1. **Não mexer** em `useState`, `useEffect`, fetch, favoritos, filtragem.
2. Mexer **apenas** no bloco do `return`:
    - envolver com `<Routes>`
    - usar `<Layout />`
    - colocar a UI antiga dentro de um `Route index`.

### Conceitos adjacentes

- Nesta fase ainda tens `currentPage` e `selectedPokemon`. Não é “erro”: é transição.
- O objetivo é garantir que o Router está a renderizar o teu conteúdo antigo.

Objetivo: a app fica **igual à Ficha 3**.  
Mudança: **só mexemos no `return`**.
Não substituas o ficheiro todo: troca apenas o bloco do `return`.

Vamos lá...

### Parte A - Mantém‑se igual (lógica)

Tudo o que é estado, `useEffect`, fetch, favoritos, filtragem e handlers
fica **exatamente igual** ao que já tens da Ficha 3.
Isso inclui a navegação por estado com `currentPage` e `selectedPokemon`.

### Parte B - O que muda (renderização via Router)

Na Ficha 3, tu controlavas “que página aparece” com estado:

currentPage decidia se mostravas “list” ou “details”

selectedPokemon dizia “qual é o Pokémon selecionado”

Ou seja, a navegação era interna (state-driven).

Na Ficha 4 (Router), queres que a navegação seja decidida pela URL.
Mas nesta Fase 2.5 tu ainda não vais mudar a lógica (ainda não vais eliminar currentPage nem selectedPokemon).
Só vais “meter o Router a mandar” no container do render.

O `return` passa a ser controlado pelo Router.  
Em vez de “mostrar a lista diretamente”, colocamos a lista **inline**
dentro de um `Route index` (o ecrã principal em `/`).
Quando estás em `/`, o Router renderiza exatamente esse `index`.

**inline** = colocar diretamente o conteúdo dentro do JSX, sem criar outro componente.

#### Antes (return antigo)

```jsx
return (
    <div className="pokedex">
        <header className="pokedex__hero">...</header>
        {currentPage === "list" && (/* lista + filtros + grid */)}
        {currentPage === "details" && selectedPokemon && (
            /* detalhes */
        )}
    </div>
);
```

#### Depois (só o return com Routes + Layout)

De onde vem esse código?

Vem diretamente do return da Ficha 3 (App.jsx), mais concretamente dos dois blocos:

o bloco da lista (controlos + resultados + grelha)

o bloco dos detalhes (<PokemonDetailsPage ... />)

```jsx
// --- EXPLICAÇÃO DO RETURN ---
// Conceito: este return devolve o “mapa” de rotas que o React Router vai usar para decidir o que mostrar.
// Programação: usamos <Routes> como contentor e <Route> como regras; cada <Route> tem um path e um element.
// Como isto é JSX, estás a devolver uma árvore de elementos (componentes) em vez de HTML direto.
return (
    <Routes>
        <Route path="/" element={<Layout />}>
            <Route
                index
                element={
                    <>
                        {currentPage === "list" && (
                            <>
                                <section className="pokedex__controls">
                                    <SearchBar
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    <TypeFilter
                                        selectedType={selectedType}
                                        onTypeChange={handleTypeChange}
                                    />
                                </section>

                                <section className="pokedex__results">
                                    {loading && <LoadingSpinner />}

                                    {error && (
                                        <ErrorMessage
                                            message={error}
                                            onRetry={handleRetry}
                                        />
                                    )}

                                    {!loading &&
                                        !error &&
                                        resultsCount === 0 && (
                                            <p className="pokedex__empty">
                                                Nenhum Pokémon encontrado.
                                                Ajusta a pesquisa ou o filtro de
                                                tipo.
                                            </p>
                                        )}

                                    {!loading && !error && resultsCount > 0 && (
                                        <div className="pokedex__grid">
                                            {filteredPokemon.map((poke) => (
                                                <PokemonCard
                                                    key={poke.id}
                                                    pokemon={poke}
                                                    isFavorite={favorites.includes(
                                                        poke.id,
                                                    )}
                                                    onToggleFavorite={
                                                        toggleFavorite
                                                    }
                                                    onClick={handlePokemonClick}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        {currentPage === "details" && selectedPokemon && (
                            <PokemonDetailsPage
                                pokemon={selectedPokemon}
                                isFavorite={favorites.includes(
                                    selectedPokemon.id,
                                )}
                                onToggleFavorite={toggleFavorite}
                                onBack={handleBackToList}
                            />
                        )}
                    </>
                }
            />
        </Route>
    </Routes>
);
```

### Checkpoint

- A app deve estar **igual** à Ficha 3 (mesma UI e comportamento).
- A diferença é que agora está “dentro de rotas”.

**Checkpoint visual**

- No ecrã deves ver a lista e o detalhe a trocar exatamente como na Ficha 3.

---

## 9) Ficheiros reutilizados (ajustar, não reescrever)

### Ponto da situação

- Vais ver imports a quebrar porque alguns caminhos mudam (ou porque agora usas alias mais consistentemente).

### O que vamos fazer

- Garantir que os ficheiros reaproveitados continuam iguais, e só mudamos imports quando necessário.

### Como vamos fazer

- Confirmar ficheiro a ficheiro (sem reescrever conteúdo).
- Ajustar apenas imports para o alias `@`.

Nesta fase confirmas os ficheiros base. Se já os tens da Ficha 3, **mantém**
e **apenas ajusta** onde indicado.

Mantém também os cabeçalhos e JSDoc da Ficha 3 (não apagues comentários).

### 9.1) `src/components/typeData.js` (igual à Ficha 3)

Este ficheiro **é exatamente o mesmo** da Ficha 3.
Mantém‑no em `src/components/typeData.js` e não o reescrevas.
Não alteres cores, gradientes ou helpers.

Exemplo de import (o conteúdo fica igual ao da Ficha 3):

```js
import { getTypeGradient, TYPE_SEQUENCE } from "@/components/typeData.js";
```

### 9.2) `src/services/pokeApi.js` (mesmo helper da Ficha 3)

Mantém a lógica da Ficha 3. Este ficheiro **já está** em `src/services/`,
por isso não o reescrevas nem o movas.
Não alteres o formato dos dados devolvidos (mantém o objeto Pokémon da Ficha 3).

Exemplo de import:

```js
import { fetchPokemonList } from "@/services/pokeApi.js";
```

### 9.3) `LoadingSpinner.jsx` (igual à Ficha 3)

Mantém o componente **exatamente igual** ao da Ficha 3.
Não alteres classes, texto nem estrutura.

Exemplo de import:

```js
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
```

### 9.4) `ErrorMessage.jsx` (igual à Ficha 3)

Mantém o componente **igual ao da Ficha 3**.
Se tiveres texto, classes ou emojis, mantém exatamente como está.

Exemplo de import:

```js
import ErrorMessage from "@/components/ErrorMessage.jsx";
```

### 9.5) `SearchBar.jsx` (igual à Ficha 3)

Mantém o componente **igual ao da Ficha 3**.
Se a tua versão tiver ícone/emoji, mantém; se não tiver, não adiciones.

Exemplo de import:

```js
import SearchBar from "@/components/SearchBar.jsx";
```

### 9.6) `TypeFilter.jsx` (igual à Ficha 3, só muda o import)

Mantém o componente **igual ao da Ficha 3**.
A única mudança é o import do `typeData`.

```js
import { getTypeGradient, TYPE_SEQUENCE } from "@/components/typeData.js";
```

### 9.7) `PokemonCard.jsx` (igual à Ficha 3, só muda o import)

Mantém o componente **igual ao da Ficha 3**.
A única mudança é o import do `typeData`.

```js
import { getTypeGradient } from "@/components/typeData.js";
```

---

## 10) Fase 3 - Extrair a lista para `PokemonListPage`

### Ponto da situação

- O `App.jsx` está a ficar demasiado pesado: tem estado global + UI + lógica da lista.
- Regra geral devemos separar responsabilidades:
    - `App`: estado global + rotas + favoritos
    - `PokemonListPage`: UI da lista (filtros + grid + estados visuais)
- Benefícios:
    - Código mais organizado e fácil de perceber.
    - Componentes mais focados numa única responsabilidade.
- Basicamente se um ficheiro está a fazer “tudo ao mesmo tempo”:
    - É mais difícil de ler.
    - É mais difícil de testar.
    - É mais difícil de reutilizar.
    - É mais difiícil de manter.
- Quando tudo está no mesmo sítio, é mais difícil perceber responsabilidades.

### O que vamos fazer

- Criar uma **page** (`PokemonListPage`) responsável pela UI da lista.
- O `App` fica como “cérebro”: dados globais + rotas + favoritos.
- A page fica como “rosto”: UI da lista + filtros + grid + estados visuais.
- Depois, na App, passamos os dados e handlers como props para o componente `PokemonListPage`.

### Como vamos fazer

1. Criar `PokemonListPage.jsx` na pasta `components/`.
2. Passar `pokemon`, `favorites` e handlers como props.
3. No clique do card, navegar com `useNavigate()` para `/pokemon/:id`.

**Nota:** O `PokemonListPage` vai ser usado na rota `/` (index). O `useNavigate` é um hook do Router que permite navegar programaticamente.

(Sim, eu sei, Guilherme... "programaticamente" é uma palavra técnica que significa "fazer algo através de código, em vez de interação direta do utilizador". Neste caso, significa que o código decide quando e para onde navegar, sem o utilizador clicar num link.)

### Observações

O `App` deixa de renderizar a lista diretamente e passa a **entregar dados** a uma page.
A page é responsável pela UI da lista (filtros, grid e estados visuais),
mas o estado global continua no `App`.

**Reutilização:** usa `SearchBar`, `TypeFilter`, `PokemonCard`, `LoadingSpinner`
e `ErrorMessage` exatamente como estão na Ficha 3; só ajusta imports.

### Nota importante sobre hooks

> **Hooks só podem ser chamados dentro do corpo de um componente.**
> Não coloques `useState`, `useMemo`, `useEffect` fora do `function`.

Antes de usares callbacks pela primeira vez nesta ficha, reve a secao "Callbacks e fluxo de dados" em `React/03_props_e_composicao.md#sec-3`.

### 10.1) Fase A - lista simples

Cria o ficheiro `src/components/PokemonListPage.jsx`.

```jsx
import { useNavigate } from "react-router-dom";
import PokemonCard from "@/components/PokemonCard.jsx"; // reutilizado da Ficha 3

/**
 * ============================================
 * PokemonListPage (Fase A)
 * ============================================
 *
 * Descrição: Lista base sem filtros.
 *
 * CONCEITOS APLICADOS:
 * - Props + listas
 * - Navegação programática com useNavigate
 */

/**
 * @param {object} props
 * @param {Array} props.pokemon - Lista de Pokémon.
 * @param {number[]} props.favorites - IDs favoritos.
 * @param {(id: number) => void} props.onToggleFavorite - Alterna favorito.
 * @returns {JSX.Element}
 */
function PokemonListPage({ pokemon, favorites, onToggleFavorite }) {
    const navigate = useNavigate(); // navegação programática

    function handlePokemonClick(pokemonItem) {
        navigate(`/pokemon/${pokemonItem.id}`); // navega para detalhes do Pokémon com o id dado
    }
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: este return mostra a grelha (lista) de Pokémon.
    // Programação: usamos .map() para transformar cada item do array `pokemon` num <PokemonCard>.
    // A prop key={poke.id} dá ao React uma chave estável para gerir a lista; favorites.includes(poke.id) decide o estado de favorito.
    // Passamos callbacks via props (onToggleFavorite/onClick) para o card poder comunicar ações de volta ao “pai”.
    return (
        <section className="pokedex__results">
            <div className="pokedex__grid">
                {pokemon.map((poke) => (
                    <PokemonCard
                        key={poke.id}
                        pokemon={poke}
                        isFavorite={favorites.includes(poke.id)}
                        onToggleFavorite={onToggleFavorite}
                        onClick={handlePokemonClick}
                    />
                ))}
            </div>
        </section>
    );
}

export default PokemonListPage;
```

### 10.2) Fase B - pesquisa por nome (`useState`)

Este bloco **SUBSTITUI** o anterior.
Assim adicionas pesquisa sem manter duas lógicas de filtro em paralelo.

```jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "@/components/SearchBar.jsx";
import PokemonCard from "@/components/PokemonCard.jsx";

/**
 * ============================================
 * PokemonListPage (Fase B)
 * ============================================
 *
 * Descrição: Lista com pesquisa por nome.
 */
/**
 * @param {object} props
 * @param {Array} props.pokemon - Lista de Pokémon.
 * @param {number[]} props.favorites - IDs favoritos.
 * @param {(id: number) => void} props.onToggleFavorite - Alterna favorito.
 * @returns {JSX.Element} Página com pesquisa por nome.
 */
function PokemonListPage({ pokemon, favorites, onToggleFavorite }) {
    const navigate = useNavigate(); // navegação programática
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPokemon = pokemon.filter((poke) =>
        poke.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    );

    function handlePokemonClick(pokemonItem) {
        navigate(`/pokemon/${pokemonItem.id}`);
    }
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: este return mostra os controlos (pesquisa/filtro) e a grelha de resultados.
    // Programação: usamos um Fragment (<>) para devolver múltiplas secções sem criar um <div> extra.
    // Um fragmento é útil quando queres devolver vários elementos irmãos. Por norma, um componente React só pode devolver um único elemento raiz. Ou seja, um único `<div>`, `<section>`, etc. O Fragmento (`<>...</>`) permite contornar essa limitação sem adicionar nós extras ao DOM. O que faz é agrupar os elementos no JSX, mas não cria um elemento real no HTML.
    // A lista é criada com .map() e os componentes recebem props (value, onChange, selectedType, onTypeChange) para ligar UI a estado.

    return (
        <>
            <section className="pokedex__controls">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </section>

            <section className="pokedex__results">
                <div className="pokedex__grid">
                    {filteredPokemon.map((poke) => (
                        <PokemonCard
                            key={poke.id}
                            pokemon={poke}
                            isFavorite={favorites.includes(poke.id)}
                            onToggleFavorite={onToggleFavorite}
                            onClick={handlePokemonClick}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}

export default PokemonListPage;
```

### 10.3) Fase C - filtro por tipo (`useState`)

Este bloco **SUBSTITUI** o anterior.
Agora adicionamos o filtro por tipo sem duplicar o `filtered`.

```jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "@/components/SearchBar.jsx";
import TypeFilter from "@/components/TypeFilter.jsx";
import PokemonCard from "@/components/PokemonCard.jsx";

/**
 * ============================================
 * PokemonListPage (Fase C)
 * ============================================
 *
 * Descrição: Lista com pesquisa e filtro por tipo.
 */
/**
 * @param {object} props
 * @param {Array} props.pokemon - Lista de Pokémon.
 * @param {number[]} props.favorites - IDs favoritos.
 * @param {(id: number) => void} props.onToggleFavorite - Alterna favorito.
 * @returns {JSX.Element} Página com pesquisa e filtro por tipo.
 */
function PokemonListPage({ pokemon, favorites, onToggleFavorite }) {
    const navigate = useNavigate(); // navegação programática
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");

    const filteredPokemon = pokemon.filter((poke) => {
        const matchesSearch = poke.name
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());
        const matchesType =
            selectedType === "all" ||
            poke.types.some((typeInfo) => typeInfo.type.name === selectedType);

        return matchesSearch && matchesType;
    });

    function handlePokemonClick(pokemonItem) {
        navigate(`/pokemon/${pokemonItem.id}`);
    }
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: este return mostra os controlos (pesquisa/filtro) e a grelha de resultados.
    // Programação: usamos um Fragment (<>) para devolver múltiplas secções sem criar um <div> extra.
    // A lista é criada com .map() e os componentes recebem props (value, onChange, selectedType, onTypeChange) para ligar UI a estado.

    return (
        <>
            <section className="pokedex__controls">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
                <TypeFilter
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                />
            </section>

            <section className="pokedex__results">
                <div className="pokedex__grid">
                    {filteredPokemon.map((poke) => (
                        <PokemonCard
                            key={poke.id}
                            pokemon={poke}
                            isFavorite={favorites.includes(poke.id)}
                            onToggleFavorite={onToggleFavorite}
                            onClick={handlePokemonClick}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}

export default PokemonListPage;
```

### 10.4) Versão final (ainda sem query string)

Este bloco **SUBSTITUI** o anterior. Aqui já adicionamos
loading, erro e “lista vazia” como na Ficha 3.
Faz isto para centralizar os estados visuais numa única versão da page.

```jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "@/components/SearchBar.jsx";
import TypeFilter from "@/components/TypeFilter.jsx";
import PokemonCard from "@/components/PokemonCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import ErrorMessage from "@/components/ErrorMessage.jsx";

/**
 * ============================================
 * PokemonListPage (pré‑query string)
 * ============================================
 *
 * Descrição: Página principal com lista e filtros locais.
 */
/**
 * @param {object} props
 * @param {Array} props.pokemon - Lista de Pokémon.
 * @param {number[]} props.favorites - IDs favoritos.
 * @param {boolean} props.loading - Estado de carregamento.
 * @param {string|null} props.error - Mensagem de erro.
 * @param {() => void} props.onRetry - Handler do botão de retry.
 * @param {(id: number) => void} props.onToggleFavorite - Alterna favorito.
 * @returns {JSX.Element} Página com lista, filtros e estados.
 */
function PokemonListPage({
    pokemon,
    favorites,
    loading,
    error,
    onRetry,
    onToggleFavorite,
}) {
    const navigate = useNavigate(); // navegação programática
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");

    const filteredPokemon = pokemon.filter((poke) => {
        const matchesSearch = poke.name
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());
        const matchesType =
            selectedType === "all" ||
            poke.types.some((typeInfo) => typeInfo.type.name === selectedType);

        return matchesSearch && matchesType;
    });

    const resultsCount = filteredPokemon.length;

    function handlePokemonClick(pokemonItem) {
        navigate(`/pokemon/${pokemonItem.id}`);
    }
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: mostramos a área de controlos (pesquisa + filtro) e a área de resultados,
    // mudando o que aparece conforme loading/erro/vazio.
    // Programação: usamos Fragment para devolver duas secções irmãs, condicionais com && para
    // estados visuais e .map() para gerar a grelha de cards com props e key estável.

    return (
        <>
            <section className="pokedex__controls">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
                <TypeFilter
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                />
            </section>

            <section className="pokedex__results">
                {loading && <LoadingSpinner />}
                {error && <ErrorMessage message={error} onRetry={onRetry} />}

                {!loading && !error && resultsCount === 0 && (
                    <p className="pokedex__empty">
                        Nenhum Pokémon encontrado. Ajusta a pesquisa ou o filtro
                        de tipo.
                    </p>
                )}

                {!loading && !error && resultsCount > 0 && (
                    <div className="pokedex__grid">
                        {filteredPokemon.map((poke) => (
                            <PokemonCard
                                key={poke.id}
                                pokemon={poke}
                                isFavorite={favorites.includes(poke.id)}
                                onToggleFavorite={onToggleFavorite}
                                onClick={handlePokemonClick}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}

export default PokemonListPage;
```

### Erros comuns

- Colocar hooks fora do componente.
- Esquecer `.trim()` e ter filtros inconsistentes.
- Usar `selectedType === ""` em vez de `"all"`.

### Como depurar

- `console.log(searchTerm, selectedType)` para confirmar valores.
- Se a lista ficar vazia, confirma `resultsCount`.

### Checkpoint

- Pesquisa e filtro funcionam?
- A UI mantém o mesmo visual da Ficha 3?

**Checkpoint visual**

- No ecrã deves ver a grelha a responder à pesquisa e ao filtro.

---

## 11) `App.jsx` (Fase 3) - dados + favoritos

### Ponto da situação

- A lista já está numa page (`PokemonListPage`).
- Agora o `App` passa a ser claramente:
    - estado global (dados, loading, erro, favoritos)
    - rotas

### O que vamos fazer

- Reorganizar o `App.jsx` para:
    - carregar dados uma vez
    - gerir favoritos
    - expor rotas com `Layout` + `index`

### Como vamos fazer

1. Manter lógica igual (useEffect + localStorage).
2. Substituir apenas a parte do `return` por rotas.
3. Passar props para `PokemonListPage`.

Este bloco **SUBSTITUI** o `App.jsx` da fase 2.5.
Fazemos isto para mover a lista para uma page e deixar o `App` apenas com
estado global e rotas.
O `App` passa a **gerir dados e favoritos**, e a rota `/` passa a renderizar
`PokemonListPage` dentro do `Layout`.

**Nota importante sobre `localStorage`:** usa **a mesma key da Ficha 3**.
Se usaste outra (ex.: `pokemonFavorites`), mantém exatamente esse valor
para não perder favoritos.

### 11.1) Parte A - Fica igual (lógica: estado e efeitos)

```jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout.jsx";
import PokemonListPage from "@/components/PokemonListPage.jsx";
import { fetchPokemonList } from "@/services/pokeApi.js";

const POKEMON_LIMIT = 151;
const FAVORITES_KEY = "pokemonFavorites"; // Mantém a mesma key da Ficha 3

/**
 * ============================================
 * App (Fase 3)
 * ============================================
 *
 * Descrição: Estado global + lista numa page.
 */
function App() {
    const [pokemon, setPokemon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);

    async function loadPokemonList() {
        setLoading(true);
        setError(null);
        try {
            const detailedPokemon = await fetchPokemonList(POKEMON_LIMIT);
            setPokemon(detailedPokemon);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    // Carrega dados quando o componente é montado.
    useEffect(() => {
        loadPokemonList();
    }, []);

    // Carrega favoritos guardados.
    useEffect(() => {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    // Persiste favoritos sempre que mudam.
    useEffect(() => {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }, [favorites]);

    /**
     * Alterna um Pokémon nos favoritos usando o valor mais recente.
     *
     * @param {number} id - ID do Pokémon.
     */
    function toggleFavorite(id) {
        setFavorites((prev) => {
            if (prev.includes(id)) {
                return prev.filter((favId) => favId !== id);
            }
            return [...prev, id];
        });
    }

    /**
     * Tenta recarregar os dados da API.
     */
    function handleRetry() {
        loadPokemonList();
    }

    // A renderização começa no próximo bloco.
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: aqui o App deixa de renderizar a UI diretamente e passa a devolver o
    // “mapa de rotas” com o Layout como moldura e a lista na rota index (/).
    // Programação: usamos <Routes>/<Route> para definir as páginas e passamos props
    // (dados, favoritos e handlers) para o PokemonListPage dentro do element.
    return (
```

Até aqui tens a **mesma lógica** da Ficha 3.  
O que muda a seguir é **só a renderização**: o `Route index` passa a renderizar
`PokemonListPage`.

### 11.2) Parte B - Muda (renderização via Router)

```jsx
        <Routes>
            {/* Rota pai com Layout (moldura fixa). */}
            <Route path="/" element={<Layout />}>
                {/* Rota filha index = "/". */}
                <Route
                    index
                    element={
                        <PokemonListPage
                            pokemon={pokemon}
                            favorites={favorites}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                            onToggleFavorite={toggleFavorite}
                        />
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
```

### Erros comuns

- Esquecer de chamar `loadPokemonList()` dentro do `useEffect`.
- Apagar o `localStorage` key e perder favoritos sem querer.

### Como depurar

- `console.log(pokemon.length)` para confirmar o carregamento.
- Força um erro na URL da API e confirma a mensagem.

### Checkpoint

- A lista aparece com o mesmo visual da Ficha 3?

**Checkpoint visual**

- No ecrã deves ver a lista renderizada dentro do Layout com Router ativo.

---

## 12) Fase 4 - Migrar detalhes para rota dinâmica `/pokemon/:id`

### Ponto da situação

- Antes: o detalhe dependia do estado `selectedPokemon`.
- Agora: o detalhe deve depender da URL (`/pokemon/:id`).

### O que vamos fazer

- Criar / Editar `PokemonDetailsPage` que lê `id` via `useParams()`.
- Procurar o Pokémon na lista global (já carregada no `App`).
- Tratar `loading`/`error` para acesso direto ao link funcionar.

### Como vamos fazer

1. Criar / Editar `PokemonDetailsPage.jsx` com `useParams`, `useNavigate`, `useLocation`.
2. Em `App.jsx`, adicionar a rota `pokemon/:id`.
3. Na lista, navegar para `/pokemon/${id}` no clique do card.

### Conceitos novos

- `useParams()` devolve `{ id: "25" }` (string).
- É obrigatório `Number(id)` para comparar com `pokemon.id` (número).

**Erro típico (string vs number)**

Se comparares `"4"` com `4`, dá falso. Converte sempre com `Number(id)` antes de comparar.

### Conceitos adjacentes

- Acesso direto: se entrares em `/pokemon/1` antes de o fetch acabar, tens de mostrar loading.
- Botão “voltar” robusto: `navigate(-1)` pode sair da app; por isso usamos navegação controlada.

### Observações

O detalhe deixa de ser “uma secção escondida” e passa a ser **uma rota própria**.
O Pokémon escolhido vem sempre da URL (`/pokemon/:id`), não do estado local.

**Reutilização:** a estrutura da página de detalhe, classes e estilos
mantêm-se iguais à Ficha 3. Só muda a forma de obter o Pokémon (via URL).
Se a tua Ficha 3 usa emojis nos botões de favorito, mantém; se não usa, não adiciones.
Se entrares diretamente na rota de detalhe, usa os mesmos estados de
loading/erro da Ficha 3 para evitar o “não encontrado” durante o fetch.

### 12.1) `src/components/PokemonDetailsPage.jsx`

Cria a página a partir do componente da Ficha 3,
mas agora com `useParams` e `useNavigate`.

#### 12.1.1) Parte A - lógica e hooks (fora do return)

```jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "@/components/ErrorMessage.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { getTypeGradient } from "@/components/typeData.js";

// Rótulos legíveis para os stats dos Pokémon.
const STAT_LABELS = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defesa",
    "special-attack": "Ataque Esp.",
    "special-defense": "Defesa Esp.",
    speed: "Velocidade",
};

/**
 * ============================================
 * PokemonDetailsPage
 * ============================================
 *
 * Descrição: Página detalhada de cada Pokémon com layout em duas
 * colunas e barra de stats.
 *
 * CONCEITOS APLICADOS:
 * - useParams (parâmetro da rota)
 * - useNavigate (voltar para a lista)
 * - Listas e condicionais
 *
 * NOTAS PEDAGÓGICAS:
 * - Mantém as mesmas conversões da Ficha 3 (height/10, weight/10).
 * - `navigate(-1)` pode sair da app se o acesso for direto.
 * - Se chegares via URL direta, mostra loading/erro antes do “não encontrado”.
 *
 * Props:
 * @param {Array} pokemon - Lista completa de Pokémon.
 * @param {number[]} favorites - IDs favoritos.
 * @param {(id: number) => void} onToggleFavorite - Alterna favorito.
 * @param {boolean} loading - Estado de carregamento.
 * @param {string|null} error - Mensagem de erro.
 * @param {() => void} onRetry - Handler do botão de retry.
 *
 * @returns {JSX.Element} Página de detalhes completa.
 */
function PokemonDetailsPage({
    pokemon,
    favorites,
    onToggleFavorite,
    loading,
    error,
    onRetry,
}) {
    const { id } = useParams(); // id vem da URL
    const navigate = useNavigate(); // navegação programática
    const location = useLocation(); // contém a query string atual

    // useParams devolve strings
    const numericId = Number(id);

    if (loading) {
        // --- EXPLICAÇÃO DO RETURN ---
        // Conceito: enquanto os dados ainda estão a carregar, mostramos feedback ao utilizador.
        // Programação: fazemos um early return (saída antecipada) para terminar o componente aqui e evitar renderizar JSX dependente de dados.
        return <LoadingSpinner />;
    }

    if (error) {
        // --- EXPLICAÇÃO DO RETURN ---
        // Conceito: quando há erro no carregamento, mostramos a mensagem e um botão de tentar novamente.
        // Programação: devolvemos <ErrorMessage .../> e passamos a prop onRetry para o componente conseguir chamar o handler do 'pai'.
        return <ErrorMessage message={error} onRetry={onRetry} />;
    }

    const current = pokemon.find((item) => item.id === numericId);

    if (!current) {
        // --- EXPLICAÇÃO DO RETURN ---
        // Conceito: quando não há dados válidos (ex.: id não existe, ou lista vazia), mostramos um estado vazio claro.
        // Programação: devolvemos um elemento JSX simples (<p>) e terminamos o componente imediatamente (early return).
        return <p className="pokedex__empty">Pokémon não encontrado.</p>;
    }

    const formattedNumber = `#${String(current.id).padStart(3, "0")}`;
    const heightInMetres = (current.height / 10).toFixed(1);
    const weightInKg = (current.weight / 10).toFixed(1);
    const statsTotal = current.stats.reduce(
        (sum, stat) => sum + stat.base_stat,
        0,
    );

    /**
     * Alterna favorito a partir do botão da página de detalhes.
     */
    function handleFavoriteClick() {
        onToggleFavorite(current.id);
    }

    /**
     * Volta para a lista, preservando a query string (se existir).
     */
    function handleBack() {
        // Mantém os filtros da URL ao voltar.
        navigate({ pathname: "/", search: location.search });
    }

    /**
     * Devolve o rótulo do stat em português.
     *
     * @param {string} statName - Nome técnico do stat.
     * @returns {string} Rótulo legível.
     */
    function getStatLabel(statName) {
        return STAT_LABELS[statName] || statName;
    }

    // A renderização começa no próximo bloco.
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: renderizamos a página de detalhes com cabeçalho (voltar/favorito),
    // sidebar com imagem/tipos/medidas e área principal com stats e habilidades.
    // Programação: usamos .map() para tipos/stats/habilidades, ternário para o rótulo
    // de favorito e styles inline para a largura das barras de stats.
    return (
```

Até aqui ligaste os hooks do Router, trataste `loading`/`error` e encontraste
o Pokémon certo. A seguir vais renderizar a UI **igual à da Ficha 3**.

#### 12.1.2) Parte B - JSX (dentro do return)

```jsx
        <article className="pokemon-details">
            <header className="pokemon-details__header">
                <button type="button" onClick={handleBack}>
                    ← Voltar
                </button>
                <button type="button" onClick={handleFavoriteClick}>
                    {favorites.includes(current.id)
                        ? "❤️ Favorito"
                        : "🤍 Favorito"}
                </button>
            </header>

            <div className="pokemon-details__layout">
                <aside className="pokemon-details__sidebar">
                    <span className="pokemon-details__number">
                        {formattedNumber}
                    </span>
                    <h2 className="pokemon-details__name">{current.name}</h2>
                    <img
                        className="pokemon-details__image"
                        src={
                            current.sprites?.other?.["official-artwork"]
                                ?.front_default ||
                            current.sprites?.front_default ||
                            ""
                        }
                        alt={`Artwork oficial de ${current.name}`}
                    />
                    <div className="pokemon-details__types">
                        {current.types.map((typeInfo) => (
                            <span
                                key={typeInfo.type.name}
                                className="pokemon-details__type"
                                style={{
                                    background: getTypeGradient(
                                        typeInfo.type.name,
                                    ),
                                }}
                            >
                                {typeInfo.type.name}
                            </span>
                        ))}
                    </div>
                    <div className="pokemon-details__measures">
                        <div className="pokemon-details__measure">
                            <span>Altura</span>
                            <strong>{heightInMetres} m</strong>
                        </div>
                        <div className="pokemon-details__measure">
                            <span>Peso</span>
                            <strong>{weightInKg} kg</strong>
                        </div>
                    </div>
                </aside>

                <section className="pokemon-details__main">
                    <div className="pokemon-details__stats">
                        {current.stats.map((stat) => {
                            const statLabel = getStatLabel(stat.stat.name);
                            const progress = Math.min(stat.base_stat, 255);
                            const width = (progress / 255) * 100;
                            return (
                                <div className="stat-row" key={stat.stat.name}>
                                    <div className="stat-row__label">
                                        <span>{statLabel}</span>
                                        <span>{stat.base_stat}</span>
                                    </div>
                                    <div className="stat-row__bar">
                                        <div
                                            className="stat-row__fill"
                                            style={{ width: `${width}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p className="stat-total">Total de stats: {statsTotal}</p>

                    <div className="pokemon-details__abilities">
                        <h3>Habilidades</h3>
                        {current.abilities.map((abilityInfo) => (
                            <div
                                className="ability-item"
                                key={abilityInfo.ability.name}
                            >
                                <span>{abilityInfo.ability.name}</span>
                                {abilityInfo.is_hidden && (
                                    <span className="ability-badge">
                                        Oculta
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pokemon-details__info">
                        <p>Experiência base: {current.base_experience}</p>
                        <p>Ordem: {current.order}</p>
                    </div>
                </section>
            </div>
        </article>
    );
}

export default PokemonDetailsPage;
```

### Nota sobre o botão “Voltar”

- `navigate(-1)` pode sair da app se o utilizador entrou diretamente no link.
- Por isso usamos `navigate({ pathname: "/", search: location.search })`
  para voltar à lista **e** preservar os filtros da URL.

**Teste**

Abre a lista com `?q=pika&type=electric`, entra num detalhe e confirma
que ao voltar **manténs os mesmos filtros**.

### 12.2) Atualizar `src/App.jsx` com a rota dinâmica

Este bloco **SUBSTITUI** o `App.jsx` da fase 3.
Agora precisamos da rota dinâmica para detalhes.
Nesta fase o `App` ganha a rota `pokemon/:id` e passa `pokemon`, `loading`
e `error` para a página de detalhes.

### 12.2.1) Parte A - Fica igual (lógica: estado e efeitos)

```jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout.jsx";
import PokemonListPage from "@/components/PokemonListPage.jsx";
import PokemonDetailsPage from "@/components/PokemonDetailsPage.jsx";
import { fetchPokemonList } from "@/services/pokeApi.js";

const POKEMON_LIMIT = 151;
const FAVORITES_KEY = "pokemonFavorites"; // Mantém a mesma key da Ficha 3

/**
 * ============================================
 * App (Fase 4)
 * ============================================
 *
 * Descrição: Estado global + rotas principais.
 */
function App() {
    const [pokemon, setPokemon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);

    async function loadPokemonList() {
        setLoading(true);
        setError(null);
        try {
            const detailedPokemon = await fetchPokemonList(POKEMON_LIMIT);
            setPokemon(detailedPokemon);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPokemonList();
    }, []);

    useEffect(() => {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }, [favorites]);

    function toggleFavorite(id) {
        setFavorites((prev) => {
            if (prev.includes(id)) {
                return prev.filter((favId) => favId !== id);
            }
            return [...prev, id];
        });
    }

    function handleRetry() {
        loadPokemonList();
    }

    // A renderização começa no próximo bloco.
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: devolvemos o Router com Layout + duas páginas: lista (index) e detalhe
    // (rota dinâmica /pokemon/:id), mantendo o estado global no App.
    // Programação: cada <Route> recebe um element e esse element recebe props necessárias
    // (dados, loading/erro, favoritos e handlers) para renderizar cada página.
    return (
```

Até aqui mantiveste o estado global como na Ficha 3.  
O que muda a seguir é **a renderização via Router**: adicionamos a rota
dinâmica `pokemon/:id` e ligamos a `PokemonDetailsPage`.

### 12.2.2) Parte B - Muda (rotas: adiciona `/pokemon/:id`)

```jsx
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route
                    index
                    element={
                        <PokemonListPage
                            pokemon={pokemon}
                            favorites={favorites}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                            onToggleFavorite={toggleFavorite}
                        />
                    }
                />
                <Route
                    path="pokemon/:id"
                    element={
                        /* Rota dinâmica para detalhes. */
                        <PokemonDetailsPage
                            pokemon={pokemon}
                            favorites={favorites}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                            onToggleFavorite={toggleFavorite}
                        />
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
```

### Erros comuns

- Esquecer `Number(id)` e nunca encontrar o Pokémon.
- Manter lógica de `currentPage/selectedPokemon` do Router antigo.
- Não tratar o caso de `id` inválido e deixar a página em branco.
- Mostrar “Pokémon não encontrado” enquanto o fetch ainda está a carregar.

### Como depurar

- `console.log(id, typeof id)` para confirmar que é string.
- Testa `/pokemon/1` e `/pokemon/9999`.

### Checkpoint

- Clicar num card abre a rota `/pokemon/:id`?
- O detalhe mantém o mesmo comportamento da Ficha 3 (incluindo conversões)?

**Checkpoint visual**

- Ao clicar num card, a URL muda para `/pokemon/ID` e vês a página de detalhes.

---

## 13) Fase 5 - Migrar filtros para query string

### Ponto da situação

- Até agora, filtros vivem em `useState`. Se fizeres refresh, perdes tudo.
- Objetivo: filtros serem “partilháveis” e sobreviverem a refresh.

### O que vamos fazer

- Substituir `useState` de filtros por `useSearchParams()`.
- Guardar:
    - pesquisa em `q`
    - tipo em `type`

### Como vamos fazer

1. Ler `q` e `type` da URL com `params.get(...)`.
2. Quando o input muda, atualizar a URL com `setParams`.
3. Quando o tipo muda, atualizar a URL com `setParams`.
4. Ao navegar para detalhe, anexar a query string.

### Conceitos novos

- `useSearchParams` é como um “estado”, mas guardado na URL.

### Conceitos adjacentes

- `params.get("q")` pode devolver `null` → usa `|| ""`.
- `replace: true` evita “encher o histórico” em cada tecla.

Nesta fase, a URL passa a ser a **fonte de verdade** para `searchTerm` (em `q`)
e `type`.

### Observações

Os filtros deixam de viver em `useState` e passam a viver na **query string**.
Quando navegas para detalhes, anexas `?q=...&type=...` para poderes voltar à lista
com os mesmos filtros (o detalhe precisa dessa query para regressar corretamente).

Quando atualizas o `searchTerm` pelo input, usamos `replace: true` para não
poluir o histórico a cada tecla.

**Ordem recomendada (para não te perderes)**

1. Garante que **navegação** e **detalhes** funcionam sem query string.
2. Só depois migra `searchTerm` e `type` para a URL.

**Reutilização:** `SearchBar`, `TypeFilter` e `PokemonCard` mantêm-se iguais;
apenas muda a origem do estado (URL).

### Parte A - Fica igual (lógica global)

Estado global no `App`, fetch e favoritos **não mudam**.

### Parte B - Muda (lógica da lista)

`PokemonListPage` passa a ler/escrever `searchTerm` e `type` pela URL,
mas o JSX da lista mantém‑se igual.

### 13.1) `src/components/PokemonListPage.jsx` (versão final)

Este bloco **SUBSTITUI** a versão com `useState`.
A fonte de verdade dos filtros passa a ser a URL (query string).

#### 13.1.1) Parte A - lógica e hooks (fora do return)

```jsx
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "@/components/SearchBar.jsx";
import TypeFilter from "@/components/TypeFilter.jsx";
import PokemonCard from "@/components/PokemonCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import ErrorMessage from "@/components/ErrorMessage.jsx";

/**
 * ============================================
 * PokemonListPage
 * ============================================
 *
 * Descrição: Página principal com lista e filtros via query string.
 *
 * CONCEITOS APLICADOS:
 * - useSearchParams (query string como estado)
 * - useMemo (evitar cálculos repetidos)
 * - Props + composição
 *
 * NOTAS PEDAGÓGICAS:
 * - A URL é a fonte de verdade para `searchTerm` (em `q`) e `type`.
 * - Hooks só podem ser chamados dentro do componente.
 *
 * Props:
 * @param {Array} pokemon - Lista de Pokémon.
 * @param {number[]} favorites - IDs favoritos.
 * @param {boolean} loading - Estado de carregamento.
 * @param {string|null} error - Mensagem de erro.
 * @param {() => void} onRetry - Handler do botão de retry.
 * @param {(id: number) => void} onToggleFavorite - Alterna favorito.
 *
 * @returns {JSX.Element} Página com filtros, lista e estados.
 */
function PokemonListPage({
    pokemon,
    favorites,
    loading,
    error,
    onRetry,
    onToggleFavorite,
}) {
    const navigate = useNavigate(); // navegação programática
    const [params, setParams] = useSearchParams(); // ler/escrever query string

    const searchTerm = params.get("q") || "";
    const selectedType = params.get("type") || "all";

    const filteredPokemon = useMemo(() => {
        return pokemon.filter((poke) => {
            const matchesSearch = poke.name
                .toLowerCase()
                .includes(searchTerm.trim().toLowerCase());
            const matchesType =
                selectedType === "all" ||
                poke.types.some(
                    (typeInfo) => typeInfo.type.name === selectedType,
                );

            return matchesSearch && matchesType;
        });
    }, [pokemon, searchTerm, selectedType]);

    const resultsCount = filteredPokemon.length;

    function updateSearchTerm(nextValue) {
        // Mantém os outros parâmetros e atualiza só `q`.
        const nextParams = Object.fromEntries(params.entries());

        if (nextValue) {
            nextParams.q = nextValue;
        } else {
            delete nextParams.q;
        }

        setParams(nextParams, { replace: true });
    }

    function updateType(nextType) {
        // Mantém os outros parâmetros e atualiza só `type`.
        const nextParams = Object.fromEntries(params.entries());

        if (nextType && nextType !== "all") {
            nextParams.type = nextType;
        } else {
            delete nextParams.type;
        }

        setParams(nextParams);
    }

    function handlePokemonClick(pokemonItem) {
        // Mantém a query string para voltar com os filtros ativos.
        const queryString = params.toString();
        const path = queryString
            ? `/pokemon/${pokemonItem.id}?${queryString}`
            : `/pokemon/${pokemonItem.id}`;
        navigate(path);
    }

    // A renderização começa no próximo bloco.
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: mostramos controlos ligados à query string e a lista de resultados,
    // com estados visuais para loading, erro e vazio.
    // Programação: Fragment para agrupar secções, condicionais com && para estados,
    // e .map() para transformar o array filtrado em cards com props e keys.
    return (
```

Até aqui ligaste a query string aos filtros e garantiste que a navegação
para detalhes preserva `q` e `type`. A seguir vais renderizar a UI da lista,
com os estados de loading/erro/vazio.

#### 13.1.2) Parte B - JSX (dentro do return)

```jsx
        <>
            <section className="pokedex__controls">
                <SearchBar value={searchTerm} onChange={updateSearchTerm} />
                <TypeFilter
                    selectedType={selectedType}
                    onTypeChange={updateType}
                />
            </section>

            <section className="pokedex__results">
                {loading && <LoadingSpinner />}
                {error && <ErrorMessage message={error} onRetry={onRetry} />}

                {!loading && !error && resultsCount === 0 && (
                    <p className="pokedex__empty">
                        Nenhum Pokémon encontrado. Ajusta a pesquisa ou o filtro
                        de tipo.
                    </p>
                )}

                {!loading && !error && resultsCount > 0 && (
                    <div className="pokedex__grid">
                        {filteredPokemon.map((poke) => (
                            <PokemonCard
                                key={poke.id}
                                pokemon={poke}
                                isFavorite={favorites.includes(poke.id)}
                                onToggleFavorite={onToggleFavorite}
                                onClick={handlePokemonClick}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}

export default PokemonListPage;
```

### 13.2) Atualizar o `Layout` para reativar os contadores

Este bloco **SUBSTITUI** o `Layout.jsx` da fase 2.
Agora o hero usa dados reais e contadores baseados nos filtros da URL.

```jsx
import { NavLink, Outlet, useSearchParams } from "react-router-dom";

const POKEMON_LIMIT = 151;

/**
 * ============================================
 * Layout
 * ============================================
 *
 * Descrição: Moldura base da app com hero, contadores e navegação.
 *
 * CONCEITOS APLICADOS:
 * - Layout route + Outlet
 * - NavLink com estado ativo
 * - Leitura da query string para contadores
 *
 * NOTAS PEDAGÓGICAS:
 * - Os contadores usam a mesma lógica de filtro da lista.
 * - `end` no NavLink evita o match por prefixo.
 *
 * Props:
 * @param {Array} pokemon - Lista completa de Pokémon.
 * @param {number[]} favorites - IDs favoritos.
 * @param {number} totalCount - Total esperado (fallback).
 *
 * @returns {JSX.Element} Layout principal com hero e navegação.
 */
function Layout({ pokemon = [], favorites = [], totalCount = POKEMON_LIMIT }) {
    const [params] = useSearchParams(); // ler query string atual
    const searchTerm = params.get("q") || "";
    const selectedType = params.get("type") || "all";

    const filteredCount = pokemon.filter((poke) => {
        const matchesSearch = poke.name
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());
        const matchesType =
            selectedType === "all" ||
            poke.types.some((typeInfo) => typeInfo.type.name === selectedType);

        return matchesSearch && matchesType;
    }).length;

    const favoritesCount = favorites.length;
    const heroTotal = pokemon.length || totalCount;

    const queryString = params.toString();
    const listTo = queryString ? `/?${queryString}` : "/";
    const favoritesTo = queryString
        ? `/favoritos?${queryString}`
        : "/favoritos";
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: o Layout mostra o hero com contadores calculados (total, favoritos,
    // resultados filtrados) e uma navegação que preserva a query string.
    // Programação: usamos valores derivados (heroTotal/favoritesCount/filteredCount),
    // <NavLink> com classe/estilos inline para estado ativo e <Outlet /> para a rota filha.
    return (
        <div className="pokedex">
            <header className="pokedex__hero">
                <div>
                    <h1 className="pokedex__hero-title">Pokédex Digital</h1>
                    <p className="pokedex__hero-subtitle">
                        Descobre e explora os 151 Pokémon originais
                    </p>
                    <div className="pokedex__hero-stats">
                        <div className="pokedex__hero-stat">
                            Total de Pokémon
                            <strong>{heroTotal}</strong>
                        </div>
                        <div className="pokedex__hero-stat">
                            Favoritos
                            <strong>{favoritesCount}</strong>
                        </div>
                        <div className="pokedex__hero-stat">
                            Resultados filtrados
                            <strong>{filteredCount}</strong>
                        </div>
                    </div>
                </div>
                <div className="pokedex__hero-pokeball" aria-hidden="true" />
            </header>

            <nav className="type-filter" aria-label="Navegação principal">
                <span className="type-filter__label">Navegação</span>
                <div className="type-filter__buttons">
                    <NavLink
                        to={listTo}
                        end
                        className={({ isActive }) =>
                            `type-filter__button${isActive ? " active" : ""}`
                        }
                        style={({ isActive }) => ({
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isActive
                                ? "var(--primary)"
                                : "var(--bg-surface)",
                            border: isActive
                                ? "3px solid var(--primary)"
                                : "3px solid var(--border)",
                            color: isActive ? "#fff" : "var(--text-dark)",
                        })}
                    >
                        Lista
                    </NavLink>
                    <NavLink
                        to={favoritesTo}
                        className={({ isActive }) =>
                            `type-filter__button${isActive ? " active" : ""}`
                        }
                        style={({ isActive }) => ({
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isActive
                                ? "var(--primary)"
                                : "var(--bg-surface)",
                            border: isActive
                                ? "3px solid var(--primary)"
                                : "3px solid var(--border)",
                            color: isActive ? "#fff" : "var(--text-dark)",
                        })}
                    >
                        Favoritos
                    </NavLink>
                </div>
            </nav>

            <Outlet />
        </div>
    );
}

export default Layout;
```

### 13.3) Atualizar `src/App.jsx` para passar dados ao Layout

Este bloco **SUBSTITUI** o `App.jsx` da fase 4.
Passamos os dados ao `Layout` para atualizar os contadores.
Isto é feito ao passar `pokemon` e `favorites` como props do `Layout`, para
que o hero consiga calcular **total**, **favoritos** e **filtrados**.
Aqui o `Layout` recebe dados apenas para mostrar contadores; em apps maiores,
uma alternativa comum é Context/Store.

### 13.3.1) Parte A - Fica igual (lógica: estado e efeitos)

```jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout.jsx";
import PokemonListPage from "@/components/PokemonListPage.jsx";
import PokemonDetailsPage from "@/components/PokemonDetailsPage.jsx";
import { fetchPokemonList } from "@/services/pokeApi.js";

const POKEMON_LIMIT = 151;
const FAVORITES_KEY = "pokemonFavorites"; // Mantém a mesma key da Ficha 3

/**
 * ============================================
 * App
 * ============================================
 *
 * Descrição: Componente raiz com estado global e rotas.
 *
 * CONCEITOS APLICADOS:
 * - useEffect para carregar dados externos
 * - useState para estado global
 * - Rotas com React Router
 * - localStorage para persistência
 *
 * NOTAS PEDAGÓGICAS:
 * - Mantém o estado global aqui, não nas páginas.
 * - Evita duplicação de estado entre páginas.
 *
 * @returns {JSX.Element} Aplicação completa.
 */
function App() {
    const [pokemon, setPokemon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);

    async function loadPokemonList() {
        setLoading(true);
        setError(null);
        try {
            const detailedPokemon = await fetchPokemonList(POKEMON_LIMIT);
            setPokemon(detailedPokemon);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPokemonList();
    }, []);

    useEffect(() => {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }, [favorites]);

    function toggleFavorite(id) {
        setFavorites((prev) => {
            if (prev.includes(id)) {
                return prev.filter((favId) => favId !== id);
            }
            return [...prev, id];
        });
    }

    function handleRetry() {
        loadPokemonList();
    }

    // A renderização começa no próximo bloco.
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: devolvemos o Router com Layout a receber dados (para contadores e links)
    // e páginas ligadas às rotas principais (lista e detalhe).
    // Programação: o Layout é a rota pai; as rotas filhas usam element com props
    // para renderizar a lista com filtros e o detalhe com base no id da URL.
    return (
```

Até aqui tens o estado global (dados, loading/erro, favoritos).  
O que muda a seguir é **a renderização via Router**: passamos dados ao
`Layout` e ligamos as páginas às rotas.

### 13.3.2) Parte B - Muda (renderização via Router)

```jsx
        <Routes>
            {/* Rota pai com Layout (moldura fixa). */}
            <Route
                path="/"
                element={
                    <Layout
                        pokemon={pokemon}
                        favorites={favorites}
                        totalCount={POKEMON_LIMIT}
                    />
                }
            >
                {/* Rota filha index = "/". */}
                <Route
                    index
                    element={
                        <PokemonListPage
                            pokemon={pokemon}
                            favorites={favorites}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                            onToggleFavorite={toggleFavorite}
                        />
                    }
                />
                <Route
                    path="pokemon/:id"
                    element={
                        /* Rota dinâmica para detalhes. */
                        <PokemonDetailsPage
                            pokemon={pokemon}
                            favorites={favorites}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                            onToggleFavorite={toggleFavorite}
                        />
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
```

### Erros comuns

- Esquecer `params.get("q") || ""` e lidar com `null`.
- Guardar `type=all` e depois filtrar como se fosse um tipo real.
- Comparar `selectedType` com número (é sempre string).
- Abrir detalhes sem anexar a query string e perder filtros no “Voltar”.

### Como depurar

- Abre `/?q=pi&type=fire` e confirma o filtro.
- `console.log(params.toString())` para ver a query atual.

### Checkpoint

- Filtros continuam após refresh?
- Os contadores do hero refletem os filtros?

**Checkpoint visual**

- A URL mostra `?q=...&type=...` e a lista fica filtrada.

---

## 14) Fase 6 - FavoritesPage e rota 404

### Ponto da situação

- Já tens lista, detalhes e filtros na URL.
- Falta fechar a navegação completa:
    - rota real para favoritos
    - fallback 404

### O que vamos fazer

- Criar `FavoritesPage` para mostrar apenas favoritos.
- Criar `NotFound` e a rota `*`.

### Como vamos fazer

1. Implementar `FavoritesPage` com o mesmo grid.
2. Implementar `NotFound` com `Link`.
3. No `App`, adicionar:
    - `path="favoritos"`
    - `path="*"` no fim.

### Conceitos adjacentes

- A rota `*` tem de ficar no fim, senão “apanha” tudo.

### Observações

Depois de lista e detalhes, falta fechar o circuito: favoritos e 404.
O Router garante que **todas** as rotas válidas estão cobertas e que o
fallback aparece quando a rota não existe.

**Reutilização:** a lista de favoritos usa o mesmo `PokemonCard` e o mesmo grid.
Se entrares diretamente em `/favoritos`, usa os mesmos estados de loading/erro
da Ficha 3 para evitar mensagens incorretas.

### 14.1) `src/components/FavoritesPage.jsx`

```jsx
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorMessage from "@/components/ErrorMessage.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import PokemonCard from "@/components/PokemonCard.jsx";

/**
 * ============================================
 * FavoritesPage
 * ============================================
 *
 * Descrição: Página que lista apenas favoritos.
 *
 * CONCEITOS APLICADOS:
 * - Filtros por estado global (favorites)
 * - Renderização condicional (lista vazia)
 *
 * NOTAS PEDAGÓGICAS:
 * - Reutiliza o mesmo card e grid da lista principal.
 * - Usa LoadingSpinner/ErrorMessage para evitar estados vazios falsos.
 *
 * Props:
 * @param {Array} pokemon - Lista completa de Pokémon.
 * @param {number[]} favorites - IDs favoritos.
 * @param {(id: number) => void} onToggleFavorite - Alterna favorito.
 * @param {boolean} loading - Estado de carregamento.
 * @param {string|null} error - Mensagem de erro.
 * @param {() => void} onRetry - Handler do botão de retry.
 *
 * @returns {JSX.Element} Página de favoritos.
 */
function FavoritesPage({
    pokemon,
    favorites,
    onToggleFavorite,
    loading,
    error,
    onRetry,
}) {
    const navigate = useNavigate(); // navegação programática
    const [params] = useSearchParams(); // ler query string atual

    if (loading) {
        // --- EXPLICAÇÃO DO RETURN ---
        // Conceito: enquanto os dados ainda estão a carregar, mostramos feedback ao utilizador.
        // Programação: fazemos um early return (saída antecipada) para terminar o componente aqui e evitar renderizar JSX dependente de dados.
        return <LoadingSpinner />;
    }

    if (error) {
        // --- EXPLICAÇÃO DO RETURN ---
        // Conceito: quando há erro no carregamento, mostramos a mensagem e um botão de tentar novamente.
        // Programação: devolvemos <ErrorMessage .../> e passamos a prop onRetry para o componente conseguir chamar o handler do 'pai'.
        return <ErrorMessage message={error} onRetry={onRetry} />;
    }

    const favoritesList = pokemon.filter((poke) => favorites.includes(poke.id));

    if (favoritesList.length === 0) {
        // --- EXPLICAÇÃO DO RETURN ---
        // Conceito: quando não há dados válidos (ex.: id não existe, ou lista vazia), mostramos um estado vazio claro.
        // Programação: devolvemos um elemento JSX simples (<p>) e terminamos o componente imediatamente (early return).
        return <p className="pokedex__empty">Ainda não tens favoritos.</p>;
    }

    function handlePokemonClick(pokemonItem) {
        const queryString = params.toString();
        const path = queryString
            ? `/pokemon/${pokemonItem.id}?${queryString}`
            : `/pokemon/${pokemonItem.id}`;
        navigate(path);
    }
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: este return mostra a grelha (lista) de Pokémon.
    // Programação: usamos .map() para transformar cada item do array `pokemon` num <PokemonCard>.
    // A prop key={poke.id} dá ao React uma chave estável para gerir a lista; favorites.includes(poke.id) decide o estado de favorito.
    // Passamos callbacks via props (onToggleFavorite/onClick) para o card poder comunicar ações de volta ao “pai”.

    return (
        <section className="pokedex__results">
            <div className="pokedex__grid">
                {favoritesList.map((poke) => (
                    <PokemonCard
                        key={poke.id}
                        pokemon={poke}
                        isFavorite
                        onToggleFavorite={onToggleFavorite}
                        onClick={handlePokemonClick}
                    />
                ))}
            </div>
        </section>
    );
}

export default FavoritesPage;
```

### 14.2) `src/components/NotFound.jsx`

```jsx
import { Link } from "react-router-dom";

/**
 * ============================================
 * NotFound
 * ============================================
 *
 * Descrição: Página 404 simples.
 *
 * CONCEITOS APLICADOS:
 * - Rota fallback
 * - Link para voltar à lista
 *
 * NOTAS PEDAGÓGICAS:
 * - A rota `*` deve ficar no fim.
 *
 * @returns {JSX.Element} Página 404.
 */
function NotFound() {
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: este return mostra o estado 404 e dá um caminho claro para voltar à lista.
    // Programação: usamos <Link> do Router para navegar sem reload da página.
    return (
        <p className="pokedex__empty">
            Página não encontrada. <Link to="/">Voltar à lista</Link>
        </p>
    );
}

export default NotFound;
```

### 14.3) Atualizar `src/App.jsx` (versão final)

Este bloco **SUBSTITUI** o `App.jsx` da fase 5.
É aqui que entram a rota de favoritos e a 404.
Adicionamos a rota `/favoritos` e o fallback `*`, mantendo o mesmo estado global.

### 14.3.1) Parte A - Fica igual (lógica: estado e efeitos)

```jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout.jsx";
import PokemonListPage from "@/components/PokemonListPage.jsx";
import PokemonDetailsPage from "@/components/PokemonDetailsPage.jsx";
import FavoritesPage from "@/components/FavoritesPage.jsx";
import NotFound from "@/components/NotFound.jsx";
import { fetchPokemonList } from "@/services/pokeApi.js";

const POKEMON_LIMIT = 151;
const FAVORITES_KEY = "pokemonFavorites"; // Mantém a mesma key da Ficha 3

function App() {
    const [pokemon, setPokemon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);

    async function loadPokemonList() {
        setLoading(true);
        setError(null);
        try {
            const detailedPokemon = await fetchPokemonList(POKEMON_LIMIT);
            setPokemon(detailedPokemon);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Erro desconhecido";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPokemonList();
    }, []);

    useEffect(() => {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }, [favorites]);

    function toggleFavorite(id) {
        setFavorites((prev) => {
            if (prev.includes(id)) {
                return prev.filter((favId) => favId !== id);
            }
            return [...prev, id];
        });
    }

    function handleRetry() {
        loadPokemonList();
    }

    // A renderização começa no próximo bloco.
    // --- EXPLICAÇÃO DO RETURN ---
    // Conceito: no return final do App, ligamos todas as páginas (lista, detalhe,
    // favoritos) e o fallback 404 dentro do Layout.
    // Programação: cada rota recebe um element com props necessárias e a rota "*"
    // captura URLs inválidas, devolvendo o componente NotFound.
    return (
```

O estado continua igual ao das fases anteriores.  
O que muda a seguir é **a renderização via Router**: adicionamos a rota de
favoritos e o fallback 404.

### 14.3.2) Parte B - Muda (rotas: favoritos + 404)

```jsx
        <Routes>
            {/* Rota pai com Layout (moldura fixa). */}
            <Route
                path="/"
                element={
                    <Layout
                        pokemon={pokemon}
                        favorites={favorites}
                        totalCount={POKEMON_LIMIT}
                    />
                }
            >
                {/* Rota filha index = "/". */}
                <Route
                    index
                    element={
                        <PokemonListPage
                            pokemon={pokemon}
                            favorites={favorites}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                            onToggleFavorite={toggleFavorite}
                        />
                    }
                />
                <Route
                    path="pokemon/:id"
                    element={
                        /* Rota dinâmica para detalhes. */
                        <PokemonDetailsPage
                            pokemon={pokemon}
                            favorites={favorites}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                            onToggleFavorite={toggleFavorite}
                        />
                    }
                />
                <Route
                    path="favoritos"
                    element={
                        /* Rota estática para favoritos. */
                        <FavoritesPage
                            pokemon={pokemon}
                            favorites={favorites}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                            onToggleFavorite={toggleFavorite}
                        />
                    }
                />
                {/* Fallback 404: fica sempre no fim. */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
```

### Erros comuns

- Colocar a rota `*` no meio e “apanhar” tudo.
- Esquecer o `path="favoritos"` e ter link a apontar para 404.
- Não passar `pokemon`/`favorites` para a `FavoritesPage`.

### Como depurar

- Abre `/abc` e confirma a 404.
- Abre `/favoritos` e confirma a lista.

### Checkpoint

- A app mantém o visual da Ficha 3?
- Favoritos persistem após refresh?

**Checkpoint visual**

- Em `/favoritos`, vês apenas os Pokémon favoritos.
- Em `/abc`, vês a página 404.

---

## 15) Checkpoints rápidos por fase

- **Fase 1:** Router OK aparece.
- **Fase 2:** Layout com hero + navegação + `Outlet` funciona.
- **Fase 2.5:** App igual à Ficha 3, mas dentro de rotas (`Route index`).
- **Fase 3:** Lista renderiza dentro do layout.
- **Fase 4:** `/pokemon/1` abre detalhe real (comportamento igual à Ficha 3).
- **Fase 5:** `?q=pi&type=fire` filtra e mantém após refresh.
- **Fase 6:** `/favoritos` funciona e `*` mostra 404.

---

## 16) Estrutura final (check rápido)

```
src/
  App.jsx
  main.jsx
  styles/
  services/
  components/
```

---

## 17) Executar o projeto

```bash
npm run dev
```

---

**Testes manuais mínimos**

1. `/` abre a lista.
2. Clicar num card abre `/pokemon/:id`.
3. O botão “Voltar” regressa à lista.
4. `/favoritos` mostra só favoritos.
5. `/abc` mostra 404.
6. `?q=pi` filtra resultados.
7. `type=fire` filtra por tipo.
8. Refresh mantém a rota e os filtros.

## 18) Checklist final

- [ ] React Router instalado e configurado
- [ ] Rotas `/`, `/pokemon/:id`, `/favoritos`, `*`
- [ ] Pesquisa e filtros a funcionar
- [ ] Query string atualiza
- [ ] Favoritos com `localStorage`
- [ ] Loading, erro e vazio (com UI da Ficha 3)

### 18.1) Ponte para a Ficha 5 (transição de estrutura)

Na próxima ficha, a app passa de "um projeto só" para "frontend + backend".

- Ficha 4 (agora): `pokedex-v2/src/...`
- Ficha 5 (depois): `pokedex-v3/frontend/src/...` + `pokedex-v3/backend/...`

Importante: o conteúdo do `src/` do frontend mantém-se praticamente igual.
Nesta transição, o que muda primeiro é a **pasta mãe** (`frontend/`), não a lógica das páginas.

---

## 19) Resumo de erros comuns

- Esquecer o `BrowserRouter` e ver erros ao usar `Link`/`Routes`.
- Esquecer o `<Outlet />` no `Layout` e a rota filha não aparece.
- Esquecer o `end` no `NavLink` da lista e ele ficar ativo em todas as rotas.
- Comparar `id` como número sem converter (`useParams` devolve string).
- Duplicar blocos `filtered` ao copiar fases.
- Esquecer `params.get("q") || ""` e lidar com `null`.
- Guardar `type=all` e depois tratar como tipo real.
- Colocar a rota `*` no meio e “apanhar” tudo.

**Checklist de depuração do Router (5 passos)**

1. `BrowserRouter` está a envolver o `App`?
2. O `Layout` tem `<Outlet />`?
3. A rota filha usa `path` **relativo** (sem `/`)?
4. `useParams()` está a ser convertido com `Number(id)`?
5. A rota `*` está **no fim**?

---

Fim.

![Footer](../../Images/Footer.png)
