# StudyFlow local com Docker Compose

Este diretório contém tudo o que é necessário para executar o StudyFlow sem
MongoDB Atlas e sem instalar MongoDB ou Redis diretamente no Windows/macOS.
O Docker executa apenas a infraestrutura; a API e a aplicação web continuam a
ser executadas localmente com Node.js, preservando o desenvolvimento e o hot
reload habituais.

## Serviços locais

- MongoDB `8.0.23`, em `127.0.0.1:27017`, com o replica set `studyflow-rs`.
- Redis `7.4.9-alpine`, em `127.0.0.1:6379`, com persistência AOF.
- Volumes Docker separados para os dados de MongoDB e Redis.
- Portas expostas apenas em loopback; os serviços não ficam acessíveis através
  da rede local.

O ambiente local não usa autenticação no MongoDB ou Redis porque os dois
serviços estão limitados a `127.0.0.1`. Esta configuração não deve ser exposta
noutra interface de rede sem adicionar autenticação e TLS.

No Windows, o storage privado usa as ACLs NTFS herdadas do perfil do utilizador;
em macOS/Linux, a API também valida explicitamente os modos POSIX `0600`/`0700`.

## Pré-requisitos

- Docker Desktop recente, com Docker Compose e suporte para `up --wait`.
- Node.js `24.11.1`.
- npm `11.6.2`.
- Git.

Confirmar as versões no PowerShell:

```powershell
docker compose version
node --version
npm --version
```

O Docker Desktop tem de estar iniciado antes de executar os comandos seguintes.
Na primeira utilização, o Docker também precisa de acesso à Internet para obter
as imagens oficiais de MongoDB e Redis.

## Primeira utilização no Windows/PowerShell

Abrir o PowerShell na raiz do repositório e entrar em `apps`:

```powershell
cd apps
```

Criar o ficheiro de ambiente da API sem substituir uma configuração existente:

```powershell
if (-not (Test-Path api\.env)) {
  Copy-Item api\.env.example api\.env
}
```

O template já contém as ligações locais esperadas:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/studyflow?replicaSet=studyflow-rs
REDIS_URL=redis://127.0.0.1:6379/1
```

`OPENAI_API_KEY` fica vazio por predefinição. A API pode arrancar assim; apenas
as funcionalidades que exigem IA real devolvem um erro controlado até ser
configurada uma chave válida. Nunca adicionar chaves ou passwords ao Git.

Arrancar MongoDB e Redis e esperar pela sua disponibilidade:

```powershell
docker compose up -d --wait
```

Instalar exatamente as dependências registadas nos lockfiles:

```powershell
npm --prefix api ci
npm --prefix web ci
```

### Seed inicial

A seed é deliberadamente manual. O comando normal é idempotente: pode ser
repetido sem duplicar as contas de desenvolvimento nem apagar a base de dados.

```powershell
$env:STUDYFLOW_ALLOW_DEV_SEED = "true"
npm --prefix api run seed:dev-users
Remove-Item Env:STUDYFLOW_ALLOW_DEV_SEED
```

Não definir `STUDYFLOW_REPLACE_EXISTING_DATA`; essa opção pertence apenas a um
fluxo explícito de substituição destrutiva e não é necessária na instalação.

### Arranque da aplicação

Manter MongoDB e Redis no Docker e abrir dois terminais PowerShell em `apps`.

Terminal da API:

```powershell
npm --prefix api run start:dev
```

Terminal da aplicação web:

```powershell
npm --prefix web run dev
```

## Utilizações seguintes

Depois de atualizar o repositório, executar a partir da raiz:

```powershell
git pull
cd apps
docker compose up -d --wait
```

Voltar a executar `npm --prefix api ci` e/ou `npm --prefix web ci` quando o
respetivo `package-lock.json` tiver sido alterado. Depois, arrancar API e web com
os comandos da secção anterior. Não é necessário repetir a seed em cada
arranque.

## Diagnóstico

Ver o estado e os health checks:

```powershell
docker compose ps
```

Consultar os últimos logs:

```powershell
docker compose logs --tail=100 mongo
docker compose logs --tail=100 redis
```

Confirmar o Redis na DB `1`; a resposta esperada é `PONG`:

```powershell
docker compose exec redis redis-cli -n 1 ping
```

Confirmar o nome e o primary gravável do replica set:

```powershell
docker compose exec mongo mongosh --quiet "mongodb://127.0.0.1:27017/admin?directConnection=true" --eval "const hello = db.hello(); printjson({ setName: hello.setName, isWritablePrimary: hello.isWritablePrimary })"
```

O resultado esperado contém `setName: 'studyflow-rs'` e
`isWritablePrimary: true`. A inicialização é idempotente: os arranques seguintes
nunca reconfiguram um replica set existente.

Com a API iniciada, os endpoints operacionais são:

```text
http://127.0.0.1:3000/api/health/live
http://127.0.0.1:3000/api/health/ready
```

`live` confirma que o processo está ativo; `ready` só responde com sucesso
quando as dependências necessárias estão prontas.

## Parar e preservar os dados

Este comando para e remove os contentores/rede, mas conserva os dados nos named
volumes:

```powershell
docker compose down
```

O comando seguinte é destrutivo e apaga todos os dados locais de MongoDB e
Redis deste projeto. Nunca é executado automaticamente:

```powershell
docker compose down -v
```

Usá-lo apenas quando a eliminação total dos dados locais for intencional. Após
essa operação será necessário arrancar novamente o Compose e repetir a seed.

## Problemas frequentes

### Docker não está iniciado

Erros sobre `docker engine`, `daemon` ou `docker.sock` significam normalmente
que o Docker Desktop ainda não está pronto. Iniciar o Docker Desktop, esperar
pelo estado operacional e repetir:

```powershell
docker compose up -d --wait
```

Se `--wait` não for reconhecido, atualizar o Docker Desktop/Compose. Não remover
o `--wait`, porque é ele que garante que os serviços estão prontos antes da API.

### Porta 27017 ou 6379 ocupada

Verificar processos concorrentes no PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 27017,6379 -ErrorAction SilentlyContinue
```

Parar o MongoDB/Redis instalado localmente ou outro contentor que esteja a usar
a porta e repetir o arranque. As portas não devem ser alteradas silenciosamente,
pois fazem parte da configuração local da API e do replica set.

### MongoDB ainda não está primary

Consultar `docker compose ps` e os logs do serviço `mongo`. Durante um cold
start, o health check inicializa o replica set uma única vez e aguarda até o nó
aceitar escritas. A API não deve ser iniciada enquanto o serviço não estiver
`healthy`.

### Foi executado `down -v`

Os dados locais foram removidos. Executar `docker compose up -d --wait` e a seed
manual. Não existe fallback para Atlas nem recuperação automática a partir de
uma base remota.
