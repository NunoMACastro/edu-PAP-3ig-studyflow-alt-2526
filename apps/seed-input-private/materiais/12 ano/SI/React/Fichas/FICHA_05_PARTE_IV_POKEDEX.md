![Header](../../Images/Header.png)

# Tutorial passo a passo - Pokédex v4 (Tutorial 02 - Parte 4) (12.º ano)

Esta é a Tutorial 02 - Parte 4.
Continua na Tutorial 02 - Parte 5.

Este tutorial continua diretamente a Tutorial 02 - Parte 3.
A app mantém o visual, a navegação e as páginas principais - ou seja, o aluno não começa do zero e não perde o trabalho anterior.
Home/Details/Favorites continuam a funcionar como antes (mesma UX), mas agora com sessão e base de dados.

O foco desta ficha não é criar uma app “maior”. É tornar a mesma app real, com as preocupações que existem fora da sala de aula:

- Persistência real: o que guardavas em memória passa para MongoDB Atlas
- Sessão real: o utilizador passa a ter conta e login:
    - `POST /api/auth/register`
    - `POST /api/auth/login`
    - `GET /api/auth/me`
    - `POST /api/auth/logout`
- JWT guardado em cookie HttpOnly

Segurança web real:

- Configurar CORS para permitir credenciais
- Implementar CSRF para proteger mutações (POST/DELETE/etc.)

Organização profissional no frontend:

- pages/ para rotas (componentes que representam páginas)
- components/ para UI reutilizável
- services/ para centralizar toda a comunicação com a API

Integração completa:

- rotas protegidas
- sessão restaurada ao fazer refresh
- login/registo com favoritos por utilizador

> Nesta ficha não estamos a “inventar novas features” ao acaso.
> Estamos a fazer o que os programadores fazem em projetos reais:
> refactor, integração, segurança, persistência, e código organizado.
> No fim, vais ter uma Pokédex fullstack que funciona como uma aplicação real. Espero eu... :D

## 0) O que vais construir e o que muda vs Tutorial 02 - Parte 3

### O que é

A Tutorial 02 - Parte 4 pega no **código final da Tutorial 02 - Parte 3** e evolui a app para uma versão com autenticação, persistência em MongoDB e favoritos por utilizador.

### Teoria

1. **Conceitos-chave**

- **SPA (Single Page Application)**: a página não recarrega por completo em cada ação; o JavaScript atualiza só partes do ecrã.
- **Frontend vs Backend**: o frontend trata da interface e experiência do utilizador; o backend trata de regras, segurança e dados.
- **Contrato de API**: é um acordo fixo sobre endpoints, formatos de pedido e resposta.
- **Continuidade entre fichas**: não começamos do zero; evoluímos uma base existente sem partir comportamento já validado.

2. **Como funciona**

- Numa SPA, quando clicas numa rota, o React Router troca componentes sem fazer novo pedido HTML ao servidor.
- Quando precisas de dados, o frontend faz pedidos HTTP ao backend (por exemplo `GET /api/favorites`).
- O backend recebe pedido, valida, consulta dados e devolve resposta com status code e JSON.
- Se o contrato mudar a meio (ex.: shape da resposta), a UI deixa de interpretar corretamente e “parece que está tudo certo” mas falha em runtime.

3. **Porque estamos a fazer assim neste projeto**

- Esta secção existe para fixar que a Tutorial 02 - Parte 4 é evolução da Tutorial 02 - Parte 3.
- Mantemos os contratos estáveis para poderes focar nas novidades (auth, Mongo, CSRF, upload) sem debugging desnecessário.
- A separação clara frontend/backend evita misturar responsabilidades e facilita testes por camada.

4. **Erros comuns e sintomas**

- Mudar endpoint sem atualizar service -> botões deixam de funcionar com erro 404/405.
- Alterar shape da resposta sem querer -> `undefined` no frontend quando tenta ler dados.
- “Funciona no Postman, não funciona na app” -> chamada da SPA vai para URL diferente da esperada.
- Recomeçar projeto em vez de evoluir -> perdes compatibilidade e ficas com versões paralelas.

5. **Boas práticas e segurança**

- Contratos estáveis reduzem risco de regressões silenciosas.
- Separar camadas ajuda a limitar impacto de erros de segurança.
- Manter nomenclatura consistente de rotas e pastas reduz enganos humanos.

### Porque fazemos isto

Na Tutorial 02 - Parte 3 tinhas favoritos em memória e frontend/backend já separados. Agora vais fechar o ciclo real de uma SPA fullstack:

- sessão com cookies HttpOnly
- proteção CSRF para mutações
- dados por utilizador na base de dados
- frontend organizado por responsabilidade (`pages` vs `components`)

### Contratos obrigatórios desta ficha

#### Favorites (compatível com Tutorial 02 - Parte 3)

| Método | Endpoint             | Body               | Resposta           |
| ------ | -------------------- | ------------------ | ------------------ |
| GET    | `/api/favorites`     | -                  | `number[]`         |
| POST   | `/api/favorites`     | `{ "id": number }` | `{ "id": number }` |
| DELETE | `/api/favorites/:id` | -                  | `{ "id": number }` |

Mesmo guardando no Mongo/User internamente, para o frontend o contrato mantém-se: `GET -> number[]`.

> Não uses variantes alternativas. Este contrato é único em toda a Tutorial 02 - Parte 4.

### Checkpoint 0

- O projeto da Tutorial 02 - Parte 3 arranca em duas janelas:
    - `backend/` com `node src/server.js` (ou `npm run dev`, se já tiveres script)
    - `frontend/` com `npm run dev`
- A rota `GET http://localhost:3000/api/favorites` ainda responde (estado base da Tutorial 02 - Parte 3).

### 0.1) Ordem de execução (fluxo recomendado)

Objetivo: reduzir erros por passos fora de ordem.

1. Configurar `.env` no backend.
2. Ligar MongoDB (fail fast no arranque).
3. Implementar auth + cookies + CSRF.
4. Atualizar favorites para “por utilizador”.
5. (Tutorial 02 - Parte 5) Criar teams + upload de avatar.
6. Refactor do frontend (pages, services, context, router).

### 0.2) Checkpoints obrigatórios (versão rápida)

- Checkpoint 2: backend arranca com Mongo e `JWT_SECRET`.
- Checkpoint 3: `register/login/me/logout` funcionam e cookies são enviados.
- Checkpoint 4: favorites funcionam por utilizador.
- Checkpoint 6: Axios com `withCredentials` e CSRF automático.
- Checkpoint 7: `authReady` evita redirect prematuro.

> Nota: se te faltar alguma rota nesta fase, usa os stubs da secção **3.5.1** para o backend arrancar.

---

## 1) Pré-requisitos e estrutura final (backend + frontend)

Antes de mudar código, fixamos a estrutura final alvo para evitar imports partidos e passos fora de ordem.

### Teoria

1. **Conceitos-chave**

- **Estrutura de projeto**: organização física dos ficheiros para refletir responsabilidades.
- **`pages` vs `components`**: `pages` são ecrãs ligados ao router; `components` são peças reutilizáveis.
- **`services` layer**: funções de acesso a API, para não espalhar requests pelos componentes.
  **Recordando o que são APIs:** contratos de comunicação entre frontend e backend, definidos por endpoints, métodos HTTP, formatos de pedido e resposta. Ou seja, a forma como o frontend e o backend “conversam” entre si. Estes contratos devem ser estáveis para evitar erros silenciosos de comunicação. Por exemplo, se o backend muda a resposta de `GET /api/favorites` de `number[]` para `{ favorites: number[] }`, o frontend que espera um array direto vai falhar ao tentar ler a resposta.
- **`.env`, `.env.example`, `.gitignore`**: configuração local, exemplo versionado e proteção de segredos.
  **Recordando o que são variáveis de ambiente:** são pares chave-valor usados para configurar a aplicação sem hardcode. O `.env` é o ficheiro local que não deve ser versionado (contém segredos); o `.env.example` é um modelo que mostra quais variáveis são necessárias, mas sem valores reais; o `.gitignore` impede que o `.env` e outros ficheiros sensíveis sejam acidentalmente comitados para o repositório.

2. **Notas**

- O bundler (Vite) resolve imports com base em paths e alias (`@`).
- Se moveres ficheiros sem atualizar imports, o build falha com “module not found”.
- `.env` é lido em runtime/build conforme a ferramenta; `.env.example` serve de checklist de variáveis.
- `gitignore` impede segredos e artefactos locais de entrarem no repositório. Na pasta do `git`tens um template de `.gitignore` que já inclui `node_modules/` e outros padrões comuns.

3. **Porque estamos a fazer assim neste projeto**

- O projeto vai crescer com auth, equipas e perfil; sem estrutura clara, a manutenção fica caótica.
- A separação `backend/` e `frontend/` torna comando, dependência e debug muito mais previsíveis.
- O refactor `pages/components` prepara terreno para rotas protegidas e layout composto.

4. **Erros comuns e sintomas**

- Import quebrado após `mv` -> erro no Vite ao arrancar.
- `@` não configurado -> imports absolutos deixam de resolver.
- `.env` com segredo no Git -> risco de exposição acidental.
- ficheiro em `components/` tratado como rota -> acoplamento desnecessário e confusão.

5. **Boas práticas e segurança**

- Usa naming previsível (`*.routes.js`, `*Api.js`, `*Page.jsx`).
- Mantém `pages` focadas em composição de ecrã e fluxo; lógica de API nos `services`.
  **Estrutura visual das responsabilidades:**

```txt
pages/ -> composição de ecrã, ligação ao router, estado local específico da página. Por exemplo, `LoginPage.jsx` é responsável por mostrar o formulário de login e lidar com o processo de autenticação, mas não deve conter lógica de chamadas à API ou componentes reutilizáveis. Mas não é o componente que cria o formulário em si; isso é trabalho de um componente separado.
components/ -> UI reutilizável, sem dependências de rota ou API. Por exemplo, `LoginForm.jsx` é um componente que só se preocupa com a apresentação do formulário e a captura de eventos, sem saber nada sobre como o login é processado ou quais endpoints são chamados.
services/ -> funções de acesso a API, sem UI ou lógica de estado. Por exemplo, `authApi.js` contém funções como `login`, `register`, `logout`, que fazem chamadas HTTP para o backend, mas não sabem nada sobre como os dados são usados ou apresentados.
```

- Nunca versionar credenciais reais; usar sempre `.env.example` como contrato de configuração.

### Estado inicial esperado (Fim da Tutorial 02 - Parte 3)

A Tutorial 02 - Parte 4 integra-se sobre o estado final da Tutorial 02 - Parte 3.

Estado final da Tutorial 02 - Parte 3 (estrutura de pastas e ficheiros):

```text
frontend/
  public/
  src/
    components/
      ErrorMessage.jsx
      FavoritesPage.jsx
      Layout.jsx
      LoadingSpinner.jsx
      NotFound.jsx
      PokemonCard.jsx
      PokemonDetailsPage.jsx
      PokemonListPage.jsx
      SearchBar.jsx
      typeData.js
      TypeFilter.jsx
    context/
      PokedexContext.jsx
    services/
      favoritesApi.js
      pokeApi.js
    styles/
      index.css
    App.jsx
    main.jsx

backend/
  src/
    routes/
      favorites.routes.js
    app.js
    server.js
  package.json
```

### 1.1) Criar a v4 (cópia da v3)

Objetivo: garantir que não perdes o estado final da Tutorial 02 - Parte 3 ao iniciar a Tutorial 02 - Parte 4.

Copia a pasta do projeto da Tutorial 02 - Parte 3 para uma nova pasta chamada, por exemplo, `pokedex-v4`.

Dentro de `pokedex-v4`, mantém as duas pastas:

frontend

backend

> Dica rápida: se te perderes no terminal, usa `pwd` para ver onde estás.
> Para subir uma pasta, usa `cd ..`.

Se quiseres usar o git, inicia um novo repositório dentro de `pokedex-v4` e clona o código da Tutorial 02 - Parte 3 como commit inicial. Assim, podes fazer commits incrementais à medida que avanças na Tutorial 02 - Parte 4.

### Estrutura final que vamos construir nesta ficha

```text
backend/
  .env
  .env.example
  package.json
  uploads/
    .gitkeep
  src/
    app.js
    server.js
    db/
      connect.js
    middlewares/
      requireAuth.js
      requireCsrf.js
    models/
      User.js
      Team.js
    routes/
      auth.routes.js
      favorites.routes.js
      teams.routes.js
      users.routes.js
    utils/
      cookies.js
      csrf.js

frontend/
  .env
  .env.example
  package.json
  src/
    App.jsx
    main.jsx
    context/
      PokedexContext.jsx
    pages/
      PokemonListPage.jsx      (Home)
      PokemonDetailsPage.jsx   (Details)
      FavoritesPage.jsx        (Favoritos)
      TeamsPage.jsx            (Equipas)
      ProfilePage.jsx          (Perfil)
      LoginPage.jsx            (Login)
      RegisterPage.jsx         (Registo)
      NotFound.jsx             (NotFound)
    components/
      Layout.jsx
      ProtectedRoute.jsx
      PokemonCard.jsx
      SearchBar.jsx
      TypeFilter.jsx
      LoadingSpinner.jsx
      ErrorMessage.jsx
      typeData.js
    services/
      apiClient.js
      authApi.js
      favoritesApi.js
      teamsApi.js
      usersApi.js
      pokeApi.js
```

### Checkpoint 1

- Tens as pastas da Tutorial 02 - Parte 3 `backend/` e `frontend/` na raiz do projeto.
- O alias `@` continua ativo no frontend (confirmar em `frontend/vite.config.js`).

---

## 2) Backend: setup, env e ligação MongoDB Atlas

### O que é

Vamos preparar o backend para usar MongoDB Atlas e configuração por variáveis de ambiente.

### Teoria

1. **Conceitos-chave**

- **Bootstrap do servidor**: sequência de arranque antes de aceitar pedidos.
  O que é um bootstrap? É o processo inicial que a aplicação passa para se preparar antes de começar a aceitar pedidos. No nosso caso, isso inclui carregar variáveis de ambiente, estabelecer ligação à base de dados e só depois abrir a porta HTTP. O objetivo do bootstrap é garantir que tudo o que é crítico para o funcionamento da aplicação está pronto e validado antes de expor qualquer funcionalidade. É um esqueleto de preparação que garante que o ambiente está configurado corretamente e que os serviços essenciais estão disponíveis. Se algo falhar durante o bootstrap (como a ligação ao MongoDB), o processo deve terminar imediatamente para evitar um estado inconsistente onde o servidor está “up” mas não pode funcionar corretamente.
- **Fail fast**: se configuração crítica falhar, o processo termina cedo e com erro claro.
- **MongoDB Atlas**: base de dados gerida na cloud.
- **Mongoose**: camada ODM para mapear documentos Mongo em objetos JavaScript.
  **ODM:** Object Document Mapper, uma camada de abstração que facilita a interação com bases de dados NoSQL como o MongoDB, permitindo definir esquemas e modelos para os dados, e oferecendo métodos para criar, ler, atualizar e apagar documentos de forma mais intuitiva.

- **Modelos e esquemas**: definição de estrutura de dados e regras de validação. Um modelo é uma representação de uma coleção no MongoDB, enquanto um esquema define a estrutura dos documentos dentro dessa coleção, incluindo tipos de dados, validações e comportamentos personalizados. Por exemplo, um modelo `User` pode ter um esquema que define campos como `username`, `email`, `passwordHash`, e regras como “`email` deve ser único” ou “`username` deve ter entre 3 e 30 caracteres”. Primeiro definimos o esquema para garantir que os dados têm a forma correta, e depois criamos o modelo para interagir com a coleção correspondente no MongoDB.

Esquema do funcionamento do mongoDB com Mongoose:

```txt
1) Definir esquema (estrutura do documento)
2) Criar modelo (interface para a coleção)
3) Usar modelo para criar/ler/atualizar/apagar documentos
```

2. **Setup inicial e notas**

- `server.js` carrega variáveis de ambiente, liga à base de dados e só depois abre a porta.
- Se `MONGODB_URI` estiver em falta/inválida, `mongoose.connect` rejeita e o processo deve parar.
- Atlas exige credenciais corretas e origem/IP autorizado; falhas aqui parecem “backend caiu sem motivo”.
- No MongoDB, guardas documentos em coleções; não há tabelas/joins clássicos como num SQL tradicional.

3. **Porque estamos a fazer assim nesta ficha**

- Precisas de persistência real: sem Mongo, favoritos/equipas desaparecem ao reiniciar.
- Configuração por `.env` evita hardcode de segredos no código. Por exemplo, se colocares a connection string do MongoDB Atlas diretamente no código, corres o risco de expor essas credenciais se o código for partilhado ou versionado. Usar um `.env` permite manter esses valores fora do código e do repositório, reduzindo o risco de exposição acidental.
- Arranque controlado simplifica diagnóstico: se o servidor arranca, tens uma base mínima de confiança e sabes que qualquer erro posterior não deverá ser de configuração ou ligação à base de dados.

4. **Erros comuns e sintomas**

- Backend arranca e fecha logo -> connection string inválida.
- `MongoServerError: bad auth` -> utilizador/password Atlas errados.
- Timeout de ligação -> IP não autorizado ou rede bloqueada.
- `MONGODB_URI em falta` -> variável mal escrita no `.env`.

### 2.0) MongoDB Atlas: setup passo a passo

Se ainda não tens a base criada no Atlas, faz este fluxo uma vez:

1. **Criar conta e projeto**

- Entrar em https://www.mongodb.com/cloud/atlas
- Criar conta (ou login) e criar um **Project** (ex.: `Pokedex`).

2. **Criar cluster**

- Se já existir um cluster que não necessites, podes usar esse mesmo. Se não, criar um cluster gratuito (ex.: `Cluster0`).
- No menu lateral clica em **Clusters** -> **Build Cluster** -> escolher opção gratuita (Shared Cluster) -> criar cluster.
- Na janela seguinte clica em **Drivers** e depois de selecionar Node.js, fecha a janela (não é necessário copiar a URI agora, vamos configurar o cluster primeiro).

3. **Criar utilizador da base de dados**

- Ir a **Database & Network Access** -> **Add New Database User**.
- Definir `username` e `password` (guardar a password).
- Dar permissões de leitura/escrita (ex.: `Read and write to any database` para desenvolvimento).

4. **Autorizar IP (Network Access)**

- Ir a **Network Access** -> **IP Access List**.
- Adicionar o IP atual (opção do Atlas para IP atual).
- Para testes rápidos em casa/escola pode-se usar `0.0.0.0/0`, mas não é recomendado para produção.

5. **Obter a connection string**

- Voltar ao cluster -> **Connect** -> **Drivers** -> **Node.js**.
- Copiar a URI `mongodb+srv://...`.
- Substituir `<password>` pela password do utilizador criado.
- Confirmar o nome da base no fim da URI (nesta ficha usamos `pokedex_v4`).

6. **Colar no `.env` do backend**

- Em `backend/.env`, definir:
  `MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxxx.mongodb.net/pokedex_v4?retryWrites=true&w=majority`

---

### 2.1) Instalar dependências

- **Ponto de situação:** o backend já está estruturado e agora precisa das bibliotecas base da ficha.
- **Objetivo deste passo:** instalar dependências de runtime e desenvolvimento para auth, cookies, CSRF, Mongo e upload.
- **Validação rápida:** no fim, `npm run dev` no `backend/` arranca sem erro de módulo em falta.

No `backend/`:

```bash
# Executa estes comandos na pasta indicada imediatamente acima do bloco.
# Mantém a ordem dos comandos para evitar erros de setup.
npm install cors mongoose dotenv bcrypt jsonwebtoken cookie-parser multer
npm install -D nodemon
```

#### 2.1.1) Explicação das dependências

- `cors`: middleware para configurar Cross-Origin Resource Sharing, essencial para permitir que o frontend (em localhost:5173) se comunique com o backend (em localhost:3000) sem erros de CORS. Mais para a frente vamos ver a definição completa de CORS para permitir credenciais (cookies).

- `mongoose`: biblioteca ODM para MongoDB, que facilita a definição de esquemas e modelos, e a interação com a base de dados usando uma API mais intuitiva.

- `dotenv`: carrega variáveis de ambiente de um ficheiro `.env` para `process.env`, permitindo configurar o backend sem hardcode.

- `bcrypt`: biblioteca para hashing de passwords, usada para armazenar palavras-passe de forma segura no MongoDB.
  **hashing de passwords:** é o processo de transformar uma palavra-passe num valor fixo e irreversível usando um algoritmo de hash. O `bcrypt` é uma das bibliotecas mais populares para isso, pois inclui um fator de custo que torna o processo mais lento e resistente a ataques de força bruta. Ou seja, se alguém tentar adivinhar a palavra-passe, levará muito tempo para testar cada possibilidade, aumentando a segurança pois impede ataques automatizados e sequenciais.

    O processo normalmente é o seguinte:

    ```txt
    Login:
    1) O utilizador envia username e password.
    2) O backend encontra o user pelo username.
    3) O backend usa bcrypt.compare(password, user.passwordHash) para verificar se a palavra-passe é correta.

    Registo:
    1) O utilizador envia username, email e password.
    2) O backend gera um hash da palavra-passe com bcrypt.hash(password, saltRounds).
    3) O backend guarda o user com passwordHash no MongoDB.
    ```

    Ou seja, na base de dados, nunca guardamos a palavra-passe em texto claro. Guardamos apenas o hash, e para verificar a palavra-passe, usamos `bcrypt.compare` que faz o processo de hashing internamente e compara com o hash armazenado.

    Exemplo:

    Imagina que a password é `1234`. A password é passada para o `bcrypt.hash` que gera um hash como por exemplo `$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36S4Qn1j8a2uH0j0Q5e`. Esse hash é o que guardamos no MongoDB. Quando o utilizador tenta fazer login, ele envia `1234`, e o backend usa `bcrypt.compare('1234', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36S4Qn1j8a2uH0j0Q5e')`, que devolve `true` se a palavra-passe estiver correta. Ou seja, nunca ninguém nem nenhum processo/função tem acesso à palavra-passe original, apenas ao hash.

- `jsonwebtoken`: biblioteca para criar e verificar JSON Web Tokens (JWT), que serão usados para autenticação de sessão.

    **O que é um token** JWT? É um token assinado que contém informações (claims) sobre o utilizador, como `userId` e expiração. O backend gera o token no login e o envia para o cliente, que o guarda em cookie HttpOnly. Em pedidos subsequentes, o backend verifica o token para autenticar o utilizador.

    Por exemplo:

    ```txt
    Login:
    1) O utilizador envia username e password.
    2) O backend verifica as credenciais.
    3) O backend gera um JWT com jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' }).
    4) O backend envia o JWT num cookie HttpOnly.
    Pedidos subsequentes:
    1) O utilizador tenta fazer o login novamente ou aceder a uma rota protegida.
    2) O browser envia o cookie JWT automaticamente com o pedido.
    3) O backend usa jwt.verify(token, JWT_SECRET) para verificar a autenticidade do token e extrair o userId.
    4) Se o token for válido, o backend considera o utilizador autenticado e pode usar o userId para aceder dados específicos do utilizador.
    ```

    Mas o que é o segredo `JWT_SECRET`? É uma string que o backend usa para assinar os tokens. Se alguém tiver acesso a esse segredo, pode criar tokens falsos ou verificar tokens existentes, o que compromete a segurança da aplicação. Por isso, o `JWT_SECRET` deve ser mantido em segredo (por exemplo, num `.env` que não é versionado) e deve ser forte o suficiente para resistir a ataques de força bruta.

    Em concreto, o segredo é uma string (que deve ser aleatória e segura) que é usada pelo backend para verificar a autenticidade dos tokens JWT.
    A partir do momento em que um segredo é definido e usado para assinar tokens, qualquer alteração nesse segredo invalidará todos os tokens existentes, pois o backend não conseguirá verificar a assinatura dos tokens antigos. Por isso, é crucial escolher um segredo forte e mantê-lo consistente enquanto os tokens estiverem em uso.

- `cookie-parser`: middleware para ler cookies em pedidos HTTP, essencial para autenticação baseada em cookies.

    **O que é um cookie HttpOnly?** É um cookie que o JavaScript do lado do cliente não pode aceder, mas que o browser envia automaticamente em pedidos para o backend. Isso aumenta a segurança contra ataques de Cross-Site Scripting (XSS), pois mesmo que um atacante consiga injetar código malicioso na página, ele não pode ler o token de autenticação armazenado no cookie HttpOnly. O backend pode ler esse cookie usando `cookie-parser` e verificar a sessão do utilizador.

    Por exemplo, quando o backend responde a um pedido de login bem-sucedido, ele pode enviar um header `Set-Cookie: token=jwt_token_aqui; HttpOnly`. O browser então armazena esse cookie e o inclui automaticamente em todos os pedidos subsequentes para o mesmo domínio, permitindo que o backend autentique o utilizador sem que o JavaScript tenha acesso direto ao token.

    Em resumo, os cookies HttpOnly são uma medida de segurança importante para proteger tokens de autenticação contra acesso por scripts maliciosos, e `cookie-parser` é a ferramenta que permite ao backend ler esses cookies para autenticar os utilizadores.

- `multer`: middleware para lidar com uploads de ficheiros, usado para a funcionalidade de upload de avatar.

---

### 2.2) Criar `.env` e `.env.example`

- **Ponto de situação:** dependências instaladas; falta definir configuração local do backend.
- **Objetivo deste passo:** criar variáveis de ambiente reais (`.env`) e contrato de configuração (`.env.example`).

    Porque é que vamos criar 2 ficheiros `.env`?
    O ficheiro `.env` contém as variáveis de ambiente reais que a aplicação usa em runtime. Este ficheiro não deve ser versionado (adicionado ao Git) porque pode conter segredos sensíveis, como credenciais de base de dados e segredos JWT. Cada programador ou ambiente (desenvolvimento, produção, etc.) pode ter um ficheiro `.env` diferente com valores específicos para esse ambiente.
    O ficheiro `.env.example` é um modelo que mostra quais variáveis de ambiente são necessárias para a aplicação funcionar, mas sem valores reais. Este ficheiro é versionado no Git e serve como referência para outros programadores saberem quais variáveis precisam definir no seu próprio ficheiro `.env`. Assim, qualquer pessoa que clone o repositório pode copiar o `.env.example` para `.env` e preencher os valores corretos conforme necessário.

- **Ficheiros:** criar/editar `backend/.env`, `backend/.env.example` e confirmar `backend/.gitignore`.
- **Validação rápida:** backend lê `PORT`, `CLIENT_ORIGIN`, `MONGODB_URI` e `JWT_SECRET` sem fallback inesperado.

Cria o ficheiro `backend/.env`:

```env
# Porta onde o Express vai escutar pedidos HTTP no ambiente local.
PORT=3000
# Usado para distinguir comportamentos de desenvolvimento/produção (cookies, logs, etc.).
NODE_ENV=development
# Origem permitida no CORS para o frontend (tem de bater certo com o URL do Vite).
CLIENT_ORIGIN=http://localhost:5173
# Connection string do MongoDB Atlas (host + credenciais + nome da base de dados).
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxxx.mongodb.net/pokedex_v4?retryWrites=true&w=majority
# Segredo usado para assinar/verificar JWT; nunca publicar valor real no Git.
JWT_SECRET=troca_isto_por_um_seguro
```

Cria o ficheiro `backend/.env.example`:

```env
# Exemplo da porta local do backend.
PORT=3000
# Exemplo de ambiente (dev/prod).
NODE_ENV=development
# Exemplo da origem do frontend permitida pelo CORS.
CLIENT_ORIGIN=http://localhost:5173
# Exemplo de URI do Atlas (substituir USER/PASSWORD por credenciais reais locais).
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxxx.mongodb.net/pokedex_v4?retryWrites=true&w=majority
# Exemplo de segredo JWT (no projeto real deve ser forte e privado).
JWT_SECRET=define_um_valor_seguro
```

Cria o ficheiro `backend/.gitignore` e cola o conteúdo que está no template na pasta `Git/`

### 2.3) Ligar ao MongoDB

- **Ponto de situação:** configuração pronta; agora falta fechar o bootstrap do servidor.
- **Objetivo deste passo:** ligar ao Mongo antes de abrir a porta HTTP (fail-fast no arranque).
- **Ficheiros:** editar/criar `backend/src/db/connect.js` e `backend/src/server.js`.
- **Validação rápida:** se a URI estiver correta, aparece log de ligação; se faltar config, o processo termina com erro explícito.

Cria o ficheiro (e as pastas) `backend/src/db/connect.js`:

```js
/**
 * Ficheiro: backend/src/db/connect.js
 * Objetivo: centralizar ligação ao MongoDB e falhar cedo quando faltar configuração crítica.

 */

import mongoose from "mongoose";

/**
 * Liga a aplicação ao MongoDB Atlas antes do backend aceitar pedidos.
 *
 * @returns {Promise<void>}
 * @throws {Error} Quando MONGODB_URI não existe.
 */
export async function connectToMongo() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        // Falha explícita para evitar servidor "meio vivo" sem base de dados.
        throw new Error("MONGODB_URI em falta no backend/.env");
    }

    // Se a URI estiver inválida ou o Atlas rejeitar, esta Promise rejeita e o bootstrap trata.
    await mongoose.connect(uri);
    console.log("[mongo] ligado com sucesso");
}
```

Cria o ficheiro `backend/src/server.js`:

```js
/**
 * Ficheiro: backend/src/server.js
 * Objetivo: arrancar o backend pela ordem correta (env -> mongo -> listen).

 */

import "dotenv/config";
import app from "./app.js";
import { connectToMongo } from "./db/connect.js";

const port = Number(process.env.PORT ?? 3000);

/**
 * Garante que variáveis críticas existem antes de ligar serviços externos.
 *
 * @returns {void}
 * @throws {Error}
 */
function assertRequiredEnv() {
    const required = ["MONGODB_URI", "JWT_SECRET"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Variáveis em falta no backend/.env: ${missing.join(", ")}`,
        );
    }
}

/**
 * Bootstrap da aplicação.
 *
 * @returns {Promise<void>}
 */
async function bootstrap() {
    // Fail fast: se faltar configuração crítica, não abrimos a porta HTTP.
    assertRequiredEnv();

    // Fail fast: se Mongo falhar, não abrimos a porta HTTP.
    await connectToMongo();

    app.listen(port, () => {
        console.log(`[server] http://localhost:${port}`);
    });
}

bootstrap().catch((err) => {
    // Erro fatal de arranque: termina o processo para evitar estado inconsistente.
    console.error("[fatal] falha ao arrancar", err);
    process.exit(1);
});
```

### Checkpoint 2

- `npm run dev` no backend arranca sem erro de `MONGODB_URI` e de `JWT_SECRET`.
- Se o Atlas estiver mal configurado, o backend falha no arranque.

### Erros comuns (env + Mongo)

- `MONGO_URI` em vez de `MONGODB_URI`.
- `JWT_SECRECT` (typo) em vez de `JWT_SECRET`.
- IP não autorizado no Atlas (Network Access).
- User/password errados na connection string.
- Falta de `dotenv/config` no `server.js`.

---

## 3) Backend: auth (register/login/logout), cookies, CSRF e CORS

### O que é

Nesta secção criamos sessão com JWT em cookie HttpOnly e proteção CSRF nas mutações.

### Teoria

1. **Conceitos-chave**

- **Autenticação**: provar quem és (login).
- **Autorização**: decidir o que podes fazer (acesso a recursos).
  **Nota**: Tem atenção à diferença entre autenticação e autorização. Autenticação é o processo de verificar a identidade do utilizador, geralmente através de um login com credenciais (como username e password). Já a autorização é o processo de determinar quais recursos ou ações esse utilizador autenticado tem permissão para aceder ou executar. Por exemplo, um utilizador pode ser autenticado com sucesso (a sua identidade é verificada), mas pode não ter autorização para aceder certos dados ou realizar certas ações, dependendo das regras de acesso definidas no backend.
- **JWT**: token assinado, não encriptado; contém claims (ex.: `userId`, expiração).
- **Cookie HttpOnly**: cookie que JavaScript não consegue ler, mas o browser envia automaticamente.
- **CORS**: política de origens para pedidos entre frontend e backend em hosts/portas diferentes.

    Mas o que é CORS? CORS, ou Cross-Origin Resource Sharing, é um mecanismo de segurança implementado pelos browsers para controlar como recursos numa página web podem ser solicitados a partir de um domínio diferente daquele que serviu a página. Por exemplo, se o frontend está a ser executado em `http://localhost:5173` e o backend em `http://localhost:3000`, isso é considerado um pedido cross-origin. Pois apesar de estarmos no mesmo localhost, as portas diferentes fazem com que sejam consideradas origens distintas. Para permitir que o frontend se comunique com o backend sem ser bloqueado por políticas de CORS, o backend precisa incluir headers específicos (como `Access-Control-Allow-Origin`) que autorizem essa comunicação. No nosso caso, vamos configurar o backend para permitir pedidos do frontend usando CORS, garantindo que os pedidos sejam aceites e os cookies sejam enviados corretamente.

- **CSRF**: ataque que explora o envio automático de cookies em pedidos mutáveis. (definição mais à frente)

    Mas o que é o CSRF? CSRF, ou Cross-Site Request Forgery, é um tipo de ataque onde um atacante engana um utilizador autenticado para fazer um pedido indesejado a um site em que ele está autenticado. Por exemplo, se um utilizador está autenticado no nosso site e visita um site malicioso, esse site pode tentar fazer um pedido POST para o nosso backend usando os cookies de sessão do utilizador. Como os cookies são enviados automaticamente pelo browser, o backend pode processar esse pedido como se fosse legítimo, o que pode levar a ações indesejadas, como alterar dados ou realizar operações em nome do utilizador sem o seu consentimento. Para proteger contra CSRF, implementamos medidas como o uso de tokens CSRF que devem ser incluídos em pedidos mutáveis (POST/PUT/PATCH/DELETE) e verificados pelo backend.

    Exemplo de ataque CSRF:

    ```txt
    1) O utilizador está autenticado no nosso site (cookie de sessão válido).
    2) O utilizador visita um site malicioso (ex: http://malicious.com).
    3) O site malicioso tem um código que faz um pedido POST para o nosso backend (ex: http://localhost:3000/api/favorites) usando os cookies do utilizador.
    4) O backend recebe o pedido, vê o cookie de sessão válido e processa a ação (ex: adiciona um favorito), mesmo que o utilizador não tenha autorizado essa ação.
    ```

    **Como é que protegemos contra CSRF?** Usamos um token CSRF que é gerado pelo backend e enviado para o frontend (geralmente num cookie não HttpOnly). O frontend inclui esse token num header personalizado (ex: `X-CSRF-Token`) em pedidos mutáveis. O backend, ao receber o pedido, compara o token do header com o token armazenado no cookie. Se os tokens não coincidirem, o backend rejeita o pedido com um erro 403, protegendo assim contra ataques CSRF.

    Assim, basicamente ficamos com 2 tokens em cada pedido mutável:
    - O cookie HttpOnly com o JWT para autenticação.
    - O cookie não HttpOnly com o token CSRF, que o frontend lê e envia no header `X-CSRF-Token` para o backend verificar.

2. **Como funciona**

- No login/register, o backend cria JWT e envia em `Set-Cookie`.
- Em pedidos seguintes, o browser anexa o cookie automaticamente ao backend dessa origem.
- `requireAuth` lê cookie e faz `jwt.verify`; se falhar, devolve 401.
- Para CSRF, usa-se **double submit cookie pattern**: backend envia `csrfToken` (não HttpOnly), frontend lê e manda no header `X-CSRF-Token`; backend compara cookie/header.
- Métodos seguros (`GET/HEAD/OPTIONS`) não alteram estado e passam sem token CSRF.
- Preflight `OPTIONS` acontece antes de algumas mutações cross-origin e precisa de CORS coerente.

```txt
Login -> backend cria JWT -> Set-Cookie: token (HttpOnly)
      -> backend cria csrfToken -> Set-Cookie: csrfToken (não HttpOnly)

Pedidos seguintes:
- Browser envia cookies automaticamente
- Frontend lê csrfToken e envia header X-CSRF-Token
- Backend compara cookie csrfToken vs header X-CSRF-Token
```

3. **Porque estamos a fazer assim neste projeto**

- Cookies HttpOnly reduzem impacto de XSS (token não fica exposto ao JavaScript da página).
- Como cookies são automáticos, precisas de proteção CSRF explícita nas mutações.
- `auth/me` permite restaurar sessão após refresh sem guardar token manualmente.
- Guard global de CSRF após `/api/auth` simplifica proteção de recursos restantes.

4. **Erros comuns e sintomas**

- Login 200 mas sessão não persiste -> faltou `withCredentials` no cliente.
- Erro CORS no browser sem status útil -> `origin`/`credentials` mal configurados.
- 403 em POST/DELETE -> header `X-CSRF-Token` ausente ou diferente do cookie.
- 401 em rota protegida com cookie presente -> JWT expirado/inválido ou `JWT_SECRET` mudou.
- Logout “não limpa” -> opções de `clearCookie` não compatíveis com cookie original.

| Status | Leitura rápida                                  |
| ------ | ----------------------------------------------- |
| 401    | sem sessão / token inválido                     |
| 403    | CSRF inválido (ou pedido recusado por política) |
| 422    | payload inválido (cliente corrige)              |
| 404    | recurso não existe                              |

5. **Boas práticas e segurança**

- Não usar `origin: *` com credenciais.
- Distinguir claramente 401 (não autenticado) de 403 (proibido/CSRF inválido).
- `SameSite` e `Secure` devem ser ajustados ao ambiente (dev/prod).
- Não guardar password nem token em logs.
- Tratar `JWT_SECRET` como segredo sensível.

> Nota rápida (dev vs prod): em produção, `secure: true` exige HTTPS; em dev (`http`) pode bloquear cookies, por isso controlamos pelo `NODE_ENV`.

### Porque importa (porque fazemos isto)

Com cookies, o browser envia credenciais automaticamente. Isso pede duas coisas obrigatórias:

1. CORS com `credentials: true`
2. proteção CSRF para `POST/PUT/PATCH/DELETE`

- Backend: `cors({ origin: CLIENT_ORIGIN, credentials: true })`
- Frontend: `axios.create({ withCredentials: true })`

Se faltar uma destas duas peças, o login pode “parecer” funcionar mas a sessão não persiste.

### 3.0) Mapa mental Auth + Cookies + CSRF + CORS

Aqui está um resumo visual do fluxo de autenticação e proteção CSRF.
Basicamente o user faz login (1), o frontend pede dados do user (2), e depois faz mutações protegidas (3).

> mutações = pedidos que alteram estado (POST/PUT/PATCH/DELETE)
> Por exemplo, `GET /api/auth/me` é uma leitura que não altera estado, então não precisa de token CSRF. Já `POST /api/favorites` é uma mutação que altera os favoritos do utilizador, então precisa de proteção CSRF.

```txt
(1) POST /api/auth/login
    -> Set-Cookie: token (HttpOnly)
    -> Set-Cookie: csrfToken (não HttpOnly)

(2) GET /api/auth/me
    -> cookie token é enviado automaticamente
    -> requireAuth valida JWT

(3) POST /api/favorites
    -> cookie token + cookie csrfToken + header X-CSRF-Token
    -> requireAuth + requireCsrf
```

### Passos

### 3.1) Modelo User + utils (cookies/csrf)

- **Ponto de situação:** já tens o mapa mental de auth; agora vamos criar o modelo de utilizador e utilitários para cookies e CSRF.
- **Objetivo deste passo:** definir o modelo de utilizador e preparar base para sessão/favoritos/avatar.
- **Ficheiros:** criar/editar `backend/src/models/User.js`.
- **Validação rápida:** o modelo inclui `passwordHash`, `favorites`, `avatarUrl` e remove `passwordHash` no `toJSON`.

Cria o ficheiro `backend/src/models/User.js`:

```js
/**
 * Ficheiro: backend/src/models/User.js
 * Objetivo: definir o schema do utilizador (credenciais, favoritos e avatar) e esconder `passwordHash` no JSON de resposta.
 * Este ficheiro existe aqui para sustentar auth, favorites e perfil nas secções seguintes.

 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        favorites: {
            type: [Number],
            default: [],
        },
        avatarUrl: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.passwordHash;
                return ret;
            },
        },
    },
);

const User = mongoose.model("User", userSchema);

export default User;
```

#### 3.1.1) Utils de cookies e CSRF

- **Ponto de situação:** o modelo está definido; agora precisas de utilitários para cookies e token CSRF.
- **Objetivo deste passo:** centralizar opções de cookies e geração de CSRF para evitar inconsistências.
- **Ficheiros:** criar/editar `backend/src/utils/cookies.js` e `backend/src/utils/csrf.js`.
- **Validação rápida:** há funções separadas para `authCookieOptions`, `csrfCookieOptions`, `clearCookieOptions` e `createCsrfToken`.

Criar ficheiro `backend/src/utils/cookies.js`:

```js
/**
 * Ficheiro: backend/src/utils/cookies.js
 * Objetivo: definir opções de cookies num único sítio para evitar inconsistências entre set/clear.

 */

const isProd = process.env.NODE_ENV === "production";

/**
 * Opções base partilhadas por todos os cookies da app.
 *
 * @returns {{path: string, sameSite: string, secure: boolean}}
 */
function baseCookieOptions() {
    return {
        // Manter o mesmo path é essencial para clearCookie funcionar corretamente.
        path: "/",
        sameSite: "lax",
        secure: isProd,
    };
}

/**
 * Cookie de autenticação (JWT).
 *
 * @returns {{path: string, sameSite: string, secure: boolean, httpOnly: boolean, maxAge: number}}
 */
export function authCookieOptions() {
    return {
        ...baseCookieOptions(),
        // HttpOnly protege token contra acesso direto via JavaScript no browser.
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    };
}

/**
 * Cookie CSRF (precisa de ser legível no frontend para enviar no header).
 *
 * @returns {{path: string, sameSite: string, secure: boolean, httpOnly: boolean, maxAge: number}}
 */
export function csrfCookieOptions() {
    return {
        ...baseCookieOptions(),
        // Não HttpOnly de propósito: o cliente lê este valor para X-CSRF-Token.
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    };
}

/**
 * Opções usadas ao limpar cookies; devem bater com as opções usadas no set.
 *
 * @returns {{path: string, sameSite: string, secure: boolean}}
 */
export function clearCookieOptions() {
    return {
        ...baseCookieOptions(),
    };
}
```

Criar ficheiro `backend/src/utils/csrf.js`:

```js
/**
 * Ficheiro: backend/src/utils/csrf.js
 * Objetivo: gerar token CSRF aleatório para o padrão double-submit-cookie.

 */

import crypto from "node:crypto";

/**
 * Gera um token CSRF em hexadecimal.
 *
 * @returns {string}
 */
export function createCsrfToken() {
    return crypto.randomBytes(24).toString("hex");
}
```

### 3.2) `requireAuth`

- **Ponto de situação:** já existe infraestrutura de token/cookies; agora falta proteger rotas privadas. Para isso vamos criar um middleware `requireAuth` que valida o JWT do cookie e expõe `req.auth.userId` para os handlers seguintes.
- **Objetivo deste passo:** validar JWT do cookie e expor `req.auth.userId` para as rotas seguintes.
- **Ficheiros:** criar/editar `backend/src/middlewares/requireAuth.js`.
- **Validação rápida:** sem cookie devolve `401`; com token válido passa no `next()`.

Cria o ficheiro `backend/src/middlewares/requireAuth.js`:

```js
/**
 * Ficheiro: backend/src/middlewares/requireAuth.js
 * Objetivo: proteger rotas privadas validando o JWT recebido via cookie HttpOnly.

 */

import jwt from "jsonwebtoken";

/**
 * Middleware de autenticação.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
export function requireAuth(req, res, next) {
    // O cookie "token" é enviado automaticamente pelo browser quando withCredentials=true.
    const token = req.cookies?.token;

    if (!token) {
        // 401 = não autenticado (sem sessão).
        return res.status(401).json({
            error: { code: "UNAUTHORIZED", message: "Sessão em falta" },
        });
    }

    try {
        // Verifica assinatura e expiração do JWT usando o segredo do backend.
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Guardamos o userId em req.auth para os handlers seguintes.
        req.auth = { userId: payload.userId };
        return next();
    } catch {
        // 401 novamente: token existe mas é inválido/expirado.
        return res.status(401).json({
            error: { code: "UNAUTHORIZED", message: "Sessão inválida" },
        });
    }
}
```

### 3.3) `requireCsrf` + preflight/CORS

- **Ponto de situação:** autenticação pronta; agora falta proteger mutações contra CSRF. Recordo que mutação é qualquer pedido que altera estado (POST/PUT/PATCH/DELETE). Para isso, vamos criar um middleware `requireCsrf` que compara o token do cookie com o token do header `X-CSRF-Token` e bloqueia pedidos mutáveis sem correspondência. Os métodos seguros (GET/HEAD/OPTIONS) passam sem exigir token CSRF, e o método `OPTIONS` é essencial para o preflight do CORS funcionar corretamente.
- **Objetivo deste passo:** exigir correspondência entre cookie CSRF e header `X-CSRF-Token` em métodos mutáveis.
- **Ficheiros:** criar/editar `backend/src/middlewares/requireCsrf.js`.
- **Validação rápida:** `GET` passa sem token; `POST/DELETE` sem token correto devolvem `403`.

Antes do snippet, fixa estas duas regras práticas:

- `OPTIONS` (preflight) deve passar para o browser conseguir avançar para a mutação real.
- CORS e CSRF resolvem problemas diferentes: CORS controla origem; CSRF valida intenção da mutação autenticada.

Criar ficheiro `backend/src/middlewares/requireCsrf.js`:

```js
/**
 * Ficheiro: backend/src/middlewares/requireCsrf.js
 * Objetivo: bloquear mutações sem prova CSRF (header + cookie a coincidir).

 */

// Métodos seguros não alteram estado e não exigem token CSRF.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Middleware CSRF (double submit cookie).
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
export function requireCsrf(req, res, next) {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    // Cookie vem automaticamente no pedido; header vem explicitamente do frontend.
    const csrfCookie = req.cookies?.csrfToken;
    const csrfHeader = req.get("x-csrf-token");

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        // 403 = pedido entendido, mas recusado por política de segurança.
        return res.status(403).json({
            error: { code: "CSRF_INVALID", message: "CSRF token inválido" },
        });
    }

    return next();
}
```

### 3.4) Rotas de autenticação (`register`/`login`/`me`/`logout`)

- **Ponto de situação:** middlewares prontos; agora montas o ciclo completo de sessão.
- **Objetivo deste passo:** implementar registo, login, sessão atual e logout com cookies.
- **Ficheiros:** criar/editar `backend/src/routes/auth.routes.js`.
- **Validação rápida:** `register/login` definem cookies, `me` devolve user autenticado e `logout` limpa sessão com CSRF válido.

Cria o ficheiro `backend/src/routes/auth.routes.js`:

```js
/**
 * Ficheiro: backend/src/routes/auth.routes.js
 * Objetivo: gerir ciclo de sessão (register/login/me/logout) com cookies e JWT.

 */

import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireCsrf } from "../middlewares/requireCsrf.js";
import {
    authCookieOptions,
    csrfCookieOptions,
    clearCookieOptions,
} from "../utils/cookies.js";
import { createCsrfToken } from "../utils/csrf.js";

const router = Router();
const SALT_ROUNDS = 10;

/**
 * Assina JWT com identificação mínima do utilizador.
 *
 * @param {string} userId
 * @returns {string}
 */
function signToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Normaliza email para evitar duplicados com maiúsculas/espaços.
 *
 * @param {unknown} email
 * @returns {string}
 */
function normalizeEmail(email) {
    return String(email ?? "")
        .trim()
        .toLowerCase();
}

/**
 * Validação de input para registo.
 *
 * @param {{username: unknown, email: unknown, password: unknown}} param0
 * @returns {string | null}
 */
function basicValidation({ username, email, password }) {
    if (!username || String(username).trim().length < 3) {
        return "Username deve ter pelo menos 3 caracteres";
    }

    if (!email || !normalizeEmail(email).includes("@")) {
        return "Email inválido";
    }

    if (!password || String(password).length < 6) {
        return "Password deve ter pelo menos 6 caracteres";
    }

    return null;
}

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body ?? {};
    const validationError = basicValidation({ username, email, password });

    if (validationError) {
        // 422 = estrutura do pedido válida, mas dados falham regras de negócio.
        return res.status(422).json({
            error: { code: "VALIDATION_ERROR", message: validationError },
        });
    }

    const normalizedEmail = normalizeEmail(email);
    const alreadyExists = await User.findOne({ email: normalizedEmail });

    if (alreadyExists) {
        // 409 = conflito com estado atual (email já existe).
        return res.status(409).json({
            error: { code: "DUPLICATE_EMAIL", message: "Email já registado" },
        });
    }

    // bcrypt é intencionalmente "lento" para dificultar brute force offline.
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        username: String(username).trim(),
        email: normalizedEmail,
        passwordHash,
    });

    const token = signToken(user.id);
    const csrfToken = createCsrfToken();

    // token -> HttpOnly; csrfToken -> legível para o frontend (header CSRF).
    res.cookie("token", token, authCookieOptions());
    res.cookie("csrfToken", csrfToken, csrfCookieOptions());

    return res.status(201).json({ user });
});

router.post("/login", async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? "");

    if (!email || !password) {
        // 422 para payload incompleto.
        return res.status(422).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Credenciais inválidas",
            },
        });
    }

    const user = await User.findOne({ email });

    if (!user) {
        // 401 não revela se o email existe ou não (evita enumeração fácil).
        return res.status(401).json({
            error: { code: "INVALID_CREDENTIALS", message: "Login inválido" },
        });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
        return res.status(401).json({
            error: { code: "INVALID_CREDENTIALS", message: "Login inválido" },
        });
    }

    const token = signToken(user.id);
    const csrfToken = createCsrfToken();

    res.cookie("token", token, authCookieOptions());
    res.cookie("csrfToken", csrfToken, csrfCookieOptions());

    return res.status(200).json({ user });
});

router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findById(req.auth.userId);

    if (!user) {
        // Pode acontecer se conta foi apagada depois do token ter sido emitido.
        return res.status(404).json({
            error: { code: "USER_NOT_FOUND", message: "Utilizador não existe" },
        });
    }

    return res.status(200).json({ user });
});

router.post("/logout", requireAuth, requireCsrf, (_req, res) => {
    // Clear usa as mesmas opções-base para garantir que o browser remove mesmo os cookies.
    res.clearCookie("token", clearCookieOptions());
    res.clearCookie("csrfToken", clearCookieOptions());
    return res.status(200).json({ ok: true });
});

export default router;
```

### 3.5) `app.js` com CORS, cookies e ordem correta de middlewares

- **Ponto de situação:** já tens rotas/middlewares; falta compor tudo na pipeline do Express.
- **Objetivo deste passo:** aplicar ordem correta (CORS -> parsers -> rotas -> CSRF global -> handlers finais).
- **Ficheiros:** editar `backend/src/app.js`.
- **Validação rápida:** `GET /api/health` responde, auth funciona, mutações fora de `/api/auth` exigem CSRF.

### 3.5.1) Compatibilidade durante a migração (evitar imports partidos)

Se ainda **não** criaste `teams.routes.js` e `users.routes.js` (secção 4), cria stubs temporários para o backend arrancar já nesta fase:

`backend/src/routes/teams.routes.js`:

```js
import { Router } from "express";
const router = Router();
router.get("/", (_req, res) =>
    res.status(501).json({
        error: {
            code: "NOT_READY",
            message: "Secção 4 ainda não aplicada",
        },
    }),
);
export default router;
```

`backend/src/routes/users.routes.js`:

```js
import { Router } from "express";
const router = Router();
router.post("/avatar", (_req, res) =>
    res.status(501).json({
        error: {
            code: "NOT_READY",
            message: "Secção 4 ainda não aplicada",
        },
    }),
);
export default router;
```

> Na secção 4, estes stubs são substituídos pelos ficheiros finais.
> Stubs são uma prática comum para manter o backend funcional durante a migração, evitando erros de importação e permitindo que testes e desenvolvimento continuem sem bloqueios.

`backend/src/app.js`:

```js
/**
 * Ficheiro: backend/src/app.js
 * Objetivo: montar a pipeline do Express na ordem certa (CORS -> parsers -> rotas -> 404 -> erros).

 */

import express from "express";
import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import teamsRoutes from "./routes/teams.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { requireCsrf } from "./middlewares/requireCsrf.js";

const app = express();
const uploadsDir = path.join(process.cwd(), "uploads");

// CORS tem de vir cedo para responder corretamente a preflight e pedidos cross-origin.
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
        // Sem credentials=true os cookies de sessão não viajam entre frontend e backend.
        credentials: true,
    }),
);
// Parser de JSON para req.body em endpoints application/json.
app.use(express.json());
// Parser de cookies para req.cookies (necessário em auth/csrf).
app.use(cookieParser());
// Ficheiros estáticos de avatar servidos em /uploads/...
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

// Login/register/me não passam no guard global de CSRF.
app.use("/api/auth", authRoutes);

// A partir daqui, todas as mutações exigem X-CSRF-Token válido.
app.use(requireCsrf);

app.use("/api/favorites", favoritesRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/users", usersRoutes);

app.use((_req, res) => {
    res.status(404).json({
        error: { code: "NOT_FOUND", message: "Rota inexistente" },
    });
});

app.use((err, _req, res, next) => {
    if (!err) {
        return next();
    }

    if (res.headersSent) {
        return next(err);
    }

    const isUploadError =
        err.code === "LIMIT_FILE_SIZE" ||
        err.code === "LIMIT_UNEXPECTED_FILE" ||
        err.name === "MulterError";

    const status = err.status ?? (err.code === "LIMIT_FILE_SIZE" ? 413 : 400);

    const message =
        err.message || (isUploadError ? "Erro no upload" : "Pedido inválido");

    // ATENÇÃO (armadilha): erros de upload podem parecer "genéricos".
    // Nota: mantemos resposta curta aqui para ficar alinhada com o enunciado.
    return res.status(status).json({
        error: {
            code: isUploadError ? "UPLOAD_ERROR" : "BAD_REQUEST",
            message,
        },
    });
});

export default app;
```

### 3.6) Tabela de diagnóstico rápido (401/403/422/500)

| Status | Se isto acontecer...                      | Verifica primeiro...                            |
| ------ | ----------------------------------------- | ----------------------------------------------- |
| 401    | login parece feito mas rota privada falha | cookie `token`, `withCredentials`, `JWT_SECRET` |
| 403    | mutações falham (`POST`/`DELETE`)         | header `X-CSRF-Token` e cookie `csrfToken`      |
| 422    | backend recusa dados do formulário        | payload (campos obrigatórios, tipos, limites)   |
| 500    | erro interno inesperado                   | logs do backend + último request no Network     |

### Checkpoint 3

1. `POST /api/auth/register` cria utilizador e devolve `user`.
2. Browser/cliente recebe cookies `token` (HttpOnly) e `csrfToken`.
3. `GET /api/auth/me` devolve o utilizador autenticado.
4. `POST /api/auth/logout` só funciona com CSRF header válido.

Critérios binários de validação (debug guiado):

- Se `/api/auth/me` devolver `401`, verifica: cookie `token` presente + `withCredentials: true` + `JWT_SECRET` estável.
- Se qualquer mutação devolver `403`, verifica: cookie `csrfToken` presente + header `X-CSRF-Token` a coincidir.
- Se `logout` devolver `200` mas sessão continuar, verifica: `clearCookie` usa as mesmas opções-base do `res.cookie`.
- Se estiveres ainda com frontend da Tutorial 02 - Parte 3, é normal ver `403` em `POST/DELETE` até concluíres a secção 6
  (`apiClient` com `withCredentials` + header CSRF automático).

### Erros comuns (CORS/cookies/CSRF)

- `cors` sem `credentials: true`.
- frontend sem `withCredentials: true` no Axios.
- `CLIENT_ORIGIN` diferente da origem real do frontend.
- tentar mutações sem enviar `X-CSRF-Token`.
- limpar cookie com `path` diferente do usado no `res.cookie`.

---

## 4) Backend: modelos e rotas (users, favorites)

### O que é

Agora fechamos o recurso de favoritos por utilizador nesta ficha.

### Teoria

1. **Conceitos-chave**

- **Recurso**: entidade da API com identidade e regras (favorites, teams, users).
- **Validação**: verificar dados de entrada antes de persistir.
- **Conflito (409)**: pedido válido na forma, mas em choque com estado atual (ex.: favorito já existe).
- **Schema vs validação de rota**: schema garante integridade do modelo; rota devolve erros mais claros ao cliente.

2. **Como funciona “por baixo”**

- Favorites ficam no documento `User`, como array numérico.
- Teams guardam `userId`, nome e lista `pokemonIds`.
- Paginação usa `skip/limit`: “salta N e devolve M”.
- Pesquisa por `q` com `$regex` e `i` faz correspondência case-insensitive.
- Upload usa `multipart/form-data`: ficheiro vai em partes binárias, não em JSON puro.

3. **Porque estamos a fazer assim neste projeto**

- O contrato simples de favorites facilita compatibilidade com Tutorial 02 - Parte 3.
- Teams 1..6 reflete regra natural da Pokédex (equipa limitada).
- Upload de avatar fecha o ciclo de integração frontend/backend com ficheiros reais.
- Limitar `q` protege de regex demasiado pesada e pedidos abusivos.

4. **Erros comuns e sintomas**

- `422 id inválido` em favorites -> `id` veio string vazia/não inteiro.
- `409 Pokémon já é favorito` -> UI tentou adicionar duplicado.
- Team criada com IDs repetidos -> deduplicação ausente no cliente ou servidor.
- Upload devolve 413 -> ficheiro excede limite configurado.
- URL de avatar guarda path errado -> imagem não abre no browser.

5. **Boas práticas e segurança**

- Validar sempre no servidor, mesmo que frontend valide antes.
- Limitar tamanho de inputs (`q`, upload) para reduzir abuso.
- Não confiar apenas na extensão do ficheiro; tipo/mimetype também importa.
- Associar sempre dados ao `userId` autenticado para isolamento por utilizador.

6. **Mini-exemplos pedagógicos (isolados)**
    > Exemplo isolado - shape de paginação

```json
{
    "items": [],
    "total": 27,
    "page": 2,
    "limit": 6,
    "pages": 5
}
```

> Exemplo isolado - favorites canónico

```txt
POST /api/favorites  body { "id": 150 } -> { "id": 150 }
```

### Porque fazemos isto

A autenticação sem dados por utilizador não resolve o objetivo da app. Esta secção liga sessão + dados persistentes.

### 4.1) Contrato de favorites (único)

- **Ponto de situação:** sessão pronta; agora os dados devem ficar isolados por utilizador.
- **Objetivo deste passo:** manter contrato de favorites da ficha anterior com persistência no utilizador autenticado.
- **Ficheiros:** criar/editar `backend/src/routes/favorites.routes.js`.
- **Validação rápida:** `GET` devolve `number[]`, `POST`/`DELETE` devolvem `{ id }` e respeitam validações.

- `GET /api/favorites` -> `number[]`
- `POST /api/favorites` com body `{ "id": number }` -> `{ "id": number }`
- `DELETE /api/favorites/:id` -> `{ "id": number }`

`backend/src/routes/favorites.routes.js`:

```js
/**
 * Ficheiro: backend/src/routes/favorites.routes.js
 * Objetivo: gerir favoritos por utilizador mantendo contrato compatível com a Tutorial 02 - Parte 3.

 */

import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

/**
 * Converte input para inteiro positivo.
 *
 * @param {unknown} value
 * @returns {number | null}
 */
function parsePositiveInt(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return null;
    return n;
}

router.get("/", requireAuth, async (req, res) => {
    // GET devolve array de IDs, sem envelope adicional (contrato canónico da ficha).
    const user = await User.findById(req.auth.userId).select("favorites");

    if (!user) {
        return res.status(404).json({
            error: { code: "USER_NOT_FOUND", message: "Utilizador não existe" },
        });
    }

    return res.status(200).json(user.favorites);
});

router.post("/", requireAuth, async (req, res) => {
    const id = parsePositiveInt(req.body?.id);

    if (!id) {
        // 422 para body inválido (cliente consegue corrigir o pedido).
        return res.status(422).json({
            error: { code: "VALIDATION_ERROR", message: "id inválido" },
        });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
        return res.status(404).json({
            error: { code: "USER_NOT_FOUND", message: "Utilizador não existe" },
        });
    }

    if (user.favorites.includes(id)) {
        // 409 quando o mesmo favorito já existe.
        return res.status(409).json({
            error: { code: "DUPLICATE_KEY", message: "Pokémon já é favorito" },
        });
    }

    user.favorites.push(id);
    await user.save();

    return res.status(201).json({ id });
});

router.delete("/:id", requireAuth, async (req, res) => {
    const id = parsePositiveInt(req.params.id);

    if (!id) {
        // 400 porque o parâmetro de rota já é inválido à partida.
        return res.status(400).json({
            error: { code: "INVALID_ID", message: "id inválido" },
        });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
        return res.status(404).json({
            error: { code: "USER_NOT_FOUND", message: "Utilizador não existe" },
        });
    }

    if (!user.favorites.includes(id)) {
        return res.status(404).json({
            error: { code: "NOT_FOUND", message: "Favorito não existe" },
        });
    }

    user.favorites = user.favorites.filter((favId) => favId !== id);
    await user.save();

    return res.status(200).json({ id });
});

export default router;
```

### Checkpoint 4

- `GET /api/favorites` já devolve favoritos do utilizador autenticado.
- `POST /api/favorites` e `DELETE /api/favorites/:id` mantêm o contrato canónico.

### Mapa de migração (Checklist de integração)

| Categoria | Ficheiro/Pasta                                               | Onde colocar                                                            | Checkpoint         |
| --------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------ |
| MOVE      | `frontend/src/components/*Page.jsx` -> `frontend/src/pages/` | executar os `mv` da secção **5.1** (antes de atualizar imports)         | Checkpoint 5       |
| CREATE    | `frontend/src/pages/LoginPage.jsx`                           | criar ficheiro novo na secção **5.2**                                   | Checkpoint 5       |
| CREATE    | `frontend/src/pages/RegisterPage.jsx`                        | criar ficheiro novo na secção **5.2**                                   | Checkpoint 5       |
| CREATE    | `frontend/src/pages/TeamsPage.jsx`                           | criar ficheiro novo na secção **5.2**                                   | Checkpoint 8       |
| CREATE    | `frontend/src/pages/ProfilePage.jsx`                         | criar ficheiro novo na secção **5.2** e preencher na secção **9.1**     | Checkpoint 9       |
| EDIT      | `frontend/src/App.jsx`                                       | substituir/importar rotas conforme secções **5.3** e **8.3**            | Checkpoint 8       |
| EDIT      | `frontend/src/context/PokedexContext.jsx`                    | substituir conteúdo total na secção **7.1**                             | Checkpoint 7       |
| EDIT      | `frontend/src/services/apiClient.js`                         | criar no `services/` e adicionar bloco completo da secção **6.3**       | Checkpoint 6       |
| EDIT      | `backend/src/server.js`                                      | aplicar bloco completo da secção **2.3** no ficheiro existente          | Checkpoint 2       |
| EDIT      | `backend/src/app.js`                                         | aplicar bloco completo da secção **3.5** mantendo ordem de middlewares  | Checkpoint 3       |
| VERIFY    | `frontend` + `backend` a correr em paralelo                  | validar health/auth/favoritos/equipas/avatar pela ordem dos checkpoints | Checkpoints 2 -> 9 |

---

## 5) Frontend: refactor obrigatório para pages/components

### O que é

Esta etapa separa ficheiros de rota (`pages`) dos componentes reutilizáveis (`components`).

### Teoria

1. **Conceitos-chave**

- **Refactor**: reorganizar sem mudar comportamento funcional esperado.
- **Rota de página**: componente que representa um ecrã completo ligado ao URL.
- **Componente reutilizável**: bloco UI reutilizado em várias páginas (cards, layout, loaders).

2. **Como funciona “por baixo”**

- O React Router instancia componentes por correspondência de rota.
- `pages` tendem a receber dados/estado global e orquestrar componentes.
- `components` recebem props e focam-se em apresentação/interação local.
- Quando mudas caminhos físicos, qualquer import antigo quebra imediatamente no build.

3. **Porque estamos a fazer assim neste projeto**

- Esta separação evita “ficheiro tudo-em-um”.
- Deixa o router mais legível (`App.jsx` mostra claramente ecrãs da app).
- Facilita onboarding: quem entra no projeto percebe logo onde editar cada tipo de ficheiro.

4. **Erros comuns e sintomas**

- Página movida mas import antigo mantido -> erro de compilação.
- Código de rota dentro de componente reutilizável -> acoplamento e bugs de navegação.
- `NotFound` em pasta errada -> fallback não renderiza como esperado.
- Misturar names iguais em duas pastas -> imports ambíguos/confusos.

5. **Boas práticas e segurança**

- Fazer refactor em passos pequenos e testar cada passo.
- Atualizar imports logo após cada `mv`.
- Não duplicar ficheiros “temporários” com lógica diferente para evitar drift.

6. **Mini-exemplos pedagógicos (isolados)**
    > Exemplo isolado - decisão simples

```txt
É rota com URL próprio? -> pages/
É peça reaproveitada em várias páginas? -> components/
```

> Exemplo isolado - organização

```txt
App.jsx usa pages
pages usam components + services + context
```

### Porque fazemos isto

Sem esta separação, o projeto cresce confuso e os imports ficam incoerentes.

### 5.1) Migrar as páginas que já existem

- **Ponto de situação:** backend fechado; agora reorganizas frontend sem mudar comportamento.
- **Objetivo deste passo:** mover componentes de rota para `pages/`.
- **Ficheiros:** mover ficheiros de `frontend/src/components/` para `frontend/src/pages/`.
- **Validação rápida:** após os `mv`, podem existir erros temporários de import; isso resolve no passo **5.3**
  ao atualizar `App.jsx` para `@/pages/...`.

Se na tua Tutorial 02 - Parte 3 já existe `src/pages`, adapta estes comandos: o objetivo é que as rotas fiquem em `pages/` e não em `components/`.

Se os ficheiros têm nomes diferentes:

- Move os componentes de rota (os usados no Router) para `pages/`; mantém UI reutilizável em `components/`.

No root do projeto:

```bash
# Executa estes comandos na pasta indicada imediatamente acima do bloco.
# Mantém a ordem dos comandos para evitar erros de setup.
# Este mkdir cria a pasta de pages (rotas) sem mexer nos componentes reutilizáveis.
mkdir -p frontend/src/pages
# Move a rota Home para pages/.
mv frontend/src/components/PokemonListPage.jsx frontend/src/pages/PokemonListPage.jsx
# Move a rota de detalhe para pages/.
mv frontend/src/components/PokemonDetailsPage.jsx frontend/src/pages/PokemonDetailsPage.jsx
# Move a rota de favoritos para pages/.
mv frontend/src/components/FavoritesPage.jsx frontend/src/pages/FavoritesPage.jsx
# Move a rota de fallback 404 para pages/.
mv frontend/src/components/NotFound.jsx frontend/src/pages/NotFound.jsx
```

### 5.2) Criar novas páginas obrigatórias

- **Ponto de situação:** páginas antigas já foram separadas.
- **Objetivo deste passo:** garantir existência das novas rotas obrigatórias da ficha.
- **Ficheiros:** criar `frontend/src/pages/LoginPage.jsx` e `frontend/src/pages/RegisterPage.jsx`.
- **Validação rápida:** todos os paths existem antes de atualizar o router.

Cria também em `frontend/src/pages/`:

- `LoginPage.jsx`
- `RegisterPage.jsx`

### 5.3) Atualizar imports do router

- **Ponto de situação:** a estrutura de pastas mudou; falta alinhar o ponto de entrada de rotas.
- **Objetivo deste passo:** atualizar `App.jsx` para importar páginas de `@/pages/...`.
- **Ficheiros:** editar `frontend/src/App.jsx`.
- **Validação rápida:** Vite deixa de mostrar erros de import e a rota `*` usa `NotFound` em `pages/`.

`frontend/src/App.jsx` vai passar a importar páginas de `@/pages/...`.

### Checkpoint 5

- A app continua a abrir sem erros de import.
- Rota `*` usa `@/pages/NotFound.jsx`.
- `components/` já não contém páginas de rota.

### Erros comuns (refactor de pastas)

- mover ficheiro e esquecer de corrigir imports no `App.jsx`.
- manter `NotFound` em `components` mas importar de `pages`.
- misturar componentes de UI com páginas na mesma pasta.

---

## 6) Frontend: Axios (`apiClient`) + services

### O que é

Vamos centralizar chamadas HTTP num cliente Axios único.

### Teoria

1. **Conceitos-chave**

- **Axios instance**: cliente HTTP configurado uma vez e reutilizado.
- **`baseURL`**: prefixo comum de todos os endpoints.
- **`withCredentials`**: permite envio/receção de cookies em pedidos cross-origin.
- **Interceptor**: função que corre antes/depois dos pedidos para aplicar lógica transversal.

2. **Como funciona “por baixo”**

- `axios.create(...)` devolve objeto com config base.
- Em cada request mutável, o interceptor lê `csrfToken` do cookie e injeta header.
- Se uma resposta falha, o erro Axios traz `err.response.status` quando há resposta HTTP.
- Sem `baseURL`, cada chamada precisa URL completa e o risco de inconsistência aumenta.

3. **Porque estamos a fazer assim neste projeto**

- Evitas repetir configuração em todos os services.
- Garante comportamento uniforme de cookies + CSRF em auth, favorites, teams e users.
- Services ficam curtos e focados no contrato de cada recurso.

4. **Erros comuns e sintomas**

- Pedidos vão para host errado -> `VITE_API_URL` em falta/errado.
- Sessão não mantém -> `withCredentials` ausente.
- 403 em mutações -> interceptor não adicionou `X-CSRF-Token`.
- Tratamento genérico de erro -> UI não distingue 401 de 403.

5. **Boas práticas e segurança**

- Centralizar clientes HTTP reduz bugs de configuração.
- Não codificar segredos no frontend; usar apenas URL pública de API.
- Tratar respostas de erro por status para mensagens úteis e debug rápido.

6. **Mini-exemplos pedagógicos (isolados)**
    > Exemplo isolado - leitura de erro Axios

```js
/**
 * Ficheiro: snippet do enunciado
 * Objetivo: mostrar tratamento explícito de erro Axios por status para decisões de UI previsíveis.
 * Este exemplo prepara a lógica usada nos services e páginas autenticadas.

 */

if (err.response?.status === 401) {
    // sessão em falta
}
```

> Exemplo isolado - sem interceptor (o que evitar)

```txt
Cada POST/DELETE lembra-se "à mão" de mandar CSRF -> probabilidade alta de esqueceres um.
```

### Porque fazemos isto

Evitas duplicação de `baseURL`, `withCredentials` e header CSRF em cada request.

### 6.1) Variáveis de ambiente frontend

- **Ponto de situação:** frontend reestruturado; agora falta configurar URL base de API.
- **Objetivo deste passo:** definir `VITE_API_URL` para centralizar origem do backend.
- **Ficheiros:** criar/editar `frontend/.env` e `frontend/.env.example`.
- **Validação rápida:** requests do frontend apontam para `http://localhost:3000` (ou valor definido).

`frontend/.env`:

```env
# URL base do backend usada pelo Vite no cliente (axios baseURL).
VITE_API_URL=http://localhost:3000
```

`frontend/.env.example`:

```env
# Exemplo da URL base do backend para quem clonar o projeto.
VITE_API_URL=http://localhost:3000
```

### 6.2) Instalar Axios

- **Ponto de situação:** env do frontend pronto; agora falta a biblioteca HTTP padrão da ficha.
- **Objetivo deste passo:** instalar Axios para centralizar chamadas e interceptors.
- **Ficheiros:** alterar `frontend/package.json` e `frontend/package-lock.json`.
- **Validação rápida:** import de `axios` funciona sem erro ao arrancar o frontend.

No `frontend/`:

```bash
# Executa estes comandos na pasta indicada imediatamente acima do bloco.
# Mantém a ordem dos comandos para evitar erros de setup.
npm install axios
```

### 6.3) Criar `apiClient.js`

- **Ponto de situação:** Axios instalado; agora crias a instância única da aplicação.
- **Objetivo deste passo:** configurar `baseURL`, `withCredentials` e injeção automática do header CSRF.
- **Ficheiros:** criar/editar `frontend/src/services/apiClient.js`.
- **Validação rápida:** mutações passam a enviar `X-CSRF-Token` quando o cookie existe.

`frontend/src/services/apiClient.js`:

```js
/**
 * Ficheiro: frontend/src/services/apiClient.js
 * Objetivo: centralizar chamadas HTTP e injetar CSRF automaticamente nas mutações.

 */

import axios from "axios";

/**
 * Lê valor de um cookie por nome.
 *
 * @param {string} name
 * @returns {string | null}
 */
function getCookie(name) {
    const chunk = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    if (!chunk) return null;
    return decodeURIComponent(chunk.split("=").slice(1).join("="));
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    // Sem isto o browser não envia/recebe cookies cross-origin.
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const method = (config.method ?? "get").toLowerCase();
    // Só métodos que alteram estado precisam de prova CSRF.
    const needsCsrf = ["post", "put", "patch", "delete"].includes(method);

    if (needsCsrf) {
        const csrf = getCookie("csrfToken");
        if (csrf) {
            config.headers = config.headers ?? {};
            // Header esperado no backend (requireCsrf).
            config.headers["X-CSRF-Token"] = csrf;
        }
    }

    return config;
});

export default api;
```

### 6.4) Services canónicos

- **Ponto de situação:** cliente HTTP pronto; agora separas contratos por recurso.
- **Objetivo deste passo:** criar services de auth e favorites sem espalhar requests pela UI.
- **Ficheiros:** criar/editar `frontend/src/services/authApi.js` e `favoritesApi.js`.
- **Validação rápida:** páginas consomem services com contratos consistentes e sem `fetch` direto ao backend.

`frontend/src/services/authApi.js`:

```js
/**
 * Ficheiro: frontend/src/services/authApi.js
 * Objetivo: encapsular endpoints de autenticação para manter páginas limpas.

 */

import api from "./apiClient.js";

/**
 * Regista utilizador e inicia sessão (cookies definidos pelo backend).
 *
 * @param {{username: string, email: string, password: string}} payload
 * @returns {Promise<any>}
 */
export async function register(payload) {
    const res = await api.post("/api/auth/register", payload);
    return res.data;
}

/**
 * Faz login e recebe sessão por cookie.
 *
 * @param {{email: string, password: string}} payload
 * @returns {Promise<any>}
 */
export async function login(payload) {
    const res = await api.post("/api/auth/login", payload);
    return res.data;
}

/**
 * Tenta restaurar sessão existente.
 *
 * @returns {Promise<any>}
 */
export async function restoreSession() {
    const res = await api.get("/api/auth/me");
    return res.data;
}

/**
 * Termina sessão atual.
 *
 * @returns {Promise<any>}
 */
export async function logout() {
    const res = await api.post("/api/auth/logout");
    return res.data;
}
```

`frontend/src/services/favoritesApi.js`:

```js
/**
 * Ficheiro: frontend/src/services/favoritesApi.js
 * Objetivo: isolar o contrato canónico de favoritos num único módulo.

 */

import api from "./apiClient.js";

/**
 * GET /api/favorites -> number[]
 *
 * @returns {Promise<number[]>}
 */
export async function getFavorites() {
    const res = await api.get("/api/favorites");
    return res.data;
}

/**
 * POST /api/favorites { id } -> { id }
 *
 * @param {number} id
 * @returns {Promise<{id: number}>}
 */
export async function addFavorite(id) {
    const res = await api.post("/api/favorites", { id });
    return res.data;
}

/**
 * DELETE /api/favorites/:id -> { id }
 *
 * @param {number} id
 * @returns {Promise<{id: number}>}
 */
export async function removeFavorite(id) {
    const res = await api.delete(`/api/favorites/${id}`);
    return res.data;
}
```

### 6.5) Diagnóstico rápido (Axios + cookies + CSRF)

Se algo falhar aqui, valida pela ordem:

1. `VITE_API_URL` aponta para o backend correto?
2. `withCredentials: true` está ativo no `apiClient`?
3. O cookie `csrfToken` existe no browser?
4. O header `X-CSRF-Token` está a ser enviado nas mutações?
5. O backend responde `401` (sessão) ou `403` (CSRF)?

### Checkpoint 6

- Não há `fetch` para backend nos serviços principais.
- Todas as mutações passam pelo `apiClient` com CSRF header automático.
- `VITE_API_URL` é usado de forma consistente.

---

## 7) Frontend: Context atualizado (compatível com Tutorial 02 - Parte 3) + `authReady`

### O que é

Vamos evoluir o `PokedexContext` para incluir autenticação sem quebrar as páginas da Tutorial 02 - Parte 3.

### Teoria

1. **Conceitos-chave**

- **Context API**: mecanismo React para estado global sem prop drilling excessivo.
- **Provider**: componente que expõe o estado/funções para a árvore abaixo.
- **`authReady` pattern**: flag que indica se a restauração de sessão já terminou.
- **`useEffect` + dependências**: sincronização com efeitos externos (API, timers, subscrições).

2. **Como funciona “por baixo”**

- No primeiro render, a app ainda não sabe se há sessão válida.
- `bootstrap()` carrega dados base e tenta `restoreSession()`.
- Enquanto isso, `authReady` fica `false`; rotas protegidas devem esperar.
- `useCallback` estabiliza referência de funções; `useMemo` evita recomputar o objeto `value` sem necessidade.

3. **Porque estamos a fazer assim neste projeto**

- Evita redirecionar para login antes de confirmar sessão existente.
- Mantém compatibilidade com páginas da Tutorial 02 - Parte 3 (pokemon/favorites continuam no contexto).
- Centraliza login/logout/toggleFavorite para toda a app usar o mesmo fluxo.

4. **Erros comuns e sintomas**

- `usePokedex` fora de provider -> erro imediato em runtime.
- Redirect “falso” para login no refresh -> falta de `authReady` no fluxo.
- `useEffect` em loop -> dependências instáveis.
- Favoritos desatualizados -> não recarregar após login/restauração.

5. **Boas práticas e segurança**

- Context deve guardar estado de sessão mínimo necessário, não dados sensíveis em excesso.
- Separar funções assíncronas por responsabilidade (`bootstrap`, `login`, `logout`).
- Tratar exceções por tipo/status para UI mais previsível.

6. **Mini-exemplos pedagógicos (isolados)**
    > Exemplo isolado - sem `authReady`

```txt
Render inicial: user = null
ProtectedRoute interpreta como "não autenticado" e redireciona cedo demais.
```

> Exemplo isolado - com `authReady`

```txt
Enquanto authReady=false: mostra loading.
Só decide redirecionar quando a verificação de sessão termina.
```

### Porque fazemos isto

Sem `authReady`, as rotas protegidas podem redirecionar antes da restauração de sessão acabar.

### 7.1) Substituir `frontend/src/context/PokedexContext.jsx`

- **Ponto de situação:** services prontos; agora concentras estado e fluxo da app.
- **Objetivo deste passo:** integrar sessão (`authReady`, login/logout, restoreSession) mantendo compatibilidade com Tutorial 02 - Parte 3.
- **Ficheiros:** substituir `frontend/src/context/PokedexContext.jsx`.
- **Validação rápida:** app não redireciona cedo no refresh e favoritos sincronizam após login/restauração.

```jsx
/**
 * Ficheiro: frontend/src/context/PokedexContext.jsx
 * Objetivo: concentrar estado global da Pokédex + sessão + favoritos do utilizador.

 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { fetchPokemonList } from "@/services/pokeApi.js";
import * as authApi from "@/services/authApi.js";
import * as favoritesApi from "@/services/favoritesApi.js";

const POKEMON_LIMIT = 151;

const PokedexContext = createContext(null);

/**
 * Provider global do estado da aplicação.
 *
 * @param {{children: import("react").ReactNode}} props
 * @returns {JSX.Element}
 */
export function PokedexProvider({ children }) {
    const [pokemon, setPokemon] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authReady, setAuthReady] = useState(false);
    const [error, setError] = useState(null);

    const refreshSession = useCallback(async () => {
        // Tenta reaproveitar cookie de sessão existente (sem guardar token no frontend).
        const data = await authApi.restoreSession();
        setUser(data.user);
        return data.user;
    }, []);

    const bootstrap = useCallback(async () => {
        // Estado inicial de loading para impedir decisões de UI prematuras.
        setLoading(true);
        setError(null);

        try {
            const pokemonList = await fetchPokemonList(POKEMON_LIMIT);
            setPokemon(pokemonList);

            let restoredUser = null;

            try {
                restoredUser = await refreshSession();
            } catch (err) {
                // 401 é esperado quando não há sessão; outros erros devem propagar.
                if (err?.response?.status !== 401) {
                    throw err;
                }
                setUser(null);
            }

            if (restoredUser) {
                const favoriteIds = await favoritesApi.getFavorites();
                setFavorites(favoriteIds);
            } else {
                setFavorites([]);
            }
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar dados iniciais.");
        } finally {
            setLoading(false);
            // authReady evita redirect prematuro no ProtectedRoute.
            setAuthReady(true);
        }
    }, [refreshSession]);

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    const login = useCallback(async ({ email, password }) => {
        const data = await authApi.login({ email, password });
        setUser(data.user);

        // Após login, carregamos favoritos reais do backend para sincronizar UI.
        const favoriteIds = await favoritesApi.getFavorites();
        setFavorites(favoriteIds);

        return data.user;
    }, []);

    const register = useCallback(async ({ username, email, password }) => {
        const data = await authApi.register({ username, email, password });
        setUser(data.user);
        setFavorites([]);
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            // Mesmo que o backend falhe, limpamos estado local para não manter UI "autenticada".
            setUser(null);
            setFavorites([]);
        }
    }, []);

    const toggleFavorite = useCallback(
        async (pokemonId) => {
            if (!user) {
                window.alert("Faz login para gerir favoritos.");
                return;
            }

            if (favorites.includes(pokemonId)) {
                await favoritesApi.removeFavorite(pokemonId);
                // Atualização otimista simples após resposta do backend.
                setFavorites((prev) => prev.filter((id) => id !== pokemonId));
            } else {
                await favoritesApi.addFavorite(pokemonId);
                setFavorites((prev) =>
                    prev.includes(pokemonId) ? prev : [...prev, pokemonId],
                );
            }
        },
        [favorites, user],
    );

    const reloadFavorites = useCallback(async () => {
        if (!user) {
            setFavorites([]);
            return;
        }

        const favoriteIds = await favoritesApi.getFavorites();
        setFavorites(favoriteIds);
    }, [user]);

    const value = useMemo(
        () => ({
            pokemon,
            favorites,
            user,
            loading,
            error,
            authReady,
            login,
            register,
            logout,
            toggleFavorite,
            reload: bootstrap,
            refreshSession,
            reloadFavorites,
        }),
        [
            pokemon,
            favorites,
            user,
            loading,
            error,
            authReady,
            login,
            register,
            logout,
            toggleFavorite,
            bootstrap,
            refreshSession,
            reloadFavorites,
        ],
    );

    // Provider expõe estado + ações para qualquer componente descendente.
    return (
        <PokedexContext.Provider value={value}>
            {children}
        </PokedexContext.Provider>
    );
}

/**
 * Hook de consumo do contexto com guard para uso fora do Provider.
 *
 * @returns {any}
 * @throws {Error}
 */
export function usePokedex() {
    const ctx = useContext(PokedexContext);

    if (!ctx) {
        throw new Error("usePokedex deve ser usado dentro do PokedexProvider");
    }

    return ctx;
}
```

### Checkpoint 7

- App arranca mesmo sem sessão (fica `user = null`, `authReady = true`).
- Com sessão ativa, favoritos são carregados do backend.
- `toggleFavorite` atualiza estado sem “setState no-op”.

---

## 8) Frontend: Router + ProtectedRoute + navegação condicional

### O que é

Nesta etapa protegemos páginas privadas e mostramos links certos conforme login.

### Teoria

1. **Conceitos-chave**

- **React Router v6**: sistema de roteamento declarativo com `Routes`/`Route`.
- **Nested routes**: rotas filhas renderizadas dentro de um layout pai via `Outlet`.
- **`Navigate`**: redirecionamento declarativo.
- **ProtectedRoute**: guarda de autenticação para rotas privadas.

2. **Como funciona “por baixo”**

- O router compara o URL atual com a árvore de rotas.
- Se existir rota pai com `element={<Layout/>}`, o `Outlet` define onde entra a página filha.
- `Navigate` troca a localização sem recarregar a página.
- `useLocation` permite guardar origem para voltar após login.

3. **Porque estamos a fazer assim neste projeto**

- A app precisa de áreas públicas (home/login/registo) e privadas (favoritos).
- Layout comum evita duplicar navegação em todas as páginas.
- Redireção pós-login melhora fluxo do utilizador (volta para onde queria entrar).

4. **Erros comuns e sintomas**

- Esquecer `Outlet` no Layout -> páginas filhas não aparecem.
- Rota privada sem guard -> acesso direto por URL sem login.
- `Navigate` sem `replace` em certos fluxos -> histórico confuso ao usar botão “voltar”.
- NotFound mal ligado -> rota inválida cai em página branca/erro.

5. **Boas práticas e segurança**

- Segurança real continua no backend; ProtectedRoute é UX/controle no cliente.
- Manter árvore de rotas explícita e legível.
- Evitar lógica de autenticação dispersa por múltiplas páginas.

6. **Mini-exemplos pedagógicos (isolados)**
    > Exemplo isolado - regra mental

```txt
Frontend protege experiência.
Backend protege dados.
Precisamos dos dois.
```

> Exemplo isolado - nested routes

```txt
/ (Layout)
  /login
  /favoritos
```

### Porque importa (porque fazemos isto)

Evitas acesso direto a páginas privadas por URL e eliminas estado visual inconsistente na navbar.

### 8.0) Mapa de rotas públicas vs privadas

```txt
Públicas: /, /pokemon/:id, /login, /registo
Privadas: /favoritos
Regra: privadas passam sempre por <ProtectedRoute />
```

### Passos

### 8.1) Criar `ProtectedRoute`

- **Ponto de situação:** contexto já sabe autenticação; agora precisas do guard de UI.
- **Objetivo deste passo:** bloquear rotas privadas até `authReady` e `user` válidos.
- **Ficheiros:** criar/editar `frontend/src/components/ProtectedRoute.jsx`.
- **Validação rápida:** sem sessão vai para `/login`; com sessão renderiza conteúdo protegido.

`frontend/src/components/ProtectedRoute.jsx`:

```jsx
/**
 * Ficheiro: frontend/src/components/ProtectedRoute.jsx
 * Objetivo: bloquear rotas privadas até existir sessão válida.

 */

import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { usePokedex } from "@/context/PokedexContext.jsx";

/**
 * Guarda de rota privada.
 *
 * @param {{children: import("react").ReactNode}} props
 * @returns {JSX.Element}
 */
function ProtectedRoute({ children }) {
    const { user, authReady } = usePokedex();
    const location = useLocation();

    if (!authReady) {
        // Evita redirecionar para login antes de acabar restoreSession.
        return <LoadingSpinner />;
    }

    if (!user) {
        // Guardamos origem para possível redireção pós-login.
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

export default ProtectedRoute;
```

### 8.2) Atualizar `Layout` para links por estado de login

- **Ponto de situação:** guard pronto; agora ajustas navegação ao estado de sessão.
- **Objetivo deste passo:** mostrar links públicos/privados e ação de logout no layout principal.
- **Ficheiros:** editar `frontend/src/components/Layout.jsx`.
- **Validação rápida:** links mudam imediatamente quando `user` passa de `null` para autenticado (e vice-versa).

`frontend/src/components/Layout.jsx`:

```jsx
/**
 * Ficheiro: frontend/src/components/Layout.jsx
 * Objetivo: renderizar a navegação principal com links condicionais pelo estado de sessão.
 * Este layout centraliza a experiência pública/privada da app sem duplicação de navbar.

 */

import { NavLink, Outlet, useLocation } from "react-router-dom";
import { usePokedex } from "@/context/PokedexContext.jsx";

function Layout() {
    const { pokemon, favorites, user, logout } = usePokedex();
    const location = useLocation();
    const queryString = location.search;
    const homeTo = queryString ? `/${queryString}` : "/";
    const favoritesTo = queryString ? `/favoritos${queryString}` : "/favoritos";

    async function handleLogout() {
        try {
            await logout();
        } catch (err) {
            console.error(err);
            window.alert("Não foi possível terminar sessão.");
        }
    }

    return (
        <div className="pokedex">
            <header className="pokedex__hero">
                <div>
                    <h1 className="pokedex__hero-title">Pokédex Digital</h1>
                    <p className="pokedex__hero-subtitle">
                        Sessão e favoritos por utilizador
                    </p>
                    <div className="pokedex__hero-stats">
                        <div className="pokedex__hero-stat">
                            Total
                            <strong>{pokemon.length || 151}</strong>
                        </div>
                        <div className="pokedex__hero-stat">
                            Favoritos
                            <strong>{favorites.length}</strong>
                        </div>
                        <div className="pokedex__hero-stat">
                            Utilizador
                            <strong>
                                {user ? user.username : "visitante"}
                            </strong>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="type-filter" aria-label="Navegação principal">
                <div className="type-filter__buttons">
                    <NavLink to={homeTo} end className="type-filter__button">
                        Home
                    </NavLink>

                    {user ? (
                        <>
                            <NavLink
                                to={favoritesTo}
                                className="type-filter__button"
                            >
                                Favoritos
                            </NavLink>
                            <button
                                type="button"
                                className="type-filter__button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                className="type-filter__button"
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/registo"
                                className="type-filter__button"
                            >
                                Registo
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>

            <Outlet />
        </div>
    );
}

export default Layout;
```

### 8.3) Router final

- **Ponto de situação:** peças de navegação prontas; agora fechas a árvore de rotas.
- **Objetivo deste passo:** declarar rotas públicas e privadas com `ProtectedRoute`.
- **Ficheiros:** editar `frontend/src/App.jsx`.
- **Validação rápida:** `/favoritos` exige login; `*` cai em `NotFound`.

`frontend/src/App.jsx`:

```jsx
/**
 * Ficheiro: frontend/src/App.jsx
 * Objetivo: declarar a árvore final de rotas públicas e privadas usando `ProtectedRoute`.
 * Este ficheiro liga pages, layout e fallback de rota num único ponto de entrada.

 */

import { Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import FavoritesPage from "@/pages/FavoritesPage.jsx";
import LoginPage from "@/pages/LoginPage.jsx";
import NotFound from "@/pages/NotFound.jsx";
import PokemonDetailsPage from "@/pages/PokemonDetailsPage.jsx";
import PokemonListPage from "@/pages/PokemonListPage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<PokemonListPage />} />
                <Route path="pokemon/:id" element={<PokemonDetailsPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registo" element={<RegisterPage />} />

                <Route
                    path="favoritos"
                    element={
                        <ProtectedRoute>
                            <FavoritesPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
```

### 8.4) Login/Register (fluxo de redirect)

- **Ponto de situação:** router definido; faltam páginas de entrada de sessão.
- **Objetivo deste passo:** implementar formulários de login/registo com redireção correta.
- **Ficheiros:** criar/editar `frontend/src/pages/LoginPage.jsx` e `frontend/src/pages/RegisterPage.jsx`.
- **Validação rápida:** login regressa à rota de origem (`from`) e registo autentica/utiliza navegação esperada.

`frontend/src/pages/LoginPage.jsx`:

```jsx
/**
 * Ficheiro: frontend/src/pages/LoginPage.jsx
 * Objetivo: autenticar utilizador e redirecionar para a rota de origem quando aplicável.
 * Esta página fecha o fluxo de entrada em conjunto com `ProtectedRoute` e `location.state`.

 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePokedex } from "@/context/PokedexContext.jsx";

function LoginPage() {
    const { login } = usePokedex();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login({ email, password });
            navigate(redirectTo, { replace: true });
        } catch {
            setError("Login inválido.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="pokedex__results">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit" disabled={submitting}>
                    {submitting ? "A entrar..." : "Entrar"}
                </button>
            </form>
            {error && <p className="pokedex__empty">{error}</p>}
        </section>
    );
}

export default LoginPage;
```

`frontend/src/pages/RegisterPage.jsx`:

```jsx
/**
 * Ficheiro: frontend/src/pages/RegisterPage.jsx
 * Objetivo: criar conta nova e iniciar o estado autenticado da aplicação.
 * Esta página complementa o login e valida os campos mínimos de registo no frontend.

 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePokedex } from "@/context/PokedexContext.jsx";

function RegisterPage() {
    const { register } = usePokedex();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await register({ username, email, password });
            navigate("/", { replace: true });
        } catch {
            setError("Não foi possível criar conta.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="pokedex__results">
            <h2>Registo</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        minLength={3}
                        required
                    />
                </label>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                    />
                </label>
                <button type="submit" disabled={submitting}>
                    {submitting ? "A criar..." : "Criar conta"}
                </button>
            </form>
            {error && <p className="pokedex__empty">{error}</p>}
        </section>
    );
}

export default RegisterPage;
```

### Checkpoint 8

- Rotas privadas redirecionam para `/login` sem sessão.
- Depois de login, links privados aparecem no `Layout`.
- `/favoritos` carrega e atualiza apenas com sessão válida.

Critérios binários de validação (debug guiado):

- Se rota privada não redirecionar sem login, verifica se está embrulhada em `<ProtectedRoute>`.
- Se redirecionar cedo demais no refresh, verifica `authReady` antes de decidir `Navigate`.
- Se login for bem-sucedido mas não regressar à origem, verifica `location.state?.from` + `navigate(..., { replace: true })`.

### 8.6) Erros comuns de navegação/autenticação

- esquecer `authReady` no `ProtectedRoute`.
- chamar `navigate` antes de `login` terminar.
- rota privada sem wrapper `ProtectedRoute`.

---

## 10) Checkpoint final: testes manuais completos + erros comuns

### O que é

Validação funcional fim-a-fim da ficha.

### Teoria

1. **Conceitos-chave**

- **Teste manual E2E**: validação do fluxo completo de ponta a ponta.
- **Sintoma vs causa**: a mensagem visível nem sempre indica a origem real.
- **Ferramentas de debug**: DevTools Network, Application/Cookies, curl, Postman/Insomnia.

2. **Como funciona “por baixo”**

- Cada clique relevante gera request HTTP observável no separador Network.
- No browser, erros CORS aparecem no console e podem bloquear antes de veres resposta útil.
- `401`, `403`, `422`, `500` têm significados diferentes e orientam diagnóstico.
- Cookies podem existir no storage, mas só são enviados se origin/credentials/políticas permitirem.

3. **Porque estamos a fazer assim neste projeto**

- A Tutorial 02 - Parte 4 junta muitas peças; só testes fim-a-fim confirmam integração real.
- A checklist final evita o “parece funcionar” baseado em meia dúzia de cliques.
- Validar status codes acelera muito o debug e evita tentativas aleatórias.

4. **Erros comuns e sintomas**

- “CORS error” no browser e nada no backend -> bloqueio no cliente antes de chegar à rota.
- 401 em rotas privadas após login -> cookie não enviado/aceite.
- 403 em mutações -> header CSRF em falta ou token desfasado.
- 500 em endpoint de dados -> erro interno (stack no backend, input inesperado, DB).
- UI sem atualização após ação com 200 -> estado local não foi sincronizado.

5. **Boas práticas e segurança**

- Testar sempre cenários de sucesso e falha.
- Verificar explicitamente status code e payload, não só “apareceu algo no ecrã”.
- Não mascarar erros no frontend com mensagens genéricas sem logs úteis.

6. **Mini-exemplos pedagógicos (isolados)**
    > Exemplo isolado - triagem rápida

```txt
Se for 401: olha para sessão/cookie.
Se for 403: olha para CSRF.
Se for 422: olha para validação do payload.
Se for 500: olha para logs do backend.
```

> Exemplo isolado - ordem de debug

```txt
1) Confirmar request chegou
2) Ver status
3) Ver payload
4) Ver logs
```

### Porque fazemos isto

Se não testares o fluxo completo (login -> favoritos -> logout), falhas de integração passam despercebidas.

### 10.1) Testes obrigatórios

1. **Health + arranque**
    - `GET /api/health` devolve `{ ok: true }`.
2. **Registo e login**
    - criar conta em `/registo`, fazer logout, voltar a fazer login em `/login`.
3. **Sessão restaurada**
    - refresh da página com sessão ativa mantém utilizador autenticado (`/api/auth/me`).
4. **Favoritos (contrato correto)**
    - marcar/desmarcar favorito e confirmar requests:
        - `GET /api/favorites` -> array de ids
        - `POST /api/favorites` body `{ id }`
        - `DELETE /api/favorites/:id`
5. **Rotas protegidas**
    - sem login, apenas `/favoritos` redireciona para `/login`.
6. **Logout**
    - logout limpa sessão; rotas protegidas deixam de ser acessíveis.

### 10.2) Erros comuns finais

- **CORS/cookies**: origem errada em `CLIENT_ORIGIN`.
- **CSRF**: mutações a falhar com 403 por ausência do header.
- **Imports**: `App.jsx` ainda a importar páginas de `components`.
- **Env vars**: frontend sem `VITE_API_URL` ou backend sem `JWT_SECRET`.

### 10.3) Mini playbook transversal de debug (rápido)

```txt
1) Confirmar se o request chegou ao backend
2) Ler status HTTP (401/403/422/500)
3) Mapear status para camada provável (sessão, CSRF, validação, servidor)
4) Corrigir a causa mais provável e repetir o mesmo teste
```

Leitura guiada por status:

- `401` -> verificar sessão/cookies/JWT.
- `403` -> verificar CSRF (cookie + header).
- `422` -> verificar payload do cliente.
- `500` -> verificar logs e stack do backend.

---

## 11) Resumo / Checklist final

### Teoria

1. **Conceitos-chave**

- **Checklist de entrega**: verificação objetiva para garantir conclusão real.
- **Critério de aceite**: definição clara do que conta como “feito”.
- **Regressão**: quando uma alteração nova estraga algo que antes funcionava.

2. **Como funciona “por baixo”**

- Cada item da checklist representa uma dependência crítica entre camadas.
- Se um item falha, normalmente há efeito em cascata (ex.: auth falha -> rotas protegidas falham -> favoritos também).
- A checklist transforma validação subjetiva em validação mensurável.

3. **Porque estamos a fazer assim neste projeto**

- Ajuda-te a fechar a ficha com confiança, sem “buracos” escondidos.
- Serve também para preparação de avaliação: sabes exatamente o que demonstrar.
- Facilita manutenção futura: quando voltares ao projeto, tens um mapa de estado final esperado.

4. **Erros comuns e sintomas**

- Marcar item sem testar de verdade -> bug aparece na demonstração final.
- Testar só caminho feliz -> falhas de segurança/validação passam despercebidas.
- Ignorar logs porque “a UI parece ok” -> problemas latentes em produção.

5. **Boas práticas e segurança**

- Repetir checklist após alterações relevantes.
- Guardar evidências rápidas (prints de Network/logs) durante validação.
- Tratar segurança como requisito funcional, não como acessório.

6. **Mini-exemplos pedagógicos (isolados)**
    > Exemplo isolado - forma de fechar tarefa

```txt
Item checklist + teste executado + resultado observado + estado final.
```

> Exemplo isolado - mentalidade profissional

```txt
"Funciona no meu computador" não substitui validação sistemática.
```

- [ ] Projeto está organizado em `backend/` e `frontend/`.
- [ ] Frontend separado em `src/pages` (rotas) e `src/components` (reutilização).
- [ ] `favorites` usa apenas 1 contrato (GET array, POST body `{id}`, DELETE `/:id`).
- [ ] Auth com JWT em cookie HttpOnly está funcional (`register/login/me/logout`).
- [ ] CSRF ativo para mutações e fluxo coerente com cookies.
- [ ] Axios central (`apiClient`) com `withCredentials` e `X-CSRF-Token` automático.
- [ ] Rotas protegidas funcionam com `ProtectedRoute` e `authReady`.
- [ ] Testes manuais fim-a-fim executados com sucesso.

Se tudo estiver marcado, a Tutorial 02 - Parte 4 está concluída e consistente com a Tutorial 02 - Parte 3.

![Footer](../../Images/Footer.png)
