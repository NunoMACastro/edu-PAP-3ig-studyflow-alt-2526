![Header](../../Images/Header.png)

# Deploy e Operação

## Ambientes

```text
Dev
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Prod
- Frontend: https://app.exemplo.pt
- Backend: https://api.exemplo.pt
```

## Variáveis de ambiente

```text
PORT=3000
MONGODB_URI=...
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=...
```

## Build e start

```bash
npm run build
npm start
```

> Confirma no `package.json` se o script é `start` ou `npm run start`.

## Logs e monitorização

- Logs: [LOCAL_LOGS]
- Health check: GET /health
- Alertas: [SISTEMA_ALERTAS]
- Não registar segredos nem dados pessoais.

## Rollback

- Processo: [DESCREVER_PASSOS]
- Validar /health após rollback

## Backup e restore

```bash
mongodump --uri "$MONGODB_URI" --out ./backups/AAAA-MM-DD
mongorestore --uri "$MONGODB_URI" ./backups/AAAA-MM-DD
```

- Frequência: [DIÁRIO | SEMANAL]
- Local: [LOCAL_BACKUP]

## Responsáveis

- Operação: [CONTACTO]
- Incidentes: [CONTACTO]

![Footer](../../Images/Footer.png)
