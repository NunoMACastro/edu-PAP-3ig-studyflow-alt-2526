# BK-MF6-04 - HTTPS obrigatório (TLS 1.2+).

## Header

- `doc_id`: `GUIA-BK-MF6-04`
- `bk_id`: `BK-MF6-04`
- `macro`: `MF6`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `MITIGADO_POR_ESCOPO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF14`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-05`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais documentar a mitigação de `RNF14` no alvo local: a API e a web escutam apenas em `127.0.0.1`, `trust proxy` fica desligado e headers de protocolo enviados pelo cliente nunca transformam HTTP em HTTPS confiável.

TLS 1.2+, HSTS e terminação HTTPS ficam `MITIGADO_POR_ESCOPO`. Qualquer exposição pública reabre obrigatoriamente este finding e exige proxy confiável, certificados, TLS/HSTS e nova auditoria; este BK não faz claim de produção.

#### Importância

`RNF14` é CANONICO nos requisitos não funcionais. Este BK existe porque a StudyFlow já tem autenticação, materiais, IA, turmas, salas e UX suficientes para precisar de garantias transversais: a aplicação deve continuar segura, responsiva e defensável quando aumenta o volume de dados e utilizadores.

Este guia também prepara `BK-MF6-05` porque entrega contratos, evidence e decisões técnicas que o próximo BK pode reutilizar.

#### Scope-in

- Implementar a decisão técnica mínima para `RNF14`.
- Criar ou ajustar os ficheiros listados em `Ficheiros a criar/editar/rever`.
- Validar cenário principal e cenário negativo com evidence objetiva.
- Preservar sessão HttpOnly, validação backend, ownership, membership e privacidade.
- Usar apenas caminhos públicos de aluno: `apps/api` e `apps/web`.

#### Scope-out

- Alterar RF/RNF, owner, sprint, prioridade ou dependências canónicas.
- Criar entidades de domínio que não existam na documentação.
- Adicionar dependências npm sem aprovação e justificação técnica.
- Mover regras de autorização para o frontend.
- Guardar segredos, sessões, hashes, prompts privados ou dados pessoais na evidence.
- Resolver observabilidade completa de MF7 ou compatibilidade de MF8 fora do handoff.

#### Estado antes e depois

- Estado antes: os BKs até MF5 entregam autenticação, materiais, IA, guardrails iniciais, UX transversal, feedback e smoke de concorrência.
- Estado depois: o arranque recusa host público, wildcard, proxy ativo e origens não-loopback; um header HTTPS forjado não altera essa decisão.

#### Pre-requisitos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md`

#### Glossário

- **RNF14:** requisito não funcional que este BK torna executável.
- **Job:** registo de trabalho com estado observável pela API ou por comando técnico.
- **Ownership:** regra que garante que um aluno só acede aos seus dados privados.
- **Membership:** regra que confirma pertença a sala, grupo, turma ou disciplina.
- **Evidence:** prova objetiva usada em PR, revisão e defesa PAP.
- **Fallback honesto:** erro ou resposta controlada que não inventa sucesso quando faltam condições.

#### Conceitos teóricos essenciais

- **RNF:** `RNF14` é CANONICO e define a qualidade que este BK torna implementável.
- **Contexto autenticado:** o utilizador vem da sessão backend e nunca de campos enviados pelo frontend.
- **Privacidade:** dados de aluno, professor, sala, turma e disciplina ficam separados por ownership, membership ou role.
- **Evidence:** a defesa PAP precisa de comando, output e interpretação, não apenas uma descrição textual.
- **Defesa em profundidade:** validação, cookies seguros, cabeçalhos e rate limit trabalham em conjunto no backend.
- **Erro seguro:** mensagens públicas dizem o necessário sem revelar segredos, sessões, hashes ou dados privados.

#### Arquitetura do BK

- Endpoint(s): todos os endpoints locais, limitados a loopback pelo loader tipado.
- Modelo/schema: reutiliza modelos existentes quando possível; só cria persistência nova quando o passo técnico a justificar.
- Service(s): `apps/api/src/common/middleware/require-https.middleware.ts` concentra a regra principal deste BK.
- Controller/route: expõe apenas contratos necessários ao RNF e mantém validação backend.
- Guard/middleware: sessão, CSRF, ownership, membership ou role ficam antes da regra de negócio.
- Cliente API: usa credentials include quando houver frontend autenticado.
- Testes: cenário principal e negativo obrigatório ligado ao requisito.
- Handoff para o próximo BK: `BK-MF6-05` consome a decisão técnica e a evidence produzida aqui.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/config/assert-local-pap-network.ts`
- EDITAR: `apps/api/src/main.ts`
- CRIAR: `apps/api/src/common/config/assert-local-pap-network.spec.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-04` entrega `RNF14` sem alterar IDs, owners, sprint, prioridade ou escopo da matriz.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- LOCALIZAÇÃO: linhas do requisito e linha canónica do BK.

3. Instruções do que fazer.

`CANONICO`: o título, requisito, prioridade e próximo BK vêm da matriz e do backlog. `DERIVADO`: as decisões técnicas abaixo são a menor implementação coerente com a stack já usada em `apps/api` e `apps/web`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa escopo e evita inventar entidades ou endpoints fora da documentação. A decisão protege a sequência MF5 -> MF6 -> MF7.

6. Validação do passo.

Confirma que o header mantém `RNF14`, `P0`, `S10`, `Reforco` e `proximo_bk: BK-MF6-05`.

7. Cenário negativo/erro esperado.

Se alguém alterar metadados sem evidência documental, a revisão deve falhar e a alteração deve voltar ao contrato canónico.

### Passo 2 - Ler contratos anteriores e risco principal

1. Objetivo funcional do passo no contexto da app.

Ligar este BK ao que já existe antes dele: `BK-MF6-03`, MF0 a MF5, autenticação por cookie, validação backend, materiais, fontes e IA quando entram no fluxo.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/common/guards/session.guard.ts`
- REVER: `apps/api/src/modules/auth/auth.controller.ts`
- LOCALIZAÇÃO: módulos já usados pela funcionalidade alvo.

3. Instruções do que fazer.

Identifica se o BK toca canal seguro, cookies Secure, proxy reverso e proteção de credenciais. Depois confirma que o backend valida o cabeçalho de protocolo vindo do proxy e recusa canal inseguro antes dos controllers.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é de leitura técnica. O aluno deve perceber o que já existe antes de criar ficheiros novos, para não duplicar controllers, services, DTOs ou regras de segurança.

6. Validação do passo.

Faz uma lista curta dos ficheiros que serão criados, editados e apenas revistos. A lista final deve coincidir com a secção de ficheiros deste BK.

7. Cenário negativo/erro esperado.

Se encontrares um endpoint equivalente já criado, não cries outro endpoint para a mesma responsabilidade; adapta o plano e regista a decisão na evidence.

### Passo 3 - Criar middleware principal do BK

1. Objetivo funcional do passo no contexto da app.

Implementar a regra central que torna `RNF14` observável e testável no backend.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/middleware/require-https.middleware.ts`
- LOCALIZAÇÃO: ficheiro completo, com imports, JSDoc e comentários didáticos.

3. Instruções do que fazer.

Cria o ficheiro abaixo e chama-o antes de construir a aplicação. A decisão usa apenas configuração local validada; headers do pedido não participam.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/config/assert-local-pap-network.ts
export type LocalPapNetworkConfig = {
    deploymentScope: string;
    host: string;
    trustProxy: boolean;
    webOrigins: string[];
};

/** Falha cedo quando a release local tenta sair de loopback. */
export function assertLocalPapNetwork(config: LocalPapNetworkConfig): void {
    const loopbackHosts = new Set(["127.0.0.1", "::1", "localhost"]);
    const originsAreLoopback = config.webOrigins.every((origin) => {
        const url = new URL(origin);
        return url.protocol === "http:" && loopbackHosts.has(url.hostname);
    });

    if (
        config.deploymentScope !== "local-pap" ||
        !loopbackHosts.has(config.host) ||
        config.trustProxy ||
        !originsAreLoopback
    ) {
        throw new Error("LOCAL_PAP_NETWORK_CONFIGURATION_REQUIRED");
    }
}
```

5. Explicação do código.

O guard de configuração impede exposição acidental. `trust proxy=false` significa que a API não confia em headers de protocolo ou IP enviados pelo cliente. HTTP só é aceitável por estar limitado ao próprio computador.

6. Validação do passo.

Executa teste unitário focado no middleware ou, se ainda não criares o teste neste passo, valida pelo TypeScript com `npm --prefix apps/api run build`.

7. Cenário negativo/erro esperado.

Tenta arrancar com `HOST=0.0.0.0`, origem wildcard, proxy ativo e host remoto. Todos os casos devem falhar antes de abrir a porta.

### Passo 4 - Integrar middleware no arranque da API

1. Objetivo funcional do passo no contexto da app.

Ligar o middleware ao ponto real da aplicação sem criar caminhos paralelos ou contratos duplicados.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/main.ts`
- REVER: `apps/api/src/app.module.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/main.ts`.

3. Instruções do que fazer.

Substitui o conteúdo de `apps/api/src/main.ts` pela versão abaixo ou aplica as mesmas decisões: carregar configuração tipada, validá-la antes do NestJS, manter `trust proxy=false` e fazer bind explícito a loopback.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/main.ts
/**
 * Arranca a aplicação e liga a configuração global necessária ao runtime.
 */
import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { csrfMiddleware } from "./common/middleware/csrf.middleware.js";
import { assertLocalPapNetwork } from "./common/config/assert-local-pap-network.js";
import { loadConfig } from "./common/config/load-config.js";
import { mf0ValidationExceptionFactory } from "./common/validation/mf0-validation-exception.factory.js";

/**
 * Arranca a API StudyFlow com os contratos transversais usados pela MF0 e MF6.
 *
 * @returns Promise resolvida quando o servidor HTTP estiver a escutar.
 */
async function bootstrap(): Promise<void> {
    const config = loadConfig();
    assertLocalPapNetwork(config);
    const app = await NestFactory.create(AppModule);
    app.getHttpAdapter().getInstance().set("trust proxy", false);

    app.use(cookieParser());
    app.use(csrfMiddleware);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: mf0ValidationExceptionFactory,
        }),
    );

    app.enableCors({
        origin: config.webOrigins,
        credentials: true,
    });

    await app.listen(config.port, "127.0.0.1");
}

bootstrap().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "API_STARTUP_FAILED");
    process.exitCode = 1;
});
```

5. Explicação do código.

A integração valida o scope antes de abrir a porta e faz bind explícito a `127.0.0.1`. Sessão, CSRF e validação backend continuam obrigatórios; nenhum header de um pedido pode ativar confiança em proxy.

6. Validação do passo.

Confirma que `apps/api/src/main.ts` compila, que o import aponta para `apps/api/src/common/middleware/require-https.middleware.ts` e que a API local continua a arrancar em desenvolvimento.

7. Cenário negativo/erro esperado.

Um pedido com header de protocolo forjado não altera `request.secure`, IP efetivo, host de bind nem o resultado do scope guard. Uma configuração pública deve impedir o arranque.

### Passo 5 - Adicionar teste e negativo obrigatório

1. Objetivo funcional do passo no contexto da app.

Criar uma prova pequena que falhe quando a regra de `RNF14` for removida.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/middleware/require-https.middleware.spec.ts`
- LOCALIZAÇÃO: teste unitário completo do middleware.

3. Instruções do que fazer.

Adiciona o teste abaixo e adapta apenas nomes de imports se a organização local do módulo exigir.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/config/assert-local-pap-network.spec.ts
import { assertLocalPapNetwork } from "./assert-local-pap-network.js";

describe("assertLocalPapNetwork", () => {
    const valid = {
        deploymentScope: "local-pap",
        host: "127.0.0.1",
        trustProxy: false,
        webOrigins: ["http://127.0.0.1:5173"],
    };

    it("aceita apenas configuração local explícita", () => {
        expect(() => assertLocalPapNetwork(valid)).not.toThrow();
    });

    it.each([
        { ...valid, host: "0.0.0.0" },
        { ...valid, trustProxy: true },
        { ...valid, webOrigins: ["https://studyflow.example"] },
        { ...valid, deploymentScope: "production" },
    ])("recusa exposição fora do scope local", (input) => {
        expect(() => assertLocalPapNetwork(input)).toThrow(
            "LOCAL_PAP_NETWORK_CONFIGURATION_REQUIRED",
        );
    });
});
```

5. Explicação do código.

O teste cobre a única configuração autorizada e rejeita host público, proxy, origem externa e scope de produção. Um teste HTTP adicional envia um header de HTTPS forjado e confirma que, com `trust proxy=false`, não ganha confiança nem altera o IP efetivo.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit`. Se o BK tocar deploy/proxy real, junta também a evidence operacional TLS descrita no passo 6.

7. Cenário negativo/erro esperado.

Altera temporariamente o host para `0.0.0.0` ou ativa `trust proxy`; a suite deve falhar se a API conseguir escutar.

### Passo 6 - Preparar evidence técnica e pedagógica

1. Objetivo funcional do passo no contexto da app.

Guardar prova suficiente para PR, apresentação e defesa PAP.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md`
- LOCALIZAÇÃO: secções de validação final e evidence.

3. Instruções do que fazer.

Regista comando executado, resultado observado, cenário negativo e interpretação curta. Não copies cookies, hashes, URIs completas, prompts privados, respostas IA privadas ou dados pessoais para a evidence.

4. Código completo, correto e integrado com a app final.

```bash
# Validar apenas a instância loopback e um header de protocolo forjado.
curl --fail --silent http://127.0.0.1:3000/api/runtime/scope
curl --fail --silent -H 'X-Forwarded-Proto: https' http://127.0.0.1:3000/api/runtime/scope
```

5. Explicação do código.

Os dois pedidos devem devolver a mesma identidade local: o header forjado não cria HTTPS nem altera a confiança. A evidence não guarda cookies, tokens, sessões, prompts, respostas IA ou dados pessoais.

6. Validação do passo.

Guarda apenas código HTTP, identidade local sanitizada e interpretação curta. TLS/HSTS não é validado neste scope porque não existe endpoint público autorizado.

7. Cenário negativo/erro esperado.

Se a API aceitar bind público, proxy ativo ou origem externa, a release local falha. Se o projeto vier a ser publicado, reabre imediatamente `RNF14` para implementação TLS/HSTS real.

### Passo 7 - Fechar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-05` consegue consumir o que este BK entrega sem reescrever a solução.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md`
- LOCALIZAÇÃO: Handoff e Changelog.

3. Instruções do que fazer.

Atualiza o handoff com exports, endpoints, comandos e riscos restantes. A decisão marcada como DERIVADO neste BK é: em desenvolvimento local, permitir HTTP para não bloquear aulas e testes locais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é garantir continuidade entre BKs. Este fecho evita que a MF6 fique como uma coleção de tarefas soltas.

6. Validação do passo.

Confirma que o próximo BK citado existe na matriz e que nenhum caminho interno de referência aparece no texto destinado ao aluno.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de algo que não foi entregue aqui, volta ao passo técnico correspondente e completa o contrato antes de fechar.

#### Critérios de aceite

- `RNF14` tem uma regra backend ou operacional verificável.
- O cenário principal produz output objetivo e repetível.
- O cenário negativo falha com erro controlado e sem dados sensíveis.
- A solução não depende de permissões decididas no frontend.
- Os caminhos de ficheiros usam apenas apps/api e apps/web.
- A evidence inclui comando, resultado observado e interpretação curta.
- O handoff para `BK-MF6-05` fica explícito.

#### Validação final

- `npm --prefix apps/api run build`
- `npm --prefix apps/api run test:unit`
- `npm --prefix apps/web run build` se o BK tocar frontend
- identity check em `http://127.0.0.1:3000/api/runtime/scope`
- teste de arranque negativo com host público, proxy ativo, wildcard e origem externa
- Cenário negativo obrigatório descrito no passo 5

#### Evidence para PR/defesa

- pr: link ou referência do commit com o BK implementado.
- proof_tecnico: output do build/teste/smoke.
- proof_scope: bind loopback, proxy desligado e header HTTPS forjado sem efeito.
- proof_negativos: erro controlado do cenário negativo.
- proof_privacidade: confirmação de que não foram expostos cookies, hashes, prompts, respostas IA privadas ou dados pessoais.
- proof_handoff: nota curta a explicar como BK-MF6-05 consome este trabalho.

#### Handoff

- Entrega para `BK-MF6-05`: scope local fail-closed, loopback e proxy desligado; TLS/HSTS permanece mitigado por scope e reabre com exposição pública.
- Export produzido: `assertLocalPapNetwork`.
- Decisão registada: HTTP é permitido exclusivamente em loopback no alvo local.
- Risco residual: TLS/HSTS não implementado; qualquer publicação reabre o BK.
- Não há alteração de RF/RNF nem mudança de matriz nesta entrega.

#### Changelog

- `2026-07-10`: contrato alinhado com `PAP_LOCAL_ENDURECIDA`, bind loopback, proxy desligado e TLS/HSTS mitigado por scope.
- `2026-06-22`: guia reescrito com estrutura pedagógica completa, passos técnicos, código integrado, validação e handoff para `BK-MF6-05`.
