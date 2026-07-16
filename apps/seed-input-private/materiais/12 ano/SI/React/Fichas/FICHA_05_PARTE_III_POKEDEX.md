![Header](../../Images/Header.png)

# Tutorial passo a passo - Pokédex v3 com Backend + Context (Tutorial 02 - Parte 3) (12.º ano)

Este tutorial **continua diretamente a Ficha 4**.
A app mantém o Router, as páginas e a experiência do utilizador.

O que muda nesta ficha é a **arquitetura**:

- Passamos os **favoritos** para um **backend Node.js + Express** (API própria)
- Passamos o estado principal para **Context API** (estado global limpo)

> Nesta ficha **não estamos a inventar novas features**.
> Estamos a tornar o projeto mais “real” e mais fácil de manter.
> Vamos basicamente refatorar a app para algo mais profissional.

---

## 0) O que vais construir

### 0.1) Ponto da situação (Ficha 4)

- SPA com React Router (`/`, `/pokemon/:id`, `/favoritos`, `*`).
- Lista com pesquisa/filtros.
- Favoritos guardados no browser.

> Nota: Um SPA é uma Single Page Application - uma app que corre toda no browser, sem recarregar páginas.

### 0.2) Objetivos desta ficha

1. **Backend**

- Criar uma API simples que guarda favoritos.
- Sem base de dados (por agora), só memória.

2. **Context**

- Tirar estado do `App.jsx`.
- Criar um `PokedexProvider` que fornece dados e ações às páginas.

### 0.3) O que fica exatamente igual

- Rotas e navegação.
- Componentes visuais (cards, header, etc.).
- Lógica geral: marcar/desmarcar favorito, mostrar favoritos.

### 0.4) Checkpoint final (como sabes que acabaste)

- O frontend abre e funciona como antes.
- Ao marcar um favorito, ele fica guardado no backend.
- Ao fazer refresh, continua favorito.
- Ao reiniciar o backend, volta ao array inicial (porque é memória).

**⚠️ Memória reseta - isto é normal**

Nesta ficha, os favoritos vivem em memória. Ao reiniciar o backend, voltam ao estado inicial.

Numa aplicação real, usarias uma base de dados para guardar favoritos permanentemente.

### 0.5) Mapa mental

Durante o desenvolvimento, vais ter dois servidores a correr:

- Frontend (Vite) → `http://localhost:5173`
- Backend (Express) → `http://localhost:3000`

**Fluxo de dados (sempre o mesmo):**

```
UI (clique) → Context (ação) → Service (fetch) → API (Express)
→ resposta (status+JSON) → Context (setState) → UI (re-render)
```

**Regra:**

1. Ligas o **backend** primeiro.
2. Só depois ligas o **frontend**.

Se o backend não estiver ligado, o frontend vai falhar com erro de rede.

**Como testar**

- Backend: abre `http://localhost:3000/api/favorites` (deves ver JSON).
- Frontend: abre `http://localhost:5173` (deves ver a UI).

**Vocabulário rápido**

- **API**: conjunto de endpoints que o frontend chama.
- **Service**: ficheiro que faz `fetch` para a API.
- **Provider (Context)**: componente que guarda estado global.

**Debug rápido para toda a ficha**

1. Backend ligado em `http://localhost:3000`?
2. Frontend ligado em `http://localhost:5173`?
3. Console mostra erros de CORS?
4. Network mostra `GET /api/favorites`?
5. `package.json` do backend tem `"type": "module"`?

**Pontos de paragem**

- **Paragem A**: backend responde ao `GET /api/favorites`.
- **Paragem B**: frontend abre sem erros de rede.
- **Paragem C**: Context ligado e páginas consomem `usePokedex()`.
- **Paragem D**: favoritos persistem via backend.

---

## 1) Pré-requisitos e ambiente

### 1.1) Vais ter dois terminais sempre

- **Terminal A**: backend Express (porta 3000)
- **Terminal B**: frontend Vite (porta 5173)

**Ordem recomendada:** primeiro Terminal A (backend), depois Terminal B (frontend).

**Se te perderes nas pastas:**

```bash
pwd
ls
```

Isto diz-te onde estás e o que existe nessa pasta.

### 1.1.1) Processo de arranque

1. **Terminal A (backend)**

```bash
cd backend
node src/server.js
```

2. **Terminal B (frontend)**

```bash
cd frontend
npm run dev
```

3. **Confirmações rápidas**

- Terminal A mostra `API a correr em http://localhost:3000`
- Browser abre `http://localhost:3000/api/favorites` e devolve JSON
- Browser abre `http://localhost:5173` e mostra a app

### 1.2) Confirma Node e npm

```bash
node -v
npm -v
```

### 1.3) Se algo falhar logo aqui

- **Porta ocupada** (`EADDRINUSE`) → tens outro servidor ligado.
- **Erro de imports** no Node → falta `"type": "module"`.
    - Erro típico: `ReferenceError: require is not defined in ES module scope`

### 1.4) Erros comuns e causa provável

| Sintoma                               | Causa provável                         | Onde ver          |
| ------------------------------------- | -------------------------------------- | ----------------- |
| Frontend abre mas nada carrega        | Backend desligado                      | Terminal A        |
| `GET /api/favorites` falha no browser | CORS ou URL errado                     | Console + Network |
| Erro `require is not defined`         | Falta `"type": "module"` no backend    | Terminal A        |
| `fetch` dá erro de rede               | Porta errada ou backend não iniciado   | Console           |
| `POST`/`DELETE` não funcionam         | API não está a responder / rota errada | Network           |

---

## 2) Criar a v3 (cópia da v2)

Objetivo: pegar no código final da Ficha 4 e reorganizar para um projeto com duas pastas.

Copia a pasta do projeto da Ficha 4 para uma nova pasta chamada, por exemplo, pokedex-v3.

Dentro de pokedex-v3, cria duas pastas:

frontend

backend

Move todo o projeto Vite da Ficha 4 para dentro de frontend/.

> Dica rápida: se te perderes no terminal, usa `pwd` para ver onde estás.
> Para subir uma pasta, usa `cd ..`.

### 2.1) Ponte Ficha 4 -> Ficha 5

Na Ficha 4, o projeto **já tinha `src/`** (como qualquer projeto Vite).
Na Ficha 5, isso **não desaparece**: apenas fica "um nível mais fundo".

- Antes (Ficha 4): `pokedex-v2/src/...`
- Agora (Ficha 5): `pokedex-v3/frontend/src/...`

Ou seja:

- `src/App.jsx` vira `frontend/src/App.jsx`
- `src/main.jsx` vira `frontend/src/main.jsx`
- `src/components/...` vira `frontend/src/components/...`
- `src/services/...` vira `frontend/src/services/...`

Nada muda dentro de `src/` nesta fase: só muda a pasta "mãe" do frontend.

### 2.2) Check rápido de orientação

No terminal, confirma:

```bash
pwd
ls
ls frontend
ls frontend/src
```

Se o `ls frontend/src` mostrar `App.jsx`, `main.jsx`, `components/` e `services/`, está tudo no sítio certo.

### 2.3) Mapa de pastas

- Backend: `pokedex-v3/backend/src/...`
- Frontend: `pokedex-v3/frontend/src/...`

Exemplos que vais usar várias vezes:

- `pokedex-v3/frontend/src/main.jsx`
- `pokedex-v3/frontend/src/context/PokedexContext.jsx`
- `pokedex-v3/backend/src/routes/favorites.routes.js`

---

## 3) Estrutura final esperada

```txt
pokedex-v3/
  backend/
    src/
      server.js
      app.js
      routes/
        favorites.routes.js
    package.json
  frontend/
    src/
      App.jsx
      main.jsx
      context/
        PokedexContext.jsx
      services/
        pokeApi.js
        favoritesApi.js
      styles/
        index.css
        pokedex.css
      components/
        ErrorMessage.jsx
        LoadingSpinner.jsx
        PokemonCard.jsx
        SearchBar.jsx
        TypeFilter.jsx
        typeData.js
        Layout.jsx
        PokemonListPage.jsx
        PokemonDetailsPage.jsx
        FavoritesPage.jsx
        NotFound.jsx
    package.json
    vite.config.js
```

> Nota: A partir daqui, tudo o que é React/Vite está em `frontend/` e tudo o que é Express/API está em `backend/`.
> Nesta ficha **mantemos as páginas dentro de `components/`**, tal como na Ficha 4, para garantir compatibilidade direta.
> Se quiseres separar `pages/`, faz isso **no fim** e atualiza os imports/rotas.
> Convenção desta ficha: quando aparecer `src/...` no frontend, lê como `frontend/src/...`.

### Instalação e arranque

- No terminal A (backend):

```bash
cd backend
npm init -y
npm install express cors
npm install -D nodemon
```

- No terminal B (frontend):

```bash
cd frontend
npm install
npm run dev
```

> Nota: Se precisares de andar para trás e para a frente entre as pastas, usa `cd ..` para subir um nível (ou seja andar para trás).

> Exemplo, se estiveres em `pokedex-v3/frontend` e quiseres ir para `pokedex-v3/backend`:

```bash
cd ..
cd backend
```

### Porque isto é uma estrutura boa

- Separa “UI” de “dados”.
- Ajuda-te a navegar no projeto.
- Prepara a transição para MongoDB (em vez de arrays).

---

## 4) Conceitos essenciais

### 4.1) Cliente ↔ Servidor

#### Contexto extra (definições mais detalhadas)

Quando dizemos “cliente” e “servidor”, estamos a falar de **dois programas** (dois processos) a correr em sítios diferentes e a comunicar por rede.

- **Cliente (browser)**: é o programa onde corre a tua app React.  
  O browser descarrega o teu JavaScript e executa-o no computador/telemóvel do utilizador.  
  O React é responsável por **renderizar UI**, reagir a eventos (cliques, inputs) e pedir dados ao servidor quando precisa.

- **Servidor (Node.js + Express)**: é um programa a correr (normalmente) noutra máquina, ou no teu PC durante o desenvolvimento.  
  O servidor está “à escuta” numa **porta** (ex.: 3000) e responde a pedidos.

A comunicação entre os dois é feita por **HTTP (HyperText Transfer Protocol)**.

#### Como é um pedido HTTP (request)?

Um pedido HTTP tem, em termos simples:

- **Método**: GET / POST / DELETE… (o “que queres fazer”)
- **URL**: o caminho do recurso (ex.: `/api/favorites/7`)
- **Headers**: metadados (ex.: `Content-Type: application/json`)
- **Body** (opcional): dados enviados (muito comum em POST)

#### Como é uma resposta HTTP (response)?

A resposta tem:

- **Status code**: 200/404/422… (o “resultado” do pedido)
- **Headers**
- **Body**: normalmente JSON com dados ou com informação de erro

#### Exemplo (favoritar um Pokémon)

Imagina que o utilizador clica num ❤️:

1. **React (cliente)** faz um pedido HTTP: `POST /api/favorites` com body `{ "id": 7 }`.
2. **Express (servidor)** recebe o pedido, valida o `id`, decide se pode adicionar, atualiza a lista e devolve:
    - status `201`
    - body `{ "id": 7 }`
3. **React** recebe a resposta e atualiza o estado (Context) → a UI muda.

Isto é um ciclo básico cliente-servidor.

#### Porque é assíncrono?

No browser, quando fazes `fetch(...)`, o JavaScript **não bloqueia**. Em vez disso:

- o `fetch` devolve logo uma **Promise**
- mais tarde, quando a resposta chega, a Promise “resolve”
- com `await`, tu escreves de forma mais “linear”, mas por baixo continua assíncrono

#### Porque é que precisamos de backend?

O React corre no browser, portanto:

- pode guardar coisas localmente (ex.: `localStorage`), mas isso fica **apenas naquele browser**
- não é uma fonte única e central de dados
- não é seguro confiar em regras “só no cliente” (mais tarde: auth/permissões)

Quando queres:

- dados partilhados
- regras centralizadas (validação, duplicados, etc.)
- uma fonte de verdade “a sério”
  … precisas de backend.

```txt
React (browser) ──fetch──▶ Express (server) ──▶ responde JSON
```

#### Fluxo mental

```txt
UI (clique) → Context (ação) → Service (fetch) → API (Express)
→ resposta (status+JSON) → Context (setState) → React (re-render)
```

---

A arquitetura típica de apps web:
-> Servidor: Processa pedidos, guarda dados, aplica regras, fornece dados.
Stack típica: Node.js + Express + Base de Dados.
-> Cliente: Mostra UI, interage com o utilizador, faz pedidos ao servidor.
Stack típica: React + React Router + Context API.

Sempre que há comunicação entre cliente e servidor, é via HTTP (HyperText Transfer Protocol).
Imagina que o utilizador clica num ❤️ para favoritar um Pokémon:

1. O React (cliente) faz um pedido HTTP `POST /api/favorites` ao servidor.
2. O Express (servidor) recebe o pedido, processa-o, comunica com o controlador correspondente, atualiza os dados e devolve uma resposta HTTP (normalmente em JSON).
3. O React recebe a resposta e atualiza a UI em conformidade.

Isto é um ciclo básico de comunicação cliente-servidor. E, por norma, é assíncrono: o cliente não bloqueia enquanto espera pela resposta do servidor. Do lado do cliente, usas `fetch` ou bibliotecas como Axios para fazer estes pedidos HTTP. E ao fazê-lo, crias uma promessa que será resolvida quando o servidor responder.

Além disso o React corre no browser, o que significa que só consegue guardar dados localmente.
Quando queres dados partilhados e regras centralizadas, precisas de backend.

```txt
React (browser) ──fetch──▶ Express (server) ──▶ responde JSON
```

### 4.2) Métodos HTTP

#### Contexto extra (definições mais detalhadas)

Os métodos HTTP dizem ao servidor **qual é a intenção** do pedido. Não são só nomes - ajudam a manter a API previsível.

- **GET** → _ler dados_  
  Regra: **não deve alterar** dados no servidor.  
  Normalmente não tem body. Pode ter query string (ex.: `?type=fire`), mesmo que nesta ficha não uses.

- **POST** → _criar/adicionar_  
  Normalmente tem body (JSON).  
  Quando corre bem, é comum devolver `201 Created`.

- **DELETE** → _remover_  
  Normalmente identifica o alvo no URL (ex.: `/:id`).  
  Em APIs simples, não precisas de body.

#### Extra: “idempotência” em linguagem simples

- **Idempotente**: repetir o mesmo pedido deixa o sistema no mesmo estado final.
    - `DELETE /favorites/7` repetido: a 2ª vez não há nada para remover (muitas APIs devolvem 404).
- `POST` muitas vezes **não é idempotente**:
    - `POST {id:7}` repetido: na 2ª vez tens duplicado → 409.

Isto ajuda-te a perceber porque existem erros como `409 Conflict`.

---

Métodos HTTP dizem ao servidor _o que queres fazer_.
O cliente faz o pedido com um método específico, o servidor interpreta esse método e age em conformidade.

- `GET` → pedir dados (não altera nada)
- `POST` → criar/ adicionar
- `DELETE` → remover

### 4.3) Status codes HTTP

#### Contexto extra (definições mais detalhadas)

Os status codes são números que o servidor devolve para o cliente perceber **rapidamente** o resultado:

- **2xx** → sucesso
- **4xx** → erro do cliente (pedido “mal feito”, inválido, ou não faz sentido)
- **5xx** → erro do servidor (o pedido podia ser válido, mas o servidor falhou)

Nesta ficha, o mais importante é ter uma lógica estável:

- `200 OK` → correu bem
- `201 Created` → criaste/adicionaste
- `400 Bad Request` → erro no URL/params (ex.: `/favorites/abc`)
- `404 Not Found` → não existe o recurso (ex.: apagar algo que não existe)
- `409 Conflict` → conflito (duplicado)
- `422 Unprocessable Entity` → body existe, mas falha validação (ex.: `{}`)

#### Diferença 400 vs 422

- `400` → problema no **caminho/param** (URL)
- `422` → problema nos **dados do body** (conteúdo)

#### Nota para o futuro (não é desta ficha)

Mais tarde vais ver:

- `401` (não autenticado)
- `403` (sem permissão)
  Aqui ainda não usamos autenticação.

---

Os status codes são números que o servidor envia na resposta HTTP para indicar o resultado do pedido.
O status diz ao frontend como interpretar a resposta:

Os status codes são essenciais para o frontend tomar decisões. Por exemplo, se o backend responder `409` ao adicionar um favorito, o frontend sabe que esse Pokémon já é favorito e pode mostrar uma mensagem apropriada.
Se der um `404` ao remover, o frontend pode avisar que o favorito não existe.

### 4.4) CORS (porque o browser bloqueia)

O CORS (Cross-Origin Resource Sharing) é um mecanismo de segurança do browser que controla como recursos são partilhados entre diferentes origens (domínios/portas).

O CORS existe por causa de uma regra do browser: **Same-Origin Policy**. Ou seja, um site só pode fazer pedidos ao mesmo domínio/porta de onde foi carregado, a não ser que o servidor diga explicitamente que aceita pedidos de outras origens.

**CORS**

- CORS é **regra do browser**, não do Node/Express.
- CORS **não** substitui autenticação nem segurança real.

#### O que é “origin”?

É:

- protocolo (`http`)
- hostname (`localhost`)
- porta (`5173`)

Logo:

- `http://localhost:5173` e `http://localhost:3000` são **origens diferentes**.

E isto faz com que o browser bloqueie pedidos entre elas, o que tornaria a nossa aplicação não funcional (se o frontend não conseguisse falar com o backend).
É aí que entra o CORS.
No backend, usamos o middleware `cors(...)` para adicionar os headers corretos que dizem ao browser:
-> “Sim, eu aceito pedidos vindos desta origem (frontend)”.

#### Porque é que o browser bloqueia?

Porque sem esta regra, um site malicioso poderia tentar ler/usar dados de outro site onde tu estás autenticado.

#### O que é o preflight `OPTIONS`?

Em certos pedidos, o browser faz primeiro um `OPTIONS` automático a perguntar ao servidor:

> “Aceitas este método e estes headers a partir desta origin?”

Isto acontece frequentemente com:

- `POST` com `Content-Type: application/json`
- `DELETE`
- headers não simples

O servidor tem de responder com headers como:

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`

Nesta ficha, o `cors(...)` trata disso por ti.

#### Debug rápido

- Se `curl` funciona mas o browser falha → problema de CORS.
- Na opção de Network no browser, é normal ver `OPTIONS` antes de `POST/DELETE`.

---

### 4.5) Contrato de API

#### Contexto extra

Um contrato de API é um **acordo** entre frontend e backend sobre:

- que endpoints existem (endpoint = URL + método por exemplo `POST /api/favorites`: Método é POST, URL é /api/favorites)
- que métodos usam
- que dados entram (params/body)
- que dados saem (JSON)
- que erros existem (status + shape)

Por exemplo, imagina que temos no frontend a ação de adicionar favorito. Essa ação envia um pedido `POST` ao backend com uma determinada informação (body) e espera uma resposta específica. Isto é a definição básica do contrato.
É o conjunto de regras e informação que ambos os lados concordam em seguir para cada endpoint.

#### Porque é que isto importa?

Porque evita “adivinhar” e reduz bugs de integração.

Se o backend mudar algo (ex.: deixar de aceitar `{id}` e passar a aceitar `{pokemonId}`), o frontend vai partir.
Com contrato, tu sabes exatamente o que foi mudado e onde mexer.

Equipas separadas que trabalham em frontend e backend dependem muito de contratos claros. Sem eles, a comunicação torna-se caótica e cheia de erros.

#### Formato uniforme de erros

É muito útil o backend devolver erros sempre no mesmo formato, por exemplo:

```json
{ "error": { "code": "...", "message": "...", "details": [] } }
```

Assim o frontend consegue tratar erros de forma uniforme, em vez de ter “ifs” por todo o lado.

---

Definimos exatamente:

- que endpoints existem
- que JSON entram/saem
- que erros podem acontecer

Contrato desta ficha:

| Ação          | Método | URL                  | Body          | Resposta      |
| ------------- | ------ | -------------------- | ------------- | ------------- |
| Ler favoritos | GET    | `/api/favorites`     | -             | `[1,4,25]`    |
| Adicionar     | POST   | `/api/favorites`     | `{ "id": 7 }` | `{ "id": 7 }` |
| Remover       | DELETE | `/api/favorites/:id` | -             | `{ "id": 7 }` |

### 4.6) Context API

#### Contexto extra

Context API é uma forma de ter um “canal” interno para partilhar dados **sem passar props por muitos níveis**.

#### O problema: prop drilling

Prop drilling é quando:

Imagina uma página com muitos níveis de componentes (componente dentro de componente dentro de componente).
Nessa página defines um estado no topo (ex.: `App`), mas quem precisa desse estado é um componente lá em baixo (ex.: `Card`).
O componente `card` é o bisneto do `App`. Todos os componentes entre eles **não precisam** desse estado.
No entanto, para chegar ao `card`, tens que passar o estado como props por todos os componentes intermédios.

Isto cria:

- ruído
- componentes “correio” que só passam props
- mais pontos onde podes falhar e mais possibilidades de bugs

#### A solução: Provider + consumo com hook

O Provider é um componente que "envolve" a tua app e cria um canal de dados global que é acessível a qualquer componente filho (ou de um nível mais profundo), sem necessidade de passar props manualmente.

- O **Provider** guarda estado e expõe ações.
- Os componentes filhos lêem estado/ações com `usePokedex()`.

Pensa no Provider como:

- “o cérebro” da app para dados globais
- e as páginas/componentes como “os olhos e as mãos” (UI)

#### Quando usar Context vs props?

Regra prática para alunos:

- **Props**: comunicação entre componentes próximos (pai→filho direto).
- **Context**: quando estás a passar props por 3–4 níveis, e os componentes do meio não precisam dos dados.

---

Na Ficha 4, tinhas algo do género:

- `App` tem estado `favorites`
- `App` passa `favorites` e `toggleFavorite` como props para `FavoritesPage` e `PokemonPage`
- Esses componentes passam para baixo até chegar a `Card`

Isto chama-se **prop drilling**.

Com Context:

- o Provider guarda estado num sítio só
- qualquer filho pode ler com `usePokedex()`

---

# PARTE A - BACKEND

## 5) Criar o backend Express

[Consultar documentação do Node.js e Express](../../Node/)

### 5.0) Mini-teoria: Express, middleware, CORS e ES Modules

A partir daqui vamos ter dois terminais:

- Terminal A: backend Express (porta 3000 (normalmente))
- Terminal B: frontend Vite (porta 5173 (normalmente))

Ou seja, vamos ter duas aplicações a correr em paralelo.

**Onde estou? (orientação de pastas)**

- `pwd` → mostra onde estás
- `ls` → lista o que existe
- `cd ..` → sobe uma pasta

Regra: vais instalar dependências **em `backend/` e em `frontend/`**.

---

#### O que estamos a construir aqui

Nesta Parte A, o objetivo é criar uma **API HTTP** (um servidor) que:

- fica a “ouvir” pedidos numa porta (ex.: `3000`)
- recebe pedidos do frontend (`5173`)
- responde com **JSON**
- tem rotas para favoritos (GET/POST/DELETE)

> Pensa nisto como: “em vez do React guardar favoritos só no browser, agora existe um servidor central que diz quais são os favoritos”.

---

#### 1) O que é um servidor HTTP

Um servidor HTTP é um programa que faz basicamente isto:

1. **Abre uma porta** (ex.: 3000) e fica à escuta.
2. Quando chega um pedido (request), ele lê:
    - método (GET/POST/DELETE)
    - caminho/URL (ex.: `/api/favorites/7`)
    - headers
    - body (se existir)

3. Decide o que fazer e devolve uma resposta (response):
    - status code (ex.: 200/404/422)
    - headers
    - body (normalmente JSON)

Uma imagem mental útil:

```txt
Cliente (browser) ── request HTTP ─▶ Servidor (Node)
Cliente (browser) ◀─ response HTTP ── Servidor (Node)
```

---

#### 2) O que é o Express

O Node “puro” até consegue criar servidores (com o módulo `http`), mas é chato e repetitivo.

O **Express** é uma biblioteca que te dá uma forma simples e organizada de dizer:

- “se vier um GET para este caminho, faz isto”
- “antes das rotas, corre estas funções”
- “se o body vier em JSON, interpreta-o”

Ou seja: o Express é como um “organizador de tráfego” de requests.

No Express, a tua app é uma espécie de **tabela de regras**:

- **middlewares** (coisas que correm “no caminho”)
- **rotas** (handlers finais que ligam URL + método a funções)
- **controladores** (funções que fazem a lógica)

---

#### 3) Anatomia de um pedido no Express

O Express divide o pedido em dois objetos principais:

- `req` (request) → tudo o que vem do cliente
- `res` (response) → tudo o que vais enviar de volta

Estes dois objetos vão estar sempre disponíveis nas tuas rotas e em toda a lógica do backend.
Queres ir buscar dados ao pedido? Estão em `req`.
Queres enviar uma resposta? Usas `res`.

Por exemplo, colocar algo no `res`:

```js
// Define o status HTTP e envia o JSON numa única resposta.
// "201" significa "Created" (criamos um novo favorito).
// .json(...) envia um objeto JS convertido para JSON e fecha a resposta.
// Esta linha fecha o ciclo request -> response deste handler.
res.status(201).json({ id: 7 }); // envia status 201 e JSON { id: 7 } na resposta
```

Quer o `req` quer o `res` têm várias propriedades/métodos úteis.

Aqui estão os mais importantes:

- `req.params`
  Vem do URL com `:id`
  Ex.: rota `DELETE /api/favorites/:id`
  Pedido `DELETE /api/favorites/7` → `req.params.id === "7"` (atenção: **string**)

- `req.query`
  Vem da query string
  Ex.: `/pokemon?type=fire` → `req.query.type === "fire"`
  (Nesta ficha quase não usas, mas é importante saber que existe)

- `req.body`
  Vem do corpo do pedido (body) - típico em POST
  Ex.: `{ "id": 7 }`
  **Só aparece bem** se tiveres um parser, tipo `express.json()`.

E no lado da resposta:

- `res.status(201)` define o status code
- `res.json(...)` envia JSON (e mete o header certo)

> Nota: **o Express não “adivinha” body**. Se não tiveres `express.json()`, o `req.body` pode vir `undefined`.

---

#### 4) O que é um middleware (e porque é que a ordem importa)

Um **middleware** é uma função que corre **antes** da rota responder, para preparar o request, validar, adicionar headers, etc.

Fluxo simplificado:

```txt
Request ─▶ rota ─▶ middleware 1 ─▶ middleware 2 ─▶ rota (handler) ─▶ Response
```

(O último "middleware" antes da resposta, costuma chamar-se de "handler" ou "controlador".)

O detalhe importante: **a ordem dos `app.use(...)` interessa**.

- Se `express.json()` vier depois das rotas, as rotas podem nunca ver `req.body` bem.
- Se o `cors(...)` vier depois das rotas, o browser pode bloquear antes de tu responderes como queres.

Nesta ficha tens dois middlewares “clássicos”:

- `cors(...)`
  Serve para o browser aceitar pedidos cross-origin (já explico abaixo).

- `express.json()`
  Lê o body (quando vem em JSON) e converte para objeto JS em `req.body`.

> **Nota**: O body são os dados que o cliente envia no pedido. Eles precisam de ser “interpretados” para poderes usar em JavaScript. Para isso usamos o middleware `express.json()` uma vez que o body vem em JSON.

---

#### 5) Porque separamos `app.js` e `server.js` (ou `index.js`)

Isto é uma prática comum e tem uma razão simples:

- **`app.js`** define a aplicação (middlewares + rotas)
  É “a configuração do motor”.

- **`server.js`** só arranca o servidor (`app.listen(...)`)
  É “carregar na chave”.

Vantagens reais desta separação:

1. **Leitura mais limpa**: quando queres ver “o que a API faz”, vais ao `app.js`.
2. **Menos confusão**: o ficheiro de arranque fica curto e óbvio.
3. **Facilita testes** (mais tarde): podes importar `app` sem abrir portas.

---

#### 6) CORS

Como já vimos, browser tem uma regra de segurança chamada **Same-Origin Policy**.

“Origin” é: **protocolo + hostname + porta**.

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Isto é origin diferente (a porta muda) → por defeito, o browser bloqueia o pedido.

Então como se resolve?

O backend tem de dizer explicitamente:
“eu aceito pedidos vindos desta origin”.

É isso que o middleware `cors(...)` faz: mete os headers necessários na resposta.

##### Porque é que no curl/Postman funciona e no browser não?

Porque **CORS é uma regra do browser**.
`curl` e Postman não aplicam Same-Origin Policy, logo não bloqueiam.

---

#### 7) ES Modules no Node (`"type": "module"`)

Ao adicionares `"type": "module"` no `package.json`, estás a dizer ao Node:

- “vou escrever este projeto com `import/export`” em vez de `require/module.exports`.

Isto traz duas vantagens grandes nesta fase:

1. **Consistência com o frontend** (React já usa ES Modules)
2. Código mais moderno e alinhado com a forma como vais escrever Node daqui para a frente

---

#### Checklist de debug

Quando o backend “não dá”, pensa por camadas:

1. **O servidor está ligado?**
    - tens o terminal com `API a correr em http://localhost:3000`?

2. **A porta está correta e livre?**
    - se der `EADDRINUSE`, já tens algo na 3000.

3. **O `app.js` tem os middlewares antes das rotas?**
    - `cors(...)` e `express.json()` antes do `app.use("/api/favorites", ...)`.

4. **O Router está ligado ao prefixo certo?**
    - se ligares `/api/favorites`, então no router usas `/` internamente.

5. **Se falha só no browser, suspeita de CORS.**
    - se falha também no curl, é bug de rota/código.

---

### 5.1) Entrar em `backend/` e instalar dependências

Na raiz de `pokedex-v3`:

```bash
cd backend
npm init -y
npm install express cors
```

### 5.2) Ativar ES Modules

No `backend/package.json`, adiciona:

```json
{
    "type": "module"
}
```

Sem isto, o Node não reconhece `import ... from ...`.

**Erro típico (ES Modules)**

- **Erro**: `ReferenceError: require is not defined in ES module scope`
- **Causa**: falta `"type": "module"`
- **Solução**: adicionar `"type": "module"` ao `backend/package.json`

Já que estás a editar o `package.json`, podes também adicionar um script para arrancar o servidor:

```json
{
    "scripts": {
        "start": "node src/server.js"
    }
}
```

Se ainda não instalaste o `nodemon`, podes instalar para recarregar o servidor automaticamente:

```bash
npm install --save-dev nodemon
```

E adiciona outro script:

```json
{
    "scripts": {
        "start": "node src/server.js",
        "dev": "nodemon src/server.js"
    }
}
```

### 5.3) Criar estrutura `src/`

Cria:

- `backend/src/app.js`
- `backend/src/server.js`

(Se os ficheiros já existirem, não fazes nada.)

#### O papel de cada ficheiro

- `app.js` → configura o Express (middlewares + rotas)
- `server.js` → só arranca o servidor na porta

#### `backend/src/server.js`

Exemplo simples de `server.js`:

```js
/* backend/src/server.js */
// "import" traz código de outro ficheiro.
// Aqui trazemos a configuração da app Express (middlewares + rotas).
import app from "./app.js";

// "const" cria uma constante (o valor não deve mudar).
// Porta onde o servidor vai ficar "a ouvir" pedidos HTTP.
const PORT = 3000;

// app.listen abre a porta e fica a ouvir pedidos.
// A função dentro de listen corre quando o servidor está pronto.
app.listen(PORT, () => {
    // Template string: usa ${PORT} para juntar texto + valor.
    console.log(`API a correr em http://localhost:${PORT}`);
});
```

---

#### `backend/src/app.js`

Exemplo de `app.js` com CORS e JSON parser simples:

```js
// backend/src/app.js
// import: traz dependências instaladas pelo npm ou ficheiros locais.
import express from "express"; // framework para criar a API HTTP
import cors from "cors"; // middleware para permitir pedidos cross-origin
import favoritesRoutes from "./routes/favorites.routes.js"; // rotas de favoritos

// Cria a aplicação Express (o "motor" do servidor).
const app = express();

// app.use(...) adiciona um middleware.
// A ORDEM dos middlewares importa.
// Permite pedidos do frontend (porta 5173) para a API (porta 3000).
app.use(
    cors({
        origin: "http://localhost:5173",
    }),
);

// Faz o parse de JSON do body e coloca o resultado em req.body.
// Sem isto, req.body fica undefined.
app.use(express.json());

// Liga o router de favoritos ao prefixo /api/favorites.
// Ou seja, dentro do router usas "/" e aqui defines o caminho base.
app.use("/api/favorites", favoritesRoutes);

// Exporta a app para o server.js arrancar o servidor.
// "default" significa que este é o export principal do ficheiro.
export default app;
```

O que acontece aqui (em português simples):

1. `cors(...)` deixa o frontend falar com o backend.
2. `express.json()` permite ler JSON no `req.body`.
3. `app.use("/api/favorites", ...)` liga o router.

### Checkpoint

Na pasta `backend/`:

```bash
node src/server.js
```

ou

```bash
npm run dev
```

ou

```bash
npm start
```

Se arrancar, segue.

> Se der erro, confirma:
>
> - tens o Node atualizado?
> - tens `"type": "module"` no `package.json`?
> - tens o Express e CORS instalados?

**Checkpoint visual**

- No terminal do backend, vês: `API a correr em http://localhost:3000`.

---

## 6) Rotas de favoritos (`favorites.routes.js`)

### 6.0) Mini‑teoria: REST, Router, validação e “persistência” em memória

- REST aqui significa: URLs previsíveis por recurso (`favorites`) e métodos a indicar ação.
- `Router()` organiza a feature num ficheiro próprio.
- Persistência em memória: dados vivem numa variável; ao reiniciar, perdes tudo.
    - **Isto é esperado** nesta ficha - serve para perceber o fluxo antes de usar BD.

O `:id` no URL é um **param de rota**:

- `req.params.id` vem sempre como string → tens de validar/converter.

---

Este capítulo é onde se decide o “contrato” entre frontend e backend.

#### O que significa “API REST básica” aqui

REST, nesta ficha, significa apenas:

- tens **recursos** (neste caso: `favorites`)
- tens **endpoints** previsíveis (`/api/favorites`)
- usas **métodos HTTP** para dizer a intenção:
    - `GET` para ler
    - `POST` para adicionar
    - `DELETE` para remover

Não é “magia” nem um standard único - é uma forma organizada de pensar URLs e ações.

#### Porque usamos `Router()` em vez de meter tudo no `app.js`

O `Router()` é como um “mini‑app” do Express só para uma feature.

Vantagens:

- código mais fácil de encontrar
- cada feature tem o seu ficheiro
- no `app.js` só fazes “ligações” (`app.use("/api/favorites", router)`)

#### O que é “persistência em memória”

Quando fazemos:

```js
// Lista inicial em memória (perde-se ao reiniciar o servidor).
// Isto é um array de números (ids de Pokemon).
let favorites = [1, 4, 25];
```

isso significa:

- os dados vivem na RAM do servidor
- enquanto o processo do Node estiver ligado, a lista mantém-se
- quando reinicias o servidor, a variável volta ao início

Isto é ótimo para aprender, mas tem limitações óbvias:

- não é partilhado entre vários servidores
- perdes dados ao reiniciar
- não aguenta concorrência “a sério” (muitos pedidos ao mesmo tempo)

Mais tarde, substituis esta variável por uma base de dados.

#### Validação: onde e porquê

A validação é a barreira que impede “lixo” de entrar no teu sistema.

Nesta ficha, validamos:

- `id` tem de ser numérico
- tem de ser inteiro
- tem de ser > 0

O objetivo não é “ser chato” - é evitar estados impossíveis (ex.: favorito `-3`).

#### Status codes e consistência de erros

Um **status code** é um sinal rápido para o cliente:

- “correu bem” (200/201)
- “o pedido está errado” (400/422)
- “o recurso não existe” (404)
- “há conflito/duplicado” (409)

E a _forma_ do erro (JSON) deve ser estável.  
Se o backend devolver sempre:

```json
{ "error": { "code": "...", "message": "...", "details": [] } }
```

então o frontend consegue:

- mostrar mensagens
- tomar decisões (ex.: se `code === "DUPLICATE_KEY"`, não repetir pedido)

---

### 6.1) Porque usamos um Router separado

Em projetos reais, não metes tudo no `app.js`.
Organizas por features:

- `routes/favorites.routes.js`
- `routes/users.routes.js` (mais tarde)
- etc.

### 6.2) Implementação

Cria `backend/src/routes/favorites.routes.js`:

```js
/* backend/src/routes/favorites.routes.js */
import { Router } from "express";

// Cria um router dedicado a esta feature (favoritos).
// Router() é como uma mini-app dentro do Express.
const router = Router();

// Estado em memória: começa com alguns ids para testar.
let favorites = [1, 4, 25];

// Helper para manter o formato de erro sempre igual.
// Assim o frontend sabe sempre onde está a mensagem de erro.
// details tem valor por defeito: [] (array vazio).
function sendError(res, status, code, message, details = []) {
    return res.status(status).json({ error: { code, message, details } });
}

// Converte e valida o id (tem de ser inteiro positivo).
// parseId recebe um valor (string/número) e devolve número ou null.
function parseId(value) {
    // Number(...) tenta converter string -> número.
    const numericId = Number(value);

    // Number.isInteger garante que não é 2.5, NaN, etc.
    if (!Number.isInteger(numericId) || numericId <= 0) {
        return null;
    }

    return numericId;
}

// GET /api/favorites
// (req, res) são os objetos de request e response do Express.
router.get("/", (req, res) => {
    // Devolve o array completo de ids favoritos.
    res.status(200).json(favorites);
});

// POST /api/favorites
router.post("/", (req, res) => {
    // O id vem do body (JSON).
    // req.body pode ser undefined se faltar express.json().
    // Desestruturação: const { id } = ... apanha a propriedade "id".
    const { id } = req.body || {};
    const numericId = parseId(id);

    // Body inválido -> 422 (dados inválidos no body).
    if (!numericId) {
        // return para parar aqui e não continuar a função.
        return sendError(
            res,
            422,
            "VALIDATION_ERROR",
            "Id obrigatório e numérico",
        );
    }

    // Evita duplicados.
    // includes verifica se o array já tem aquele número.
    if (favorites.includes(numericId)) {
        return sendError(res, 409, "DUPLICATE_KEY", "Pokémon já é favorito");
    }

    // Atualiza o array de forma imutável.
    // Usamos [...] para criar um novo array (boa prática em JS/React).
    // O operador ... "espalha" (spread) os valores do array antigo.
    favorites = [...favorites, numericId];
    res.status(201).json({ id: numericId });
});

// DELETE /api/favorites/:id
router.delete("/:id", (req, res) => {
    // O id vem da URL (params).
    // req.params.id é sempre string, por isso validamos.
    const numericId = parseId(req.params.id);

    // Param inválido -> 400 (problema no URL).
    if (!numericId) {
        return sendError(res, 400, "INVALID_ID", "Id inválido");
    }

    // Se não existir, devolve 404.
    if (!favorites.includes(numericId)) {
        return sendError(res, 404, "NOT_FOUND", "Favorito não encontrado");
    }

    // Remove o id e devolve confirmação.
    // filter cria um novo array sem o id escolhido.
    // (id) => id !== numericId é uma função que diz o que fica.
    favorites = favorites.filter((id) => id !== numericId);
    res.status(200).json({ id: numericId });
});

// Exporta o router para ser ligado no app.js.
export default router;
```

### 6.3) Leitura guiada

#### Dados em memória

- `favorites = [1,4,25]` é o estado inicial.
- Serve para teres algo logo no primeiro GET.

#### Validação de ID

- `parseId` evita IDs como `"abc"`, `-3`, `2.5`.

#### Erros consistentes

- `sendError` garante sempre `{ error: { ... } }`.
- Isto facilita o frontend: ele sabe sempre onde está a mensagem.

#### GET

- Devolve o array.

#### POST

- Valida body.
- Impede duplicados.
- Adiciona o id.

#### DELETE

- Valida param.
- Verifica se existe.
- Remove.

---

## 7) Testar o backend (antes do React)

### 7.0) Mini‑teoria: como testar uma API sem envolver React

#### Contexto extra (definições mais detalhadas)

Se testares primeiro com `curl`:

- isolas o backend
- evitas debug “às cegas” com dois sistemas ao mesmo tempo

Pista útil:

- se `curl` funciona e o browser não, é quase sempre CORS/porta/origin.

---

Testar o backend primeiro é uma estratégia de engenharia muito usada:

- se a API falhar, sabes que o problema é do backend
- se a API estiver ok, o problema está no frontend (ou no CORS)
- evitas “debug às cegas” com 2 sistemas ao mesmo tempo

Utilização do `curl`:

- `curl` é uma ferramenta de linha de comandos para fazer pedidos HTTP.
- Permite testar GET/POST/DELETE sem browser.

Exemplos:

```bash
curl http://localhost:3000/api/favorites
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{"id": 7}'
curl -X DELETE http://localhost:3000/api/favorites/7
```

O 1º faz o GET de favoritos.
O 2º faz o POST com body JSON.
O 3º faz o DELETE do favorito com id 7.

Depois de fazeres estas instruções, a consola mostra a resposta do servidor (JSON).

Por exemplo, o 1º deve mostrar:

```json
[1,4,25] (Ou o que tiveres na lista de favoritos)
```

#### Ferramentas típicas

- **curl** (linha de comandos)  
  bom para aprender e ver exatamente o que estás a enviar
- **Postman / Insomnia**  
  bom para testar rápido e guardar coleções de requests
- **DevTools (Network)**  
  quando já ligares o React, confirmas se o browser está a enviar o que pensas

#### Preflight `OPTIONS` (o tal pedido “extra”)

Quando fazes um `POST` com JSON (ou headers “não simples”), o browser pode enviar antes um `OPTIONS` automático.

Isso não é bug:

- é o browser a perguntar “posso fazer este pedido?”
- o middleware `cors` responde com os headers corretos

Se vires `OPTIONS` no Network, respira: normalmente é esperado.

---

### Porque isto é obrigatório (mesmo)

Se ligares ao React sem testar, ficas sem saber se o erro está no backend ou no frontend.

### Terminal A

```bash
cd backend
node src/server.js
```

### Terminal B - testes (curl)

```bash
curl http://localhost:3000/api/favorites
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{"id": 7}'
curl -X DELETE http://localhost:3000/api/favorites/7
```

### Mini-debug

- Se o GET falhar → o servidor não está a correr.
- Se o POST falhar → `express.json()` pode estar em falta.
- Se aparecer CORS aqui → estás a testar no browser (curl não aplica CORS).

---

## 7.1) Mini-lab - provocar erros de propósito (para aprender)

Isto é uma das melhores formas de perceber status codes: provocar erros controlados e ver o que o backend devolve.

Com o backend ligado, tenta:

### Erro 422 (body inválido)

```bash
curl -X POST http://localhost:3000/api/favorites   -H "Content-Type: application/json"   -d '{}'
```

O backend deve responder com `422` e um JSON com `error.code = "VALIDATION_ERROR"`.

### Erro 409 (duplicado)

Se o `1` já está nos favoritos iniciais, tenta adicionar:

```bash
curl -X POST http://localhost:3000/api/favorites   -H "Content-Type: application/json"   -d '{"id": 1}'
```

Deve dar `409` e `error.code = "DUPLICATE_KEY"`.

### Erro 400 (param inválido)

```bash
curl -X DELETE http://localhost:3000/api/favorites/abc
```

Deve dar `400` e `error.code = "INVALID_ID"`.

### Erro 404 (não existe)

Escolhe um id que não esteja na lista (ex.: 9999):

```bash
curl -X DELETE http://localhost:3000/api/favorites/9999
```

Deve dar `404` e `error.code = "NOT_FOUND"`.

### Checkpoint intermédio (memória do backend)

Neste ponto, confirma:

1. Adiciona um favorito com `POST /api/favorites`.
2. Faz `GET /api/favorites` e confirma que aparece.
3. Reinicia o backend (`Ctrl + C` e `node src/server.js`).
4. Faz `GET /api/favorites` outra vez.

Resultado esperado nesta ficha: a lista volta ao estado inicial em memória.

---

# PARTE B - FRONTEND

> A partir daqui, qualquer caminho `src/...` refere-se ao frontend (`frontend/src/...`).

## 7.2) (Extra) Como separar responsabilidades no frontend

### 7.2.1) Regra prática para decidir “onde isto vive”

Quando estás na dúvida onde meter uma função, usa esta regra:

1. **Fala com a rede (fetch)?**  
   Vai para `services/`.

2. **Coordena várias coisas e mexe em estado global (carregar, validar fluxo, fazer POST e depois atualizar UI)?**  
   Vai para `context/` (ações do Provider).

3. **Só desenha UI e dispara eventos (onClick/onChange)?**  
   Vai para `components/` (nesta ficha, as páginas continuam lá, como na Ficha 4).

> Objetivo final: componentes visuais devem ser “parvos”: recebem dados prontos e mostram.  
> A “inteligência” fica concentrada em services + context.

---

Quando a app cresce, o objetivo é que cada pasta tenha um papel claro:

- `services/`  
  Funções “puras” para falar com APIs (fetch) ou manipular dados.  
  Não deve ter JSX.

- `context/`  
  Estado global e ações (ex.: carregar dados, toggle favorito).  
  Serve de “ponte” entre UI e services.

- `components/`  
  Componentes visuais (cards, botões, layout).  
  Idealmente recebem dados já prontos para mostrar.

- `pages/` (opcional)  
  Páginas do Router: combinam componentes e regras de página.  
  **Nesta ficha** mantemos as pages dentro de `components/` para compatibilidade direta com a Ficha 4.

Se fizeres isto bem:

- mudar backend → mexes em `services/`
- mudar regras globais → mexes em `context/`
- mudar visual → mexes em `components/`

---

**Contrato da API**

| Endpoint             | Método | Body          | Resposta      | Status | Erros típicos |
| -------------------- | ------ | ------------- | ------------- | ------ | ------------- |
| `/api/favorites`     | GET    | -             | `[1,4,25]`    | 200    | -             |
| `/api/favorites`     | POST   | `{ "id": 7 }` | `{ "id": 7 }` | 201    | 409, 422      |
| `/api/favorites/:id` | DELETE | -             | `{ "id": 7 }` | 200    | 400, 404      |

**Exemplo de erro (409 duplicado)**

Se tentares adicionar um favorito já existente, o backend devolve `409`.
A UI deve mostrar uma mensagem simples (ex.: “Esse Pokémon já é favorito.”).

**Checkpoints operacionais obrigatórios (antes de ligar frontend↔backend)**

1. Backend responde a `GET /api/favorites` → vês JSON `[1,4,25]` no browser/curl.
2. Frontend abre sem erro de rede.
3. No Network, vês `GET http://localhost:3000/api/favorites`.
4. Se aparecer `OPTIONS` antes de `POST/DELETE`, isso é **normal** (preflight).

## 8) Criar o serviço `favoritesApi.js`

Este módulo é criado no lado do frontend e é o responsável por falar com o backend.

### 8.0) Mini‑teoria: `fetch`, `res.ok`, JSON e propagação de erros

#### Contexto extra (definições mais detalhadas)

O `fetch` só falha automaticamente em erros de rede.
Para 404/422, ele devolve resposta na mesma - por isso é que existe `res.ok`.

Regra:

- `if (!res.ok) ...` → decide o que fazer (lançar erro, mostrar mensagem, etc.).

---

O `fetch` é simples de usar, mas tem dois “truques” importantes.

#### 1) `fetch` _não_ lança erro em HTTP 4xx/5xx

O `fetch` só lança erro automaticamente em situações como:

- sem internet
- DNS falhou
- servidor desligado
- timeout (dependendo do ambiente)

Se o servidor responder `404` ou `422`, o `fetch` considera isso “uma resposta válida” - por isso tens de decidir o que fazer.

É para isso que existe:

- `if (!res.ok) ...`

#### Extra útil: ler o `error.code` do backend

Se quiseres mostrar a mensagem do backend (ex.: `DUPLICATE_KEY`), podes ler o JSON
antes de lançar o erro:

```js
if (!res.ok) {
    const data = await res.json().catch(() => null);
    const code = data?.error?.code;
    throw new Error(code ? `Erro API (${code})` : "Erro API");
}
```

Isto ajuda a perceber **porque** falhou (ex.: favorito duplicado).

#### 2) O body (JSON) pode ter informação útil… mesmo em erro

Nesta ficha, o backend devolve um JSON de erro com `code` e `message`.  
Num projeto mais avançado, é comum fazer:

- ler o JSON
- extrair a mensagem
- lançar um erro com mais contexto

Aqui, mantemos a implementação simples (erro genérico), mas é importante perceber a ideia.

#### `Content-Type` (porque precisamos dele no POST)

No `POST`, enviamos JSON. O header:

- `"Content-Type": "application/json"`

diz ao servidor: “o body está em JSON”.  
Sem isto, `express.json()` pode não interpretar o body como esperas.

---

### 8.1) Objetivo

Ter um único módulo responsável por falar com o backend.

Cria `src/services/favoritesApi.js`:

```js
// src/services/favoritesApi.js

// Base da API (muda aqui se a porta ou host mudar).
// E uma string com o endereço do backend.
const API_BASE = "http://localhost:3000";

// GET /api/favorites -> devolve um array de ids.
// async significa que a função devolve uma Promise.
export async function getFavorites() {
    // fetch faz um pedido HTTP e devolve uma Promise.
    // await pausa aqui até a resposta chegar.
    const res = await fetch(`${API_BASE}/api/favorites`);
    // res.ok indica se o status está em 2xx.
    if (!res.ok) throw new Error("Erro API");
    // Converte o JSON da resposta para objeto JS.
    // res.json() também devolve uma Promise.
    return res.json();
}

// POST /api/favorites -> adiciona um id aos favoritos.
export async function addFavorite(id) {
    // body vai em JSON, por isso usamos JSON.stringify(...)
    const res = await fetch(`${API_BASE}/api/favorites`, {
        method: "POST",
        // Diz ao servidor que o body está em JSON.
        headers: { "Content-Type": "application/json" },
        // Envia o id no body.
        body: JSON.stringify({ id }),
    });
    // Se o backend respondeu com 4xx/5xx, lançamos erro.
    if (!res.ok) throw new Error("Erro API");
    // Devolve o JSON com o id confirmado pelo servidor.
    return res.json();
}

// DELETE /api/favorites/:id -> remove um id.
export async function removeFavorite(id) {
    // Aqui colocamos o id no URL (endpoint com parâmetro).
    const res = await fetch(`${API_BASE}/api/favorites/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro API");
    // Devolve o JSON com o id removido.
    return res.json();
}
```

### 8.2) Porque este ficheiro é importante

- É o “contrato” do frontend com a API.
- Se mudares `API_BASE`, mudas só aqui.

### 8.3) Como o erro se propaga

- Se `res.ok` falhar, lançamos `Error("Erro API")`.
- Esse erro vai ser apanhado no Provider (na fase seguinte).

---

### 8.4) Debug de pedidos no browser (DevTools)

Quando estiveres com o frontend ligado, abre as DevTools (F12) e usa:

- **Network** → para ver pedidos `GET/POST/DELETE`
- **Console** → para ver erros

O que deves confirmar:

1. Ao abrir a app, aparece um `GET http://localhost:3000/api/favorites` (status 200).
2. Ao clicar numa estrela, aparece:
    - `POST /api/favorites` (se estás a adicionar)
    - ou `DELETE /api/favorites/:id` (se estás a remover)
3. Se algo falhar, vê:
    - o **status**
    - a **response body** (a tua `error`)

> Dica: no separador Network, clica no pedido e abre “Response”.

---

## 9) Criar o Context (`PokedexContext.jsx`)

### 9.0) Mini‑teoria: estado global, Context API, Provider e `usePokedex()`

#### Contexto extra (definições mais detalhadas)

O Provider é onde:

- carregas dados iniciais
- guardas estado global
- defines ações que a UI usa

`Promise.all` é importante porque permite carregar:

- PokéAPI e backend em paralelo.

---

Este capítulo é o “coração” do frontend: decide onde vivem os dados e como circulam.

#### O que é “estado global” (na prática)

Estado global é informação que:

- é usada em várias páginas/componentes
- precisa de estar sincronizada (ex.: favoritos)
- não faz sentido estar duplicada em 3 sítios diferentes

Exemplos nesta ficha:

- `pokemon` (lista principal)
- `favorites` (ids favoritos)
- `loading` / `error` (estado de carregamento)

#### O problema: prop drilling

Prop drilling é quando tens de passar props por componentes intermédios que:

- não usam esses dados
- só servem de “passagem”

Isto cria:

- muito ruído nos componentes
- mais sítios para enganar (props em falta)
- mais dificuldade em mudar a estrutura da UI

#### A solução: Context API

Com Context:

- crias um “canal” de dados (Context)
- um Provider coloca esses dados disponíveis para baixo
- qualquer componente filho lê com `useContext(...)`

Nesta ficha, criamos um hook:

- `usePokedex()`

que é a interface “bonita” e segura para o resto da app.

#### Porque criamos um hook e não usamos `useContext` em todo o lado

Um hook como `usePokedex()` dá-te:

- uma mensagem de erro clara se alguém usar fora do Provider
- uma API consistente (sempre o mesmo formato de dados/ações)
- menos imports repetidos e menos “boilerplate” nas páginas

---

### 9.1) Objetivo

- Guardar estado global.
- Fornecer ações (toggle, reload).

> Nota pedagógica: se `useCallback`/`useMemo` ainda confundirem,
> começa **sem** essas otimizações (tudo direto com `useState` + `useEffect`),
> garante que funciona, e só depois volta aqui para “melhorar” com callbacks/memo.

**Context em 2 camadas (conceptual → otimizada)**

- **Conceptual**: `Provider` guarda estado e expõe ações.
- **Otimizada**: `useCallback` evita recriar funções, `useMemo` estabiliza o `value`.

Cria `src/context/PokedexContext.jsx`:

```jsx
/* src/context/PokedexContext.jsx */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { fetchPokemonList } from "@/services/pokeApi.js";
import {
    addFavorite,
    getFavorites,
    removeFavorite,
} from "@/services/favoritesApi.js";

// Limite da PokeAPI (Gen 1).
const POKEMON_LIMIT = 151;

// Criamos o Context vazio; vai ser preenchido pelo Provider.
// createContext cria um "canal" para partilhar dados sem props.
const PokedexContext = createContext(null);

export function PokedexProvider({ children }) {
    // children = tudo o que estiver dentro do <PokedexProvider> no JSX.
    // Estado global principal da app.
    // useState devolve [valorAtual, funcaoParaAtualizar].
    const [pokemon, setPokemon] = useState([]); // lista completa de Pokemon
    const [favorites, setFavorites] = useState([]); // ids favoritos
    const [loading, setLoading] = useState(true); // true enquanto carrega
    const [error, setError] = useState(null); // null = sem erro

    // Carrega dados iniciais em paralelo (PokeAPI + backend).
    // useCallback memoriza a função para manter a mesma referência.
    const loadInitialData = useCallback(async () => {
        // Antes de pedir dados, marcamos "loading".
        setLoading(true);
        // Limpamos erros antigos.
        setError(null);

        try {
            // Promise.all espera pelos dois pedidos ao mesmo tempo.
            // Isto é mais rápido do que fazer um de cada vez.
            const [pokemonList, favoritesList] = await Promise.all([
                fetchPokemonList(POKEMON_LIMIT),
                getFavorites(),
            ]);

            // Atualiza o estado global com os dados recebidos.
            setPokemon(pokemonList);
            setFavorites(favoritesList);
        } catch (err) {
            console.error(err);
            // Mensagem simples para a UI.
            setError("Erro ao carregar dados.");
        } finally {
            // O loading acaba quer tenha havido erro ou não.
            setLoading(false);
        }
    }, []);

    // Ao montar o Provider, carregamos os dados iniciais.
    // useEffect corre depois do primeiro render.
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Alterna favorito: se existir, remove; se não existir, adiciona.
    // useCallback evita recriar a função a cada render.
    const toggleFavorite = useCallback(
        async (id) => {
            try {
                // Se o id já está nos favoritos, removemos.
                if (favorites.includes(id)) {
                    await removeFavorite(id);
                    // Atualização imutável (novo array).
                    setFavorites(favorites.filter((favId) => favId !== id));
                } else {
                    // Se não está, adicionamos.
                    await addFavorite(id);
                    // Atualização imutável (novo array).
                    setFavorites([...favorites, id]);
                }
            } catch (err) {
                console.error(err);
                window.alert("Não foi possível atualizar favoritos.");
            }
        },
        [favorites],
    );

    // Objeto que será partilhado com toda a app via Context.
    // useMemo evita criar um novo objeto em cada render sem necessidade.
    const value = useMemo(
        () => ({
            pokemon,
            favorites,
            loading,
            error,
            toggleFavorite,
            // "reload" e apenas outro nome para a função loadInitialData.
            reload: loadInitialData,
        }),
        [pokemon, favorites, loading, error, toggleFavorite, loadInitialData],
    );

    return (
        // Fornece dados e ações a todos os filhos.
        <PokedexContext.Provider value={value}>
            {children}
        </PokedexContext.Provider>
    );
}

export function usePokedex() {
    // Hook "bonito" para consumir o Context com seguranca.
    // Evita repetir useContext(PokedexContext) em todo o lado.
    const context = useContext(PokedexContext);
    if (!context)
        // Erro explicito para ajudar no debug.
        throw new Error("usePokedex deve ser usado dentro do PokedexProvider");
    return context;
}
```

### 9.2) Explicação com “mapa mental”

Quando a app abre:

1. Provider monta
2. `useEffect` chama `loadInitialData`
3. `loadInitialData` faz:
    - PokéAPI → lista de Pokémon
    - Backend → favoritos
4. Atualiza o estado
5. Pages re-renderizam com dados

### 9.3) Porque `useCallback` aqui

O `useEffect` depende de `loadInitialData`.
Se `loadInitialData` fosse criado de novo em cada render, o efeito podia re-disparar.
Com `useCallback`, tens uma referência estável.

### 9.4) `toggleFavorite` e o detalhe da dependência

`toggleFavorite` depende de `favorites`.
Isto cria um “fecho” (closure): ele usa o array atual para decidir POST vs DELETE.

Mais tarde, quando aprenderes padrões mais avançados, podes melhorar isto usando updates funcionais.
Mas nesta ficha, está ok e cumpre o objetivo.

### 9.5) `useMemo` no `value`

Sem `useMemo`, o `value` seria um objeto novo em cada render.
Com `useMemo`, só muda quando algo realmente mudou.

### Nota sobre React Strict Mode

Em desenvolvimento, o React pode chamar efeitos duas vezes para detetar problemas.
Se vires pedidos duplicados, confirma se estás em dev e se é comportamento esperado.

---

## 9.6) Como pensar em dependências (`[]`) sem decorar

### Contexto extra - dependências e closures (explicação curta e prática)

Uma função em JS “apanha” o valor atual das variáveis que usa (closure).
Se a função usa `favorites`, então precisa de ser atualizada quando `favorites` muda.

Mais tarde, vais aprender a alternativa “update funcional”:

- `setFavorites(prev => ...)`
  que reduz dependências e evita alguns bugs.
  Mas aqui o foco é o fluxo geral e a clareza.

Isto é o que costuma confundir mais alunos: “o que meto nas dependências?”

### Regra 1 - Um efeito depende do que usa

Se dentro do `useEffect` usas uma função/variável que vem de fora, o efeito depende disso.

No Provider:

- O `useEffect` chama `loadInitialData`
- Logo, as dependências incluem `loadInitialData`

Por isso existe o:

```js
// Efeito que corre quando o Provider monta (ou quando loadInitialData muda).
// O array de dependências diz ao React quando repetir este efeito.
useEffect(() => {
    loadInitialData();
}, [loadInitialData]); // dependência: usamos a função dentro do efeito
```

### Regra 2 - `useCallback` e `useMemo` são para estabilidade (não para “performance” nesta fase)

Nesta ficha, a razão principal é:

- evitar efeitos a disparar mais do que queres
- evitar re-renders em cascata por objetos/funções sempre novos

### Regra 3 - Closure (a “fotografia” do estado)

Em `toggleFavorite`, repara que a função usa `favorites` lá dentro.
Isso significa que a função “vê” o valor de `favorites` do render atual.

É por isso que `toggleFavorite` tem `[favorites]` nas dependências:
para garantir que, quando `favorites` muda, a função muda e passa a ver o valor certo.

> Mais tarde, vais aprender uma alternativa com updates funcionais para reduzir dependências.
> Mas nesta ficha o objetivo é perceber o fluxo, não micro-otimizações.

---

## 10) Ligar o Provider no `main.jsx`

### Objetivo

- Garantir que todas as páginas têm acesso ao Context.

No `src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { PokedexProvider } from "@/context/PokedexContext.jsx";

// Cria a raiz React no div#root do index.html.
ReactDOM.createRoot(document.getElementById("root")).render(
    // StrictMode ajuda a encontrar problemas em desenvolvimento.
    // Em modo dev, alguns efeitos podem correr duas vezes.
    <React.StrictMode>
        {/* Router para ativar as rotas da aplicação */}
        {/* BrowserRouter usa o histórico do browser (URLs reais) */}
        <BrowserRouter>
            {/* Provider coloca o estado global disponível para toda a app */}
            <PokedexProvider>
                <App />
            </PokedexProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
```

### Checkpoint

- Se alguma página chamar `usePokedex()` fora do Provider, vais ter erro.

**Checkpoint visual**

- A app abre e continua a mostrar o Layout e a lista, sem crash imediato.

---

## 11) `App.jsx` passa a ser só rotas

### 11.1) O que vais remover do `App.jsx`

- `useState` de pokemon/favorites/loading/error
- `useEffect` de load
- lógica de `localStorage`
- `fetchPokemonList` e constantes relacionadas

### 11.2) O que fica

- imports do Router
- `<Routes>` e `<Route>`

O componente final fica assim (apenas a parte do `App`):

```jsx
// App fica responsavel apenas por definir as rotas.
function App() {
    return (
        {/* <Routes> é o "mapa" de rotas da aplicação */}
        <Routes>
                {/* Layout e rotas filhas */}
            <Route path="/" element={<Layout />}>
                {/* Layout normalmente tem um <Outlet /> onde as pages aparecem */}
                {/* Home com lista */}
                {/* index = rota principal "/" */}
                <Route index element={<PokemonListPage />} />
                {/* Rota dinamica por id */}
                {/* Como está dentro de "/", o caminho final é /pokemon/:id */}
                <Route path="pokemon/:id" element={<PokemonDetailsPage />} />
                {/* Pagina de favoritos */}
                <Route path="favoritos" element={<FavoritesPage />} />
                {/* Fallback 404 */}
                {/* * significa "qualquer outra rota" */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
```

---

## 12) Atualizar Layout e Pages para consumirem Context

### 12.0) Mini‑teoria: migração para Context, re-render e atualizações imutáveis

#### Contexto extra (definições mais detalhadas)

- `setState` → dispara re-render
- arrays/objetos devem ser atualizados de forma **imutável**
    - `[...]` e `filter` criam novos arrays (React percebe a mudança)

Arquiteturalmente, a vitória é:

- rotas num sítio
- dados noutro
- UI noutro

Isso escala muito melhor.

---

Aqui estás a fazer uma mudança que parece “cosmética” (tirar props), mas que na verdade muda a arquitetura.

#### O que muda quando passas props → Context

Antes:

- o `App` tinha o estado
- o `App` passava tudo para as pages
- as pages passavam para componentes

Agora:

- o estado está no Provider
- as pages vão buscar diretamente ao Provider
- o `App` fica “limpo” (rotas apenas)

Isto torna a app mais fácil de evoluir porque o Router e o estado deixam de estar misturados no mesmo ficheiro.

#### Re-render: porque a UI muda quando o estado muda

Em React, a regra é:

- quando chamas `setState(...)`, o componente volta a renderizar
- e todos os filhos que dependem desse estado também podem renderizar

Por isso, quando o Provider faz:

- `setFavorites([...favorites, id])`

o React redesenha:

- a lista
- a página de detalhes
- a página de favoritos

Tudo porque essas páginas “lêem” `favorites`.

#### Atualizações imutáveis (porque usamos `[...]` e `filter`)

Repara que nunca fazemos:

- `favorites.push(id)`

Em vez disso, criamos um **novo array**:

- adicionar: `setFavorites([...favorites, id])`
- remover: `setFavorites(favorites.filter(...))`

Isto é importante porque:

- React deteta mudanças por referência (um array novo = mudou)
- evita bugs de “estado alterado em silêncio”

---

### 12.1) Regra prática

Se antes tinhas isto:

```jsx
{
    /* Versão antiga: props passadas do App para a page */
}
{
    /* Props são valores/função passados de pai para filho */
}
<PokemonListPage
    pokemon={pokemon}
    favorites={favorites}
    onToggleFavorite={toggleFavorite}
/>;
```

Agora não passas props, e dentro da page fazes:

```js
// Importa o hook que expõe estado e ações do Context.
import { usePokedex } from "@/context/PokedexContext.jsx";
// Desestrutura os dados/ações que esta página precisa.
// Desestruturação: pega propriedades do objeto e cria variáveis com o mesmo nome.
// usePokedex() devolve um objeto com dados (pokemon, favorites) e funções (toggle, reload).
const { pokemon, favorites, loading, error, toggleFavorite, reload } =
    usePokedex();
```

### 12.2) Substituições típicas (lista)

- `props.pokemon` → `pokemon`
- `props.favorites` → `favorites`
- `props.loading` → `loading`
- `props.error` → `error`
- `props.onToggleFavorite` → `toggleFavorite`
- `props.onRetry` → `reload`

### 12.3) Fluxo quando clicas num favorito (para perceberes o que acontece)

1. Utilizador clica na estrela
2. `toggleFavorite(id)` é chamado
3. Provider decide POST ou DELETE
4. Backend responde
5. Provider atualiza `favorites`
6. React re-renderiza lista/detalhes/favoritos

### 12.3.1) Fluxo visual do favorito (para debug rápido)

```txt
Clica no ❤️
-> toggleFavorite(id) no Context
-> favoritesApi (POST/DELETE)
-> Express /api/favorites
-> resposta JSON + status
-> setFavorites(...)
-> React re-render (card/lista/detalhes)
```

### Checkpoint

- Nenhuma page recebe props do App.
- Favoritos continuam a atualizar a UI.

**Checkpoint visual**

- Ao clicar no ❤️, o estado visual do card muda sem recarregar a página.

---

## 12.4) Guia de migração por ficheiro (v2 → v3)

Esta secção serve para te orientar quando abres o projeto e vês 10 erros de props.

A ideia é simples: **as Pages deixam de receber props** e passam a ir buscar tudo ao Context.

### a) `Layout.jsx`

Procura por props no `Layout` (ex.: `favorites`, `pokemon`, etc.).  
Depois:

1. Importa o hook:

```js
// Hook para ler dados globais sem passar props.
// Este import é igual em qualquer componente que precise do Context.
import { usePokedex } from "@/context/PokedexContext.jsx";
```

2. Dentro do componente:

```js
// Vai buscar apenas o que este componente precisa.
// Assim o código fica mais limpo e fácil de ler.
const { pokemon, favorites } = usePokedex();
```

> O objetivo é o Layout poder, por exemplo, mostrar contadores ou links com base nos favoritos.

### b) `PokemonListPage.jsx`

Antes (exemplo típico):

```js
// Antes: a page recebia tudo por props.
// Isto obriga o App a passar muitas props para vários níveis.
function PokemonListPage({ pokemon, favorites, loading, error, onToggleFavorite, onRetry }) { ... }
```

Depois:

```js
function PokemonListPage() {
    // Agora a page lê diretamente do Context.
    // Não precisa de receber props do App.
    const { pokemon, favorites, loading, error, toggleFavorite, reload } = usePokedex();
    ...
}
```

E substituis:

- `onToggleFavorite(...)` → `toggleFavorite(...)`
- `onRetry` → `reload`

### c) `PokemonDetailsPage.jsx`

Mesma ideia:

- remover props
- ler do Context
- substituir handlers

> Se a navegação com query string (`location.search`) estiver confusa,
> começa por navegar só com `navigate("/pokemon/ID")`.
> Quando tudo estiver a funcionar, volta e adiciona a preservação da query.

Exemplo de assinatura:

```js
function PokemonDetailsPage() {
    // Detalhes também passam a ler do Context.
    // O padrão é o mesmo: ler dados + ações pelo hook.
    const { pokemon, favorites, loading, error, toggleFavorite, reload } =
        usePokedex();
}
```

### d) `FavoritesPage.jsx`

Esta é a página onde normalmente se nota logo se o Context está bem:

- remove props
- lê `pokemon` + `favorites`
- filtra os pokemon favoritos como fazias antes

### e) Componentes pequenos (Cards, Buttons)

Se algum componente pequeno recebia `isFavorite` ou `onToggleFavorite` por props, isso pode continuar igual.
Não é proibido usar props - o objetivo é evitar passar props por 4 níveis sem necessidade.

Regra prática:

- Props **entre componentes próximos** (pai→filho direto) = ok
- Props a atravessar 3–4 níveis = Context começa a compensar

### 12.5) Checklist obrigatória de migração por ficheiro

Verifica se já fizeste estas mudanças em cada ficheiro:

- [ ] `Layout.jsx`: remove props, usa `usePokedex()`
- [ ] `PokemonListPage.jsx`: remove props, `toggleFavorite` + `reload`
- [ ] `PokemonDetailsPage.jsx`: remove props, `toggleFavorite` + `reload`
- [ ] `FavoritesPage.jsx`: remove props, usa `pokemon` + `favorites` do Context
- [ ] `App.jsx`: fica só com `<Routes>`/`<Route>` (sem estado global)

---

## 13) Executar o projeto

### Terminal A (backend)

```bash
cd backend
node src/server.js
```

### Terminal B (frontend)

Na raiz de `pokedex-v3`:

```bash
cd frontend
npm run dev
```

Se o frontend mostrar erro de rede, confirma primeiro que o backend está ligado.

---

## 14) Debug: erros comuns e como pensar neles

### 14.0) Tabela rápida: erro por camada

| Camada     | Sintoma típico                       | Teste imediato                             | Conclusão provável                                 |
| ---------- | ------------------------------------ | ------------------------------------------ | -------------------------------------------------- |
| Rede/CORS  | `Failed to fetch` ou CORS no browser | `curl http://localhost:3000/api/favorites` | Se curl funciona, o problema é browser/CORS/origin |
| API (HTTP) | 400/404/409/422 no Network           | Ver `status` + `Response` no pedido        | Backend respondeu, validação/contrato falhou       |
| React/JS   | erro vermelho na consola             | abrir Console e ver stack trace            | problema no código da UI/Context/props             |

### 14.1) CORS policy blocked

Isto é o browser a bloquear. Confirma:

- backend tem `cors({ origin: "http://localhost:5173" })`

### 14.2) `Erro API` (no frontend)

Pensa por camadas:

1. Backend está a correr?
2. URL está certo?
3. Endpoint existe? (`/api/favorites`)

### 14.3) POST não funciona

Normalmente é um destes:

- faltou `express.json()`
- o body não é JSON válido

### 14.4) Favoritos voltam ao inicial

Isto é esperado nesta ficha.
O objetivo é perceber o fluxo cliente-servidor.

---

## 14.5) FAQ rápida

### “Porque é que o meu backend perde os favoritos?”

Porque nesta ficha os favoritos estão num array em memória.  
Memória do processo Node = quando o processo morre, os dados vão embora.

### “Então isto não é inútil?”

Não. Isto é exatamente o passo intermédio antes de uma BD:

- Hoje: `favorites = [...]`
- Amanhã: `favorites` vem de MongoDB

O frontend não tem de saber onde os dados vivem - ele só fala com a API.

### “Posso fazer o backend arrancar com `npm start`?”

Podes, criando scripts no `backend/package.json`.  
Nesta ficha não é obrigatório, mas fica como melhoria opcional.

Exemplo:

```json
{
    "scripts": {
        "start": "node src/server.js"
    }
}
```

### “Porque é que o curl não acusa CORS?”

CORS é uma regra do **browser**.  
Ferramentas como curl/Postman não aplicam essa regra.

### “Tenho erros estranhos e não sei por onde começar”

Segue esta ordem:

1. Backend ligado? (porta 3000)
2. Rotas respondem? (testa `GET /api/favorites` no browser)
3. Frontend faz pedidos? (Network tab)
4. Erro é status code ou JS error? (Console)

---

## 15) Desafios opcionais (extra)

Sem mexer na base da ficha, podes tentar:

1. Adicionar um endpoint `DELETE /api/favorites` para limpar tudo.
2. Guardar favoritos em ficheiro `favorites.json`.
3. Trocar `alert` por um componente de erro mais bonito.

---

## 16) Exercícios propostos (para consolidar)

1. **Botão “Recarregar”**  
   Na UI, adiciona um botão que chama `reload()` do Context e volta a buscar dados.

2. **Mensagem de erro decente**  
   Em vez de `alert`, cria um componente simples `<ErrorBanner message="..." />`.

3. **Simular backend offline**  
   Desliga o backend e abre a app.  
   O que aparece? Onde é apanhado o erro? O que faz `error` no Provider?

4. **Validar no frontend**  
   Antes de chamar `addFavorite`, garante que o id é número (`Number(id)`).  
   (Em projetos maiores, isto evita muitos 422.)

5. **Endpoint extra no backend** (opcional)  
   Implementa `DELETE /api/favorites` para limpar tudo e testa com curl.

---

## 17) Perguntas de revisão

1. Porque é que precisamos de CORS?

2. Qual a diferença entre `400` e `422`?

3. O que é prop drilling e como o Context resolve?

4. O que faz `Promise.all` e porque é útil?

5. Porque é que nesta ficha os favoritos não “persistem” quando reinicias o backend?

---

## 18) Checklist de entrega (para trabalhos de grupo)

Se isto fosse um mini-projeto a entregar, eu esperava:

- Frontend arranca com `cd frontend`, `npm install` e `npm run dev`.
- Backend arranca com `cd backend` e `node src/server.js` (ou `npm run dev`/`npm start` se os scripts existirem).
- Sem erros na consola ao abrir a home.
- Favoritos funcionam em lista, detalhes e página de favoritos.
- Reiniciar backend volta favoritos ao array inicial (comportamento esperado desta ficha).
- Código organizado por pastas (services/context/routes).
- Mensagens de commit (se estiverem a usar Git) descritivas.

---

Fim.

![Footer](../../Images/Footer.png)
