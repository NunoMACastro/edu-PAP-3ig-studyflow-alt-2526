![Header](../Images/Header.png)

# Node.js (12.º Ano) - Percurso do módulo

Este módulo liga JavaScript ao lado do servidor. A ideia principal é simples: o código deixa de correr apenas no browser e passa a responder a pedidos HTTP, validar dados, organizar rotas e preparar uma API que pode ser consumida por React e ligada a dados persistidos em MongoDB.

---

## Pré-requisitos

- **JavaScript moderno:** `const`, `let`, funções, objetos, arrays, módulos ES e `async/await`.
- **Terminal:** criar projetos, instalar dependências e correr scripts `npm`.
- **HTTP básico:** perceber pedidos, respostas, métodos e status codes.
- **Git e `.env`:** saber distinguir código versionado de configuração local.

---

## O que vais aprender

- Perceber o papel do Node.js numa aplicação web.
- Criar um projeto Node com ES Modules.
- Usar módulos core como `path`, `fs/promises`, `process` e `crypto`.
- Comparar HTTP nativo com Express.
- Criar APIs com rotas, controladores, services e repositories.
- Validar input e responder com erros consistentes.
- Persistir dados em ficheiros JSON antes de avançar para MongoDB.
- Aplicar segurança base: CORS, Helmet, rate limit, logs e configuração.
- Testar APIs com Vitest e Supertest.
- Renderizar views com EJS quando fizer sentido usar server-side rendering.
- Diagnosticar erros comuns de módulos, portas, CORS, caminhos e Express.

---

## Índice de ficheiros

1. [Introdução ao Node.js](00_introducao_ao_node.md)
2. [Setup de projeto](00_setup_projeto.md)
3. [Módulos em Node.js](01_modulos_node.md)
4. [Node core útil](02_node_core.md)
5. [HTTP nativo vs Express](03_http_vs_express.md)
6. [Express básico](04_express_basico.md)
7. [Estrutura MVC leve e camadas](05_estrutura_mvc.md)
8. [Rotas, controladores e validação](06_rotas_controladores_validacao.md)
9. [Erros e asyncHandler](07_erros_e_async_handler.md)
10. [Persistência em ficheiro JSON](08_persistencia_json.md)
11. [Segurança, logging e compressão](09_seguranca_logging.md)
12. [Configuração e 12-Factor](10_config_e_12factor.md)
13. [Testes com Supertest e Vitest](11_testes_supertest_vitest.md)
14. [Views com EJS](12_ejs_views.md)
15. [Troubleshooting](13_troubleshooting.md)

---

## Stack usada

- **Node.js LTS** como runtime.
- **ES Modules** com `"type": "module"`.
- **Express** para rotas, middlewares e APIs HTTP.
- **async/await** para código assíncrono legível.
- **Vitest + Supertest** para testar endpoints.
- **EJS** como introdução opcional a views renderizadas no servidor.

As dependências aparecem quando resolvem um problema concreto. A regra geral é: primeiro perceber a necessidade, depois escolher a ferramenta.

---

## Modelo mental fullstack

Quando uma aplicação React fala com uma API Node, o fluxo típico é:

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

Cada camada tem uma responsabilidade. O React não deve conhecer a base de dados. O controller não deve conter toda a regra de negócio. O repository não deve decidir status HTTP. Esta separação torna o projeto mais fácil de testar e corrigir.

---

## Contratos usados nos exemplos

O domínio canónico para exemplos novos é `tarefas`.

```json
{
    "id": "t1",
    "titulo": "Estudar Node.js",
    "feito": false,
    "prioridade": "normal",
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z"
}
```

Listas paginadas devem usar o mesmo envelope:

```json
{
    "items": [],
    "page": 1,
    "limit": 20,
    "total": 0
}
```

Erros devem seguir um formato previsível:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Dados inválidos",
        "details": []
    }
}
```

Isto permite que React trate paginação e erros sem ter lógica diferente para cada endpoint.

---

## Ligação com outros módulos

- **JavaScript:** fornece funções, objetos, arrays, módulos, exceções e `async/await`.
- **React:** consome a API com `fetch`, mostra estados de carregamento e reage às respostas.
- **MongoDB:** substitui a persistência em JSON por uma base de dados documental.
- **Fullstack:** junta frontend, backend, contratos de API, configuração e persistência.

---

## Autenticação: ponte conceptual

Este módulo não cria um sistema completo de autenticação, mas prepara as ideias principais:

- autenticação responde à pergunta “quem és?”;
- autorização responde à pergunta “o que podes fazer?”;
- tokens e cookies devem ser tratados como dados sensíveis;
- validação, CORS, HTTPS, cookies `HttpOnly` e logs sem segredos fazem parte da mesma conversa de segurança.

Quando React envia um pedido autenticado, o backend continua a ser responsável por validar credenciais, sessão/token e permissões antes de devolver dados.

---

## Troubleshooting rápido

- **`Cannot use import statement outside a module`:** falta `"type": "module"` no `package.json`.
- **`ERR_MODULE_NOT_FOUND`:** confirma caminho relativo, extensão `.js` e nome do ficheiro.
- **`EADDRINUSE`:** a porta já está ocupada; fecha o processo ou muda `PORT`.
- **`req.body` vem `undefined`:** falta `app.use(express.json())`.
- **CORS bloqueado no browser:** a origem do frontend não está autorizada no backend.
- **Erro em async route não chega ao handler global:** confirma se a rota usa `asyncHandler` ou se o Express usado suporta promises como esperado.

---

## Changelog

- 2026-05-30: criado README do módulo de Node.js com percurso, stack, modelo fullstack, contratos e troubleshooting inicial.

![Footer](../Images/Footer.png)
