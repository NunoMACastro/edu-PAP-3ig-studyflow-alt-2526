![Header](../Images/Header.png)

# React.js (12.º Ano) - Percurso do módulo

Este módulo transforma JavaScript em interfaces interativas. A ideia principal é simples: em vez de alterares o DOM passo a passo, descreves a interface a partir do estado, e o React atualiza o ecrã quando esse estado muda.

---

## Pré-requisitos

- **JavaScript moderno:** funções, arrays, objetos, módulos ES, `map`, `filter`, spread, destructuring e `async/await`.
- **HTML e CSS:** estrutura semântica, classes, formulários e estados visuais básicos.
- **Node.js + npm:** criação de projetos com Vite, instalação de dependências e scripts.
- **HTTP básico:** pedidos, respostas, JSON, status codes e CORS.

---

## O que vais aprender

- Criar componentes e escrever JSX.
- Passar dados com props e compor interfaces.
- Gerir estado, eventos, formulários e validação.
- Usar `useEffect` para sincronizar a interface com dados externos.
- Navegar com React Router.
- Consumir APIs Node/Express com contratos previsíveis.
- Lidar com autenticação em SPA ao nível conceptual.
- Trabalhar com upload, paginação, filtros e cliente de API.
- Introduzir testes, tooling, TypeScript e organização de projeto.
- Fechar o percurso com um mini-projeto guiado.

---

## Índice de ficheiros

1. [Fundamentos e setup de React](01_fundamentos_e_setup.md)
2. [JSX e componentes](02_jsx_e_componentes.md)
3. [Props e composição](03_props_e_composicao.md)
4. [Estado e eventos](04_estado_e_eventos.md)
5. [Listas e renderização condicional](05_listas_e_condicionais.md)
6. [Formulários controlados](06_formularios_controlados.md)
7. [Comunicação síncrona e assíncrona](07_comunicacao_sincrona_e_assincrona.md)
8. [useEffect e dados externos](08_useEffect_e_dados.md)
9. [React Router: fundamentos e setup](09_react_router_fundamentos.md)
10. [Navegação e rotas dinâmicas](10_navegacao_e_rotas_dinamicas.md)
11. [Consumo de API com backend Node.js](11_consumo_api_e_backend_node.md)
12. [Context API e estado global](12_context_api_estado_global.md)
13. [HTTP, REST, CORS e contratos de API](13_http_rest_cors_e_contratos_api.md)
14. [Autenticação em SPA: JWT, sessões e cookies](14_autenticacao_em_spa_jwt_sessions_cookies.md)
15. [Upload, paginação, filtros e cliente de API](15_upload_paginacao_filtros_e_cliente_api.md)
16. [Qualidade profissional: TypeScript, testes e tooling](16_qualidade_profissional_tooling_testes_typescript.md)
17. [Organização, boas práticas e mini-projeto guiado](17_organizacao_boas_praticas_e_miniprojeto_guiado.md)

---

## Ponte JavaScript -> React

React não substitui JavaScript. React usa JavaScript para organizar a interface.

- `map` transforma listas de dados em listas de componentes.
- `filter` cria listas filtradas sem alterar o array original.
- Spread (`...`) ajuda a criar novos objetos e arrays sem mutação direta.
- ES Modules (`import`/`export`) dividem componentes e funções por ficheiros.
- `async/await` aparece quando a interface precisa de dados de uma API.
- `fetch` liga o browser ao backend.
- O estado (`useState`) passa a ser a fonte de verdade da UI.

Modelo mental:

```text
dados + estado
  ↓
componentes React
  ↓
interface no browser
```

Quando o estado muda, o componente volta a renderizar. Por isso, em React pensas menos em “alterar este elemento do DOM” e mais em “que estado representa este ecrã?”.

---

## Modelo mental fullstack

Quando React consome uma API Node/Express, o fluxo típico é:

```text
evento no browser
  ↓
fetch no React
  ↓
rota Express
  ↓
controller
  ↓
validação
  ↓
service
  ↓
repository
  ↓
MongoDB ou ficheiro JSON
  ↓
resposta JSON
  ↓
estado atualizado no React
```

O React deve conhecer o contrato da API, mas não a base de dados. A API decide validação, permissões, erros e persistência. O frontend mostra estados de carregamento, sucesso e erro a partir das respostas que recebe.

---

## Contratos usados nos exemplos

O domínio canónico para exemplos novos é `tarefas`.

```json
{
    "id": "t1",
    "titulo": "Estudar React",
    "feito": false,
    "prioridade": "normal",
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z"
}
```

Listas paginadas usam:

```json
{
    "items": [],
    "page": 1,
    "limit": 20,
    "total": 0
}
```

O número total de páginas é calculado no cliente quando for necessário:

```js
const totalPages = Math.ceil(total / limit);
```

Erros vindos da API devem ser previsíveis:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Dados inválidos",
        "details": []
    }
}
```

---

## Preparação inicial

```bash
npm create vite@latest meu-app -- --template react
cd meu-app
npm install
npm run dev
```

Comandos frequentes:

- `npm install`: instala dependências.
- `npm run dev`: abre o projeto em desenvolvimento.
- `npm run build`: cria a versão final.
- `npm run preview`: testa localmente a versão final.

Endereços habituais:

- **Vite:** `http://localhost:5173`
- **API Node/Express:** `http://localhost:3000`

---

## Fichas práticas

- [Ficha 01 - Introdução](Fichas/FICHA_01_INTRO.md)
- [Ficha 02 - Task Tracker](Fichas/FICHA_02_TASK_TRACKER.md)
- [Ficha 03 - Meteo](Fichas/FICHA_03_METEO.md)
- [Ficha 04 - Quiz](Fichas/FICHA_04_QUIZ.md)
- [Ficha 05 Parte I - Pokedex](Fichas/FICHA_05_PARTE_I_POKEDEX.md)
- [Ficha 05 Parte II - Pokedex](Fichas/FICHA_05_PARTE_II_POKEDEX.md)
- [Ficha 05 Parte III - Pokedex](Fichas/FICHA_05_PARTE_III_POKEDEX.md)
- [Ficha 05 Parte IV - Pokedex](Fichas/FICHA_05_PARTE_IV_POKEDEX.md)
- [Ficha 05 Parte V - Pokedex](Fichas/FICHA_05_PARTE_V_POKEDEX.md)

---

## Troubleshooting rápido

- **Página em branco:** confirma `div#root`, imports e erros na consola.
- **Estado não atualiza:** confirma se usaste `setState` e se não mutaste objetos/arrays diretamente.
- **Efeito corre duas vezes em desenvolvimento:** pode ser `StrictMode`; confirma o capítulo de `useEffect`.
- **CORS:** verifica a configuração no backend e a origem correta do Vite.
- **404 ao fazer refresh numa rota:** a aplicação em produção precisa de fallback para `index.html`.
- **Erro com scripts no PowerShell:** usa um terminal compatível ou ajusta a política de execução do utilizador.

---

## Changelog

- 2026-05-30: README reestruturado com percurso do módulo, ponte JavaScript -> React, modelo fullstack, contratos de API e troubleshooting inicial.

![Footer](../Images/Footer.png)
