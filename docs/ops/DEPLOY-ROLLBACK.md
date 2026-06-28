<!-- docs/ops/DEPLOY-ROLLBACK.md -->

# StudyFlow - deploy e rollback

## Release candidata

- Versão: preencher antes do deploy.
- Responsável técnico: preencher antes do deploy.
- Data prevista: preencher antes do deploy.
- Ambiente: staging ou produção.

## Checklist antes do deploy

<!-- Esta checklist impede publicar uma release sem condições mínimas de recuperação. -->
- Build da API executado com sucesso.
- Testes unitários críticos executados com sucesso.
- Versão definida em STUDYFLOW_RELEASE_VERSION.
- Plano de rollback revisto pela equipa.

## Deploy

1. Confirmar que a versão candidata está identificada.
2. Executar a validação de readiness.
3. Publicar a release apenas se a validação passar.
4. Guardar evidence dos comandos executados.

## Critérios para rollback

- Build publicado não inicia corretamente.
- Erro crítico impede login ou uso principal da aplicação.
- Falha operacional afeta alunos ou professores.
- Evidence mostra regressão bloqueante após deploy.

## Rollback

<!-- Os passos de rollback ficam explícitos para evitar improviso durante uma falha. -->
1. Parar a release atual.
2. Restaurar a última versão estável conhecida.
3. Confirmar que a aplicação volta a responder.
4. Registar causa, hora de início, hora de recuperação e responsável.

## Evidence obrigatória

- Comando de readiness executado.
- Resultado dos testes unitários críticos.
- Versão publicada ou restaurada.
- Decisão final: deploy mantido ou rollback executado.