![Header](../../Images/Header.png)

# [NOME_PROJETO]

[RESUMO_CURTO_EM_1_2_FRASES]

Este ficheiro funciona como modelo para um README de projeto. Os placeholders representam conteúdo que deve ser adaptado ao projeto real, e algumas secções podem não se aplicar a todos os casos.

## Funcionalidades principais

- [FUNCIONALIDADE_1]
- [FUNCIONALIDADE_2]
- [FUNCIONALIDADE_3]

## Tecnologias usadas

- Frontend: [TECNOLOGIAS_FRONTEND]
- Backend: [TECNOLOGIAS_BACKEND]
- Base de dados: [TECNOLOGIAS_BASE_DADOS]
- Autenticação: [COOKIE_HTTPONLY | BEARER]

## Decisões de referência

- Contrato de erro: `{ "error": { "code": "...", "message": "...", "details": [] } }`
- Listas devolvem envelope: `{ "items": [], "page": 1, "limit": 20, "total": 0 }`
- POST/GET detalhe devolvem objeto; PATCH devolve objeto atualizado; DELETE devolve `204`.
- Autenticação recomendada: cookie httpOnly com JWT. Alternativa: Bearer token (documentar header).
- Timestamps: `createdAt` / `updatedAt`.
- Paginação: `page >= 1`, `limit` com valor inicial 20 e máximo 100.

## Requisitos

- Node.js [VERSÃO]
- npm [VERSÃO]
- [OUTROS_REQUISITOS]

## Execução em desenvolvimento

### Instalação

```bash
# frontend
cd frontend
npm install

# backend
cd backend
npm install
```

### Variáveis de ambiente

- Criar `.env` no backend.
- Criar `.env` no frontend (se necessário).
- Entregar `.env.example` com todas as variáveis.

```text
# backend
PORT=3000
MONGODB_URI=...
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=...

# frontend
VITE_API_BASE=http://localhost:3000
```

### Comandos úteis

```text
- npm run dev: [DESCRIÇÃO]
- npm run test: [DESCRIÇÃO]
- npm run build: [DESCRIÇÃO]
- npm run start: [DESCRIÇÃO]
```

## Estrutura de documentação

- [DOCUMENTACAO_TECNICA.md](DOCUMENTACAO_TECNICA.md)
- [API.md](API.md)
- [DADOS.md](DADOS.md)
- [TESTES.md](TESTES.md)
- [DEPLOY.md](DEPLOY.md)
- [DOCUMENTACAO_CODIGO.md](DOCUMENTACAO_CODIGO.md)
- [DOCUMENTACAO_IA.md](DOCUMENTACAO_IA.md)
- [AGENTS.md](AGENTS.md)
- [AI_CONTEXT.md](AI_CONTEXT.md)
- [AI_PROFILES.md](AI_PROFILES.md)
- [AI_CONTRACTS.md](AI_CONTRACTS.md)
- [AI_TESTING.md](AI_TESTING.md)
- [AI_LIMITS.md](AI_LIMITS.md)
- [AI_CHANGELOG.md](AI_CHANGELOG.md)

## Quando algo não funciona

- Backend não arranca: confirmar `.env` e `MONGODB_URI`.
- CORS bloqueado: confirmar `CORS_ORIGIN`.
- Página em branco: confirmar `div#root` e consola.

## Antes de entregar

- [ ] README completo e sem placeholders
- [ ] API documentada (exemplos + erros)
- [ ] Dados documentados (campos/validações/índices)
- [ ] Testes mínimos descritos e como correr
- [ ] Deploy explicado, com ambientes e backups descritos
- [ ] Documentação para IA com regras e limites

## Última revisão

- Remover `[NOME_PROJETO]`, `[FUNCIONALIDADE_X]`, `TODO`, `TBD`, `???`.

## Licença

[LICENÇA]

## Contacto

[CONTACTO]

![Footer](../../Images/Footer.png)
