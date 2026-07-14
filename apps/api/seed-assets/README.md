# StudyFlow demo seed assets

Os PDFs desta pasta são fixtures pedagógicas estáveis usadas exclusivamente
pela seed de demonstração. A seed valida assinatura, tamanho e manifesto antes
de qualquer reset e copia os bytes através de `MaterialStorageService`.

Para recriar a base Atlas e o storage local:

```bash
NODE_ENV=development \
STUDYFLOW_ALLOW_DEV_SEED=true \
STUDYFLOW_REPLACE_EXISTING_DATA=true \
STUDYFLOW_RESET_CONFIRMATION=studyflow \
STUDYFLOW_DEMO_MODE=true \
STUDYFLOW_DEMO_FAKE_AI=true \
npm run seed:dev
```

Para arrancar a API sem chamadas externas de IA:

```bash
npm run start:demo
```
