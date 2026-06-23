# BK-MF6-04 - HTTPS obrigatório (TLS 1.2+).

## Header

- `doc_id`: `GUIA-BK-MF6-04`
- `bk_id`: `BK-MF6-04`
- `macro`: `MF6`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF14`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-05`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md`
- `last_updated`: `2026-06-23`

#### Objetivo

Neste BK vais aplicar uma barreira backend para recusar tráfego inseguro em produção e documentar como validar TLS 1.2+ no proxy ou plataforma de deploy.

No fim, pedidos HTTP inseguros deixam de ser aceites em produção e a equipa passa a ter evidence objetiva do canal seguro. O foco é entregar uma melhoria real de qualidade, segurança, performance ou continuidade sem inventar requisitos fora de `RNF14`.

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
- Estado depois: pedidos HTTP inseguros deixam de ser aceites em produção e a equipa passa a ter evidence objetiva do canal seguro.

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

- Endpoint(s): `todos os endpoints HTTP da API em produção`.
- Modelo/schema: reutiliza modelos existentes quando possível; só cria persistência nova quando o passo técnico a justificar.
- Service(s): `apps/api/src/common/middleware/require-https.middleware.ts` concentra a regra principal deste BK.
- Controller/route: expõe apenas contratos necessários ao RNF e mantém validação backend.
- Guard/middleware: sessão, CSRF, ownership, membership ou role ficam antes da regra de negócio.
- Cliente API: usa credentials include quando houver frontend autenticado.
- Testes: cenário principal e negativo obrigatório ligado ao requisito.
- Handoff para o próximo BK: `BK-MF6-05` consome a decisão técnica e a evidence produzida aqui.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/middleware/require-https.middleware.ts`
- EDITAR: `apps/api/src/main.ts`
- CRIAR: `apps/api/src/common/middleware/require-https.middleware.spec.ts`
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

Cria o ficheiro abaixo e mantém a responsabilidade concentrada. O middleware não recebe decisões de permissão do frontend; usa configuração backend e o protocolo validado pelo proxy.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/middleware/require-https.middleware.ts
import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

/**
 * Recusa tráfego sem HTTPS em produção, assumindo proxy reverso configurado.
 */
@Injectable()
export class RequireHttpsMiddleware implements NestMiddleware {
    /**
     * Bloqueia pedidos HTTP em produção e deixa desenvolvimento local continuar.
     *
     * @param request Pedido Express recebido pela API.
     * @param _response Resposta Express, mantida para cumprir o contrato NestMiddleware.
     * @param next Função que entrega o pedido à próxima camada.
     */
    use(request: Request, _response: Response, next: NextFunction): void {
        if (process.env.NODE_ENV !== "production") {
            next();
            return;
        }

        const forwardedProto = String(request.headers["x-forwarded-proto"] ?? request.protocol)
            .split(",")[0]
            .trim()
            .toLowerCase();

        // Em produção, a API confia no protocolo validado pelo proxy e recusa downgrade para HTTP.
        if (forwardedProto !== "https") {
            throw new ForbiddenException({
                code: "HTTPS_REQUIRED",
                message: "Usa ligação HTTPS para aceder ao StudyFlow.",
            });
        }

        next();
    }
}
```

5. Explicação do código.

O middleware fica na fronteira da API e aplica `RNF14`: em produção, qualquer pedido sem protocolo HTTPS informado pelo proxy é recusado antes de chegar aos controllers. A leitura de `x-forwarded-proto` considera apenas o primeiro valor para evitar ambiguidades em cadeias de proxies. O ambiente local continua a aceitar HTTP para não bloquear aulas, testes e desenvolvimento sem certificado TLS.

6. Validação do passo.

Executa teste unitário focado no middleware ou, se ainda não criares o teste neste passo, valida pelo TypeScript com `npm --prefix apps/api run build`.

7. Cenário negativo/erro esperado.

Força um pedido com `NODE_ENV=production` e `x-forwarded-proto: http`. O resultado esperado é `ForbiddenException` com `code: "HTTPS_REQUIRED"`, sem revelar cookies, tokens ou headers sensíveis.

### Passo 4 - Integrar middleware no arranque da API

1. Objetivo funcional do passo no contexto da app.

Ligar o middleware ao ponto real da aplicação sem criar caminhos paralelos ou contratos duplicados.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/main.ts`
- REVER: `apps/api/src/app.module.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/main.ts`.

3. Instruções do que fazer.

Substitui o conteúdo de `apps/api/src/main.ts` pela versão completa abaixo ou aplica exatamente as mesmas alterações: importar `RequireHttpsMiddleware`, instanciar o middleware e registá-lo antes dos pipes/CORS/rotas.

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
import { RequireHttpsMiddleware } from "./common/middleware/require-https.middleware.js";
import { mf0ValidationExceptionFactory } from "./common/validation/mf0-validation-exception.factory.js";

/**
 * Arranca a API StudyFlow com os contratos transversais usados pela MF0 e MF6.
 *
 * @returns Promise resolvida quando o servidor HTTP estiver a escutar.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.use(csrfMiddleware);

    const requireHttps = new RequireHttpsMiddleware();
    // O bloqueio HTTPS fica antes das rotas para impedir que controllers processem tráfego inseguro.
    app.use(requireHttps.use.bind(requireHttps));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: mf0ValidationExceptionFactory,
        }),
    );

    app.enableCors({
        origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
        credentials: true,
    });

    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
}

void bootstrap();
```

5. Explicação do código.

A integração coloca o middleware no arranque real da API. O pedido inseguro é bloqueado antes dos controllers, mantendo sessão, CSRF e validação backend como camadas complementares. O frontend continua a usar cookies HttpOnly com `credentials: 'include'`, mas não decide se a ligação é segura; essa decisão fica no backend/proxy.

6. Validação do passo.

Confirma que `apps/api/src/main.ts` compila, que o import aponta para `apps/api/src/common/middleware/require-https.middleware.ts` e que a API local continua a arrancar em desenvolvimento.

7. Cenário negativo/erro esperado.

Em produção, um pedido com `x-forwarded-proto: http` deve falhar com `HTTPS_REQUIRED`. Em desenvolvimento local, o mesmo middleware deve chamar `next()` para não bloquear testes sem proxy TLS.

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
// apps/api/src/common/middleware/require-https.middleware.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { Request, Response } from "express";
import { RequireHttpsMiddleware } from "./require-https.middleware.js";

describe("RequireHttpsMiddleware", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    it("permite HTTPS em produção", () => {
        process.env.NODE_ENV = "production";
        const middleware = new RequireHttpsMiddleware();
        const next = jest.fn();

        // O proxy informa HTTPS e o pedido pode continuar para os controllers.
        middleware.use({ headers: { "x-forwarded-proto": "https" }, protocol: "http" } as Request, {} as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it("recusa HTTP em produção sem expor dados sensíveis", () => {
        process.env.NODE_ENV = "production";
        const middleware = new RequireHttpsMiddleware();
        const next = jest.fn();
        let thrown: unknown;

        try {
            // O cenário negativo prova que o backend não aceita downgrade para HTTP em produção.
            middleware.use({ headers: { "x-forwarded-proto": "http" }, protocol: "http" } as Request, {} as Response, next);
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(ForbiddenException);
        expect((thrown as ForbiddenException).getResponse()).toMatchObject({
            code: "HTTPS_REQUIRED",
            message: "Usa ligação HTTPS para aceder ao StudyFlow.",
        });
        expect(JSON.stringify((thrown as ForbiddenException).getResponse())).not.toMatch(/cookie|token|password/i);
        expect(next).not.toHaveBeenCalled();
    });
});
```

5. Explicação do código.

O teste cobre o caminho principal e o cenário negativo. O primeiro caso prova que HTTPS vindo do proxy deixa o pedido continuar. O segundo caso prova que HTTP em produção é recusado com erro controlado e sem dados sensíveis. O valor original de `NODE_ENV` é restaurado para não contaminar outros testes da suite.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit`. Se o BK tocar deploy/proxy real, junta também a evidence operacional TLS descrita no passo 6.

7. Cenário negativo/erro esperado.

Altera temporariamente `x-forwarded-proto` para `http` em produção e confirma que a suite falha se o middleware deixar o pedido seguir.

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
# Validar que o domínio público aceita TLS 1.2+ sem imprimir cookies nem tokens.
API_PUBLIC_HOST="${API_PUBLIC_HOST:?define o host publico da API antes de validar TLS}"
openssl s_client -connect "${API_PUBLIC_HOST}:443" -servername "${API_PUBLIC_HOST}" -tls1_2 </dev/null 2>/dev/null | grep -E "Protocol|Cipher|Verify return code"

# Validar que HTTP simples é redirecionado ou bloqueado no ponto público.
curl -I "http://${API_PUBLIC_HOST}" | grep -E "HTTP/|Location|Strict-Transport-Security"
```

5. Explicação do código.

Os comandos são evidence operacional, não código da aplicação. `openssl` confirma que o endpoint público aceita TLS 1.2 ou superior no proxy/deploy. `curl -I` confirma que HTTP simples não é servido como canal normal. A evidence não deve guardar cookies, tokens, sessões, prompts, respostas IA ou dados pessoais.

6. Validação do passo.

Guarda o output mínimo: protocolo/cifra, código HTTP observado e interpretação curta. Se ainda não houver domínio público, marca a validação operacional como bloqueada por ambiente, mantendo a validação unitária do middleware.

7. Cenário negativo/erro esperado.

Se `openssl -tls1_2` falhar ou se `curl -I http://...` devolver conteúdo normal sem redirecionar/bloquear, o requisito `RNF14` ainda não está demonstrado em produção.

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
- `openssl s_client -connect "${API_PUBLIC_HOST}:443" -servername "${API_PUBLIC_HOST}" -tls1_2`
- `curl -I "http://${API_PUBLIC_HOST}"`
- Cenário negativo obrigatório descrito no passo 5

#### Evidence para PR/defesa

- pr: link ou referência do commit com o BK implementado.
- proof_tecnico: output do build/teste/smoke.
- proof_tls: protocolo, cifra e código HTTP observados no domínio público, sem cookies nem tokens.
- proof_negativos: erro controlado do cenário negativo.
- proof_privacidade: confirmação de que não foram expostos cookies, hashes, prompts, respostas IA privadas ou dados pessoais.
- proof_handoff: nota curta a explicar como BK-MF6-05 consome este trabalho.

#### Handoff

- Entrega para `BK-MF6-05`: pedidos HTTP inseguros deixam de ser aceites em produção e a equipa passa a ter evidence objetiva do canal seguro.
- Export produzido: `RequireHttpsMiddleware`.
- Decisão DERIVADO registada: em desenvolvimento local, permitir HTTP para não bloquear aulas e testes locais.
- Risco residual: validar em ambiente semelhante ao deploy final antes de apresentar como garantia operacional.
- Não há alteração de RF/RNF nem mudança de matriz nesta entrega.

#### Changelog

- `2026-06-23`: corrigidos middleware, integração em `main.ts`, teste unitário robusto e evidence TLS 1.2+.
- `2026-06-22`: guia reescrito com estrutura pedagógica completa, passos técnicos, código integrado, validação e handoff para `BK-MF6-05`.
