![Header](../../Images/Header.png)

# Pokédex v4 (Tutorial 02 - Parte 5)

Esta ficha continua diretamente da Tutorial 02 - Parte 4.
Pré-requisitos:

- Tutorial 02 - Parte 4 concluída.
- App funcional com login/registo e favoritos por utilizador.
- Rota privada `/favoritos` a funcionar com `ProtectedRoute`.

Nesta ficha vais acrescentar:

- equipas paginadas;
- perfil do utilizador;
- upload de avatar;
- rotas privadas completas (`/favoritos`, `/equipas`, `/perfil`).

### 4.2) Modelo Team e rotas de equipas

- **Ponto de situação:** favorites resolvidos; agora entra o recurso de equipas com paginação e pesquisa.
- **Objetivo deste passo:** criar schema de equipas e endpoints de listar/criar/apagar por utilizador.
- **Ficheiros:** criar/editar `backend/src/models/Team.js` e `backend/src/routes/teams.routes.js`.
- **Validação rápida:** `GET /api/teams` devolve paginação; `POST` valida 1..6 IDs; `DELETE` remove equipa do utilizador.

`backend/src/models/Team.js`:

```js
/**
 * Ficheiro: backend/src/models/Team.js
 * Objetivo: definir a estrutura de dados de uma equipa no MongoDB.

 */

import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            // Índice acelera listagens por utilizador.
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        pokemonIds: {
            type: [Number],
            validate: {
                // Regra de negócio: equipa entre 1 e 6 IDs válidos.
                validator: (arr) =>
                    Array.isArray(arr) &&
                    arr.length >= 1 &&
                    arr.length <= 6 &&
                    arr.every((id) => Number.isInteger(id) && id > 0),
                message: "pokemonIds deve ter entre 1 e 6 ids válidos",
            },
        },
    },
    { timestamps: true },
);

const Team = mongoose.model("Team", teamSchema);

export default Team;
```

`backend/src/routes/teams.routes.js`:

```js
/**
 * Ficheiro: backend/src/routes/teams.routes.js
 * Objetivo: criar/listar/apagar equipas com paginação e pesquisa por nome.

 */

import { Router } from "express";
import mongoose from "mongoose";
import Team from "../models/Team.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

/**
 * Valida inteiros positivos para query params de paginação.
 *
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function parsePositiveInt(value, fallback) {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return fallback;
    return n;
}

router.get("/", requireAuth, async (req, res) => {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 10), 50);
    // Limite de 50 chars protege de regex exagerada sem complicar a ficha.
    const q = String(req.query.q ?? "")
        .trim()
        .slice(0, 50);

    const filter = { userId: req.auth.userId };
    if (q) {
        // Pesquisa case-insensitive por nome.
        filter.name = { $regex: q, $options: "i" };
    }

    // Skip calcula quantos documentos saltar antes de ler a página atual.
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Team.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Team.countDocuments(filter),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({ items, total, page, limit, pages });
});

router.post("/", requireAuth, async (req, res) => {
    const name = String(req.body?.name ?? "").trim();
    const pokemonIdsRaw = Array.isArray(req.body?.pokemonIds)
        ? req.body.pokemonIds
        : [];

    const pokemonIds = [...new Set(pokemonIdsRaw.map(Number))].filter(
        // Remove duplicados e rejeita valores não inteiros/<=0.
        (id) => Number.isInteger(id) && id > 0,
    );

    if (!name) {
        return res.status(422).json({
            error: { code: "VALIDATION_ERROR", message: "name é obrigatório" },
        });
    }

    if (pokemonIds.length < 1 || pokemonIds.length > 6) {
        // 422 por regra de negócio da equipa Pokémon.
        return res.status(422).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "pokemonIds deve ter entre 1 e 6 elementos",
            },
        });
    }

    const team = await Team.create({
        userId: req.auth.userId,
        name,
        pokemonIds,
    });

    return res.status(201).json(team);
});

router.delete("/:id", requireAuth, async (req, res) => {
    // Validação explícita evita CastError e devolve feedback imediato ao cliente.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: { code: "INVALID_ID", message: "id de equipa inválido" },
        });
    }

    const team = await Team.findOne({
        _id: req.params.id,
        userId: req.auth.userId,
    });

    if (!team) {
        return res.status(404).json({
            error: { code: "NOT_FOUND", message: "Equipa não encontrada" },
        });
    }

    await team.deleteOne();

    return res.status(200).json({ id: req.params.id });
});

export default router;
```

### 4.3) Upload de avatar (obrigatório)

- **Ponto de situação:** recursos de dados prontos; falta integração com ficheiros.
- **Objetivo deste passo:** receber upload de avatar, guardar em disco e persistir `avatarUrl` no utilizador.
- **Ficheiros:** criar `backend/uploads/.gitkeep` e criar/editar `backend/src/routes/users.routes.js`.
- **Validação rápida:** `POST /api/users/avatar` devolve `{ avatarUrl }` e a imagem fica acessível em `/uploads/...`.

Cria a pasta `backend/uploads/` com um ficheiro `backend/uploads/.gitkeep`.

`backend/src/routes/users.routes.js`:

```js
/**
 * Ficheiro: backend/src/routes/users.routes.js
 * Objetivo: receber upload de avatar e guardar URL pública no perfil do utilizador.

 */

import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import User from "../models/User.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Diretório único de uploads; usado aqui e no express.static do app.js.
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    // Guarda sempre na pasta uploads da raiz do backend.
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        // Nome pseudo-único para reduzir colisões entre uploads.
        const ext =
            path.extname(file.originalname || "").toLowerCase() || ".png";
        cb(
            null,
            `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`,
        );
    },
});

const upload = multer({
    storage,
    // Limite de 2MB evita uploads gigantes em ambiente pedagógico.
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        // ATENÇÃO (armadilha): mimetype pode ser falsificado; aqui é filtro básico de sala de aula.
        // Nota: não corrigimos aqui para manter o snippet alinhado com o enunciado.
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Ficheiro inválido: envia uma imagem"));
            return;
        }
        cb(null, true);
    },
});

router.post(
    "/avatar",
    requireAuth,
    upload.single("avatar"),
    async (req, res) => {
        if (!req.file) {
            // 422 quando o campo avatar não foi enviado.
            return res.status(422).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "avatar é obrigatório",
                },
            });
        }

        const user = await User.findById(req.auth.userId);

        if (!user) {
            return res.status(404).json({
                error: {
                    code: "USER_NOT_FOUND",
                    message: "Utilizador não existe",
                },
            });
        }

        user.avatarUrl = `/uploads/${req.file.filename}`;
        await user.save();

        // Mantemos contrato simples: devolver apenas a URL pública.
        return res.status(200).json({ avatarUrl: user.avatarUrl });
    },
);

export default router;
```

### Checkpoint 4

- `GET /api/favorites` já devolve favoritos do utilizador autenticado.
- `GET /api/teams?page=1&limit=5&q=` devolve `{ items, total, page, limit, pages }`.
- `POST /api/users/avatar` grava imagem e devolve `avatarUrl`.

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

### 5.2) Criar novas páginas obrigatórias

- **Ponto de situação:** páginas antigas já foram separadas.
- **Objetivo deste passo:** garantir existência das novas rotas obrigatórias da ficha.
- **Ficheiros:** criar `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`, `frontend/src/pages/TeamsPage.jsx`, `frontend/src/pages/ProfilePage.jsx`.
- **Validação rápida:** todos os paths existem antes de atualizar o router.

Cria também em `frontend/src/pages/`:

- `LoginPage.jsx`
- `RegisterPage.jsx`
- `TeamsPage.jsx`
- `ProfilePage.jsx`

### 6.4) Services canónicos

- **Ponto de situação:** cliente HTTP pronto; agora separas contratos por recurso.
- **Objetivo deste passo:** criar services de auth, favorites, teams e users sem espalhar requests pela UI.
- **Ficheiros:** criar/editar `frontend/src/services/authApi.js`, `favoritesApi.js`, `teamsApi.js`, `usersApi.js`.
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

`frontend/src/services/teamsApi.js`:

```js
/**
 * Ficheiro: frontend/src/services/teamsApi.js
 * Objetivo: centralizar chamadas HTTP das equipas com paginação e CRUD básico.

 */

import api from "./apiClient.js";

/**
 * Lista equipas paginadas.
 *
 * @param {{page?: number, limit?: number, q?: string}} [param0]
 * @returns {Promise<any>}
 */
export async function listTeams({ page = 1, limit = 6, q = "" } = {}) {
    const res = await api.get("/api/teams", {
        params: { page, limit, q },
    });
    return res.data;
}

/**
 * Cria uma nova equipa.
 *
 * @param {{name: string, pokemonIds: number[]}} payload
 * @returns {Promise<any>}
 */
export async function createTeam(payload) {
    const res = await api.post("/api/teams", payload);
    return res.data;
}

/**
 * Remove equipa por ID.
 *
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function removeTeam(id) {
    const res = await api.delete(`/api/teams/${id}`);
    return res.data;
}
```

`frontend/src/services/usersApi.js`:

```js
/**
 * Ficheiro: frontend/src/services/usersApi.js
 * Objetivo: subir avatar via multipart/form-data.

 */

import api from "./apiClient.js";

/**
 * Faz upload de avatar.
 *
 * @param {File} file
 * @returns {Promise<{avatarUrl: string}>}
 */
export async function uploadAvatar(file) {
    const formData = new FormData();
    // O nome do campo tem de bater com upload.single("avatar") no backend.
    formData.append("avatar", file);

    // Sem header manual: o browser/axios definem o boundary multipart corretamente.
    const res = await api.post("/api/users/avatar", formData);

    return res.data;
}
```

### 8.0) Mapa de rotas públicas vs privadas

```txt
Públicas: /, /pokemon/:id, /login, /registo
Privadas: /favoritos, /equipas, /perfil
Regra: privadas passam sempre por <ProtectedRoute />
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
                        Sessão, equipas e perfil com avatar
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
                            <NavLink
                                to="/equipas"
                                className="type-filter__button"
                            >
                                Equipas
                            </NavLink>
                            <NavLink
                                to="/perfil"
                                className="type-filter__button"
                            >
                                Perfil
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
- **Validação rápida:** `/favoritos`, `/equipas`, `/perfil` exigem login; `*` cai em `NotFound`.

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
import ProfilePage from "@/pages/ProfilePage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";
import TeamsPage from "@/pages/TeamsPage.jsx";

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
                <Route
                    path="equipas"
                    element={
                        <ProtectedRoute>
                            <TeamsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="perfil"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
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

### 8.5) Teams (carregar/criar/apagar/paginar)

- **Ponto de situação:** auth frontend funcional; agora ligas gestão de equipas à API real.
- **Objetivo deste passo:** carregar, criar, pesquisar, paginar e apagar equipas pela UI.
- **Ficheiros:** criar/editar `frontend/src/pages/TeamsPage.jsx`.
- **Validação rápida:** ações de equipa refletem-se no ecrã após cada request (sem mock/localStorage).

`frontend/src/pages/TeamsPage.jsx`:

```jsx
/**
 * Ficheiro: frontend/src/pages/TeamsPage.jsx
 * Objetivo: gerir UI de equipas (listar, criar, apagar) com paginação e pesquisa.

 */

import { useEffect, useState } from "react";
import { createTeam, listTeams, removeTeam } from "@/services/teamsApi.js";

/**
 * Página de gestão de equipas.
 *
 * @returns {JSX.Element}
 */
function TeamsPage() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [q, setQ] = useState("");
    const [name, setName] = useState("");
    const [pokemonIdsInput, setPokemonIdsInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * Carrega uma página de equipas.
     *
     * @param {number} [targetPage=page]
     * @returns {Promise<void>}
     */
    async function load(targetPage = page) {
        setLoading(true);
        setError("");

        try {
            // Mantemos limit fixo na UI para experiência consistente.
            const data = await listTeams({ page: targetPage, limit: 6, q });
            setItems(data.items);
            setTotal(data.total);
            setPage(data.page);
            setPages(data.pages);
        } catch {
            setError("Erro ao carregar equipas.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Sempre que q muda, voltamos à primeira página para evitar páginas vazias inesperadas.
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    /**
     * Cria equipa com validação básica antes do POST.
     *
     * @param {import("react").FormEvent<HTMLFormElement>} event
     * @returns {Promise<void>}
     */
    async function handleCreate(event) {
        event.preventDefault();
        setError("");

        // Parsing + dedupe de IDs introduzidos em texto livre.
        const pokemonIds = [
            ...new Set(
                pokemonIdsInput
                    .split(",")
                    .map((x) => Number(x.trim()))
                    .filter((x) => Number.isInteger(x) && x > 0),
            ),
        ];

        if (!name.trim()) {
            setError("Nome da equipa é obrigatório.");
            return;
        }

        if (pokemonIds.length < 1 || pokemonIds.length > 6) {
            setError("Indica entre 1 e 6 IDs de Pokémon.");
            return;
        }

        try {
            await createTeam({ name: name.trim(), pokemonIds });
            setName("");
            setPokemonIdsInput("");
            // Recarrega primeira página para mostrar equipa recém-criada.
            await load(1);
        } catch {
            setError("Não foi possível criar equipa.");
        }
    }

    /**
     * Remove equipa e recarrega página atual.
     *
     * @param {string} id
     * @returns {Promise<void>}
     */
    async function handleDelete(id) {
        try {
            await removeTeam(id);
            await load(page);
        } catch {
            setError("Não foi possível apagar equipa.");
        }
    }

    return (
        <section className="pokedex__results">
            <h2>Equipas</h2>

            <form onSubmit={handleCreate}>
                <label>
                    Nome da equipa
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    IDs Pokémon (separados por vírgula)
                    <input
                        value={pokemonIdsInput}
                        onChange={(e) => setPokemonIdsInput(e.target.value)}
                        placeholder="1, 4, 7"
                        required
                    />
                </label>
                <button type="submit">Criar equipa</button>
            </form>

            <label>
                Pesquisar por nome
                <input value={q} onChange={(e) => setQ(e.target.value)} />
            </label>

            {loading && <p>A carregar...</p>}
            {error && <p className="pokedex__empty">{error}</p>}

            {!loading && !error && (
                <>
                    <p>Total: {total}</p>
                    <ul>
                        {items.map((team) => (
                            <li key={team._id}>
                                <strong>{team.name}</strong> - [
                                {team.pokemonIds.join(", ")}]
                                <button
                                    type="button"
                                    onClick={() => handleDelete(team._id)}
                                >
                                    Apagar
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div>
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => load(page - 1)}
                        >
                            Anterior
                        </button>
                        <span>
                            Página {page} de {pages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= pages}
                            onClick={() => load(page + 1)}
                        >
                            Seguinte
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}

export default TeamsPage;
```

### Checkpoint 8

- Rotas privadas redirecionam para `/login` sem sessão.
- Depois de login, links privados aparecem no `Layout`.
- Teams cria/apaga e refresca por chamada real à API.

Critérios binários de validação (debug guiado):

- Se rota privada não redirecionar sem login, verifica se está embrulhada em `<ProtectedRoute>`.
- Se redirecionar cedo demais no refresh, verifica `authReady` antes de decidir `Navigate`.
- Se login for bem-sucedido mas não regressar à origem, verifica `location.state?.from` + `navigate(..., { replace: true })`.

### 8.6) Erros comuns de navegação/autenticação

- esquecer `authReady` no `ProtectedRoute`.
- chamar `navigate` antes de `login` terminar.
- rota privada sem wrapper `ProtectedRoute`.

## 9) Upload de avatar obrigatório: backend + frontend (Profile)

### O que é

Vamos ligar a rota `/api/users/avatar` à página de perfil.

### Teoria

1. **Conceitos-chave**

- **`multipart/form-data`**: formato HTTP para enviar ficheiros e campos no mesmo pedido.
- **FormData**: API do browser para construir esse payload.
- **Multer**: middleware Express para parsing de uploads.
- **Static files**: ficheiros servidos diretamente por URL (`/uploads/...`).

2. **Como funciona “por baixo”**

- O browser envia fronteiras (boundaries) multipart com metadados e bytes do ficheiro.
- Multer intercepta pedido, valida tipo/tamanho e grava no disco.
- Depois da gravação, a rota guarda no utilizador um caminho público (`avatarUrl`).
- `express.static(...)` mapeia a pasta física para URL pública.

3. **Porque estamos a fazer assim neste projeto**

- Avatar é um caso realista de integração fullstack com ficheiros.
- Reutilizamos sessão já autenticada para associar imagem ao utilizador certo.
- O retorno `{ avatarUrl }` simplifica atualização imediata da UI.

4. **Erros comuns e sintomas**

- 400 no upload com mensagem de ficheiro inválido -> tipo não imagem.
- 413 no upload -> ficheiro maior que limite.
- Upload 200 mas imagem não abre -> static não aponta para o diretório certo.
- Frontend envia JSON em vez de FormData -> `req.file` fica vazio.

5. **Boas práticas e segurança**

- Limitar tamanho de upload protege servidor e disco.
- Não confiar só no nome/extensão do ficheiro.
- Idealmente, em cenários reais, usar armazenamento dedicado e varredura de conteúdo.
- Manter diretório de uploads controlado e sem execução de código.

6. **Mini-exemplos pedagógicos (isolados)**
    > Exemplo isolado - analogia

```txt
FormData é como um envelope com vários compartimentos:
- campo "avatar" com ficheiro
- outros campos opcionais de texto
```

> Exemplo isolado - sintoma clássico

```txt
Se `req.file` é undefined, quase sempre o cliente não enviou multipart corretamente.
```

### Porque fazemos isto

É o exemplo completo de `multipart/form-data` com atualização de sessão visual na UI.

### 9.1) Criar `frontend/src/pages/ProfilePage.jsx`

- **Ponto de situação:** backend de upload já existe; falta integração final no frontend.
- **Objetivo deste passo:** enviar avatar em `FormData` e refrescar sessão para mostrar imagem nova.
- **Ficheiros:** criar/editar `frontend/src/pages/ProfilePage.jsx`.
- **Validação rápida:** após upload com sucesso, `avatarUrl` atualizado aparece no perfil sem reiniciar app.

```jsx
/**
 * Ficheiro: frontend/src/pages/ProfilePage.jsx
 * Objetivo: permitir upload de avatar e refletir a alteração no perfil atual.

 */

import { useState } from "react";
import { usePokedex } from "@/context/PokedexContext.jsx";
import { uploadAvatar } from "@/services/usersApi.js";

/**
 * Página de perfil com upload de avatar.
 *
 * @returns {JSX.Element}
 */
function ProfilePage() {
    const { user, refreshSession } = usePokedex();
    const [file, setFile] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);

    /**
     * Envia imagem para o backend e atualiza sessão local.
     *
     * @param {import("react").FormEvent<HTMLFormElement>} event
     * @returns {Promise<void>}
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setFeedback("");

        if (!file) {
            setFeedback("Escolhe uma imagem.");
            return;
        }

        setSubmitting(true);

        try {
            await uploadAvatar(file);
            // refreshSession volta a pedir /api/auth/me para apanhar avatarUrl novo.
            await refreshSession();
            setFeedback("Avatar atualizado com sucesso.");
            setFile(null);
        } catch {
            setFeedback("Não foi possível atualizar o avatar.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="pokedex__results">
            <h2>Perfil</h2>

            {user && (
                <>
                    <p>
                        <strong>{user.username}</strong> ({user.email})
                    </p>

                    {user.avatarUrl ? (
                        <img
                            // Construção de URL absoluta com base no backend configurado no frontend.
                            src={`${import.meta.env.VITE_API_URL}${user.avatarUrl}`}
                            alt={`Avatar de ${user.username}`}
                            width="140"
                            height="140"
                            style={{ objectFit: "cover", borderRadius: "12px" }}
                        />
                    ) : (
                        <p>Ainda sem avatar.</p>
                    )}
                </>
            )}

            <form onSubmit={handleSubmit}>
                <label>
                    Nova imagem
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        required
                    />
                </label>

                <button type="submit" disabled={submitting}>
                    {submitting ? "A enviar..." : "Atualizar avatar"}
                </button>
            </form>

            {feedback && <p className="pokedex__empty">{feedback}</p>}
        </section>
    );
}

export default ProfilePage;
```

### Checkpoint 9

- Upload devolve `avatarUrl` e o browser mostra imagem nova após `refreshSession()`.
- URL da imagem abre diretamente: `http://localhost:3000/uploads/...`.

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

- Este tutorial junta muitas peças; só testes fim-a-fim confirmam integração real.
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

Se não testares o fluxo completo (login -> favoritos -> equipas -> avatar -> logout), falhas de integração passam despercebidas.

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
    - sem login, `/favoritos`, `/equipas`, `/perfil` redirecionam para `/login`.
6. **Equipas**
    - criar equipa, pesquisar por nome, paginar, apagar equipa.
7. **Avatar**
    - upload de imagem no perfil e imagem visível após refresh.
8. **Logout**
    - logout limpa sessão; rotas protegidas deixam de ser acessíveis.

### 10.2) Erros comuns finais

- **CORS/cookies**: origem errada em `CLIENT_ORIGIN`.
- **CSRF**: mutações a falhar com 403 por ausência do header.
- **Imports**: `App.jsx` ainda a importar páginas de `components`.
- **Env vars**: frontend sem `VITE_API_URL` ou backend sem `JWT_SECRET`.
- **Uploads**: `express.static(uploadsDir)` em falta no `app.js`.

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
- Se um item falha, normalmente há efeito em cascata (ex.: auth falha -> rotas protegidas falham -> favoritos/equipas também).
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
- [ ] Equipas com paginação/pesquisa em backend e frontend.
- [ ] Upload de avatar implementado e visível no perfil.
- [ ] Rotas protegidas funcionam com `ProtectedRoute` e `authReady`.
- [ ] Testes manuais fim-a-fim executados com sucesso.

Se tudo estiver marcado, o projeto está concluído.

## Changelog (edições do enunciado)

- Substituídos placeholders de objetivo genérico em snippets (`User`, exemplo Axios, `Layout`, `App`, `LoginPage`, `RegisterPage`) por descrições concretas de função e contexto.
- Adicionado bloco **Estado inicial esperado (Fim da Ficha 05)** imediatamente antes de **Estrutura final esperada**.
- Adicionado bloco **1.1) Criar a v4 (cópia da v3)** para preservar o estado final da Ficha 05.
- Adicionado bloco **Mapa de migração (Checklist de integração)** imediatamente antes da secção **5) Frontend: refactor obrigatório para pages/components**.
- Incluídas categorias explícitas **MOVE / CREATE / EDIT / VERIFY** com caminho, local de inserção e checkpoint associado.
- Reforçada a secção **5.1** com regra para projetos que já tenham `src/pages`.
- Adicionada mini-regra para variações de naming em **5.1**: mover componentes de rota para `pages/` e manter UI reutilizável em `components/`.
- Mantidos contratos, endpoints, checkpoints e ordem geral das secções sem alterações funcionais.

![Footer](../../Images/Footer.png)
