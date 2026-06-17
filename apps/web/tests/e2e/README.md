# Smoke E2E MF1

Este smoke valida a MF1 em browser com sessao real:

- professor cria turma, adiciona aluno, cria disciplina, material oficial, voz docente e publicacao;
- aluno entra na turma, consulta disciplina, usa IA da disciplina, cria sala, partilha apontamento e usa IA da sala.

## Ambiente

Por defeito, o Playwright arranca API e web:

- API: `http://127.0.0.1:3000`
- Web: `http://127.0.0.1:4175`
- MongoDB: embebido via `mongodb-memory-server`, salvo se `MONGODB_URI` estiver definida
- Redis: em memoria apenas no modo E2E, salvo se `REDIS_URL` estiver definida

O comando da API corre a seed `seed-development-users` antes de arrancar o servidor.
Durante o smoke, a API usa `STUDYFLOW_E2E_FAKE_AI=true`, para validar os fluxos IA sem depender de uma chave OpenAI real.

## Comandos

```bash
npm run test:e2e:install
npm run test:e2e
```

Para usar servidores ja arrancados manualmente:

```bash
STUDYFLOW_E2E_START_SERVERS=false PLAYWRIGHT_BASE_URL=http://127.0.0.1:4175 npm run test:e2e
```
