![Header](../Images/Header.png)

# .gitignore - Template abrangente (multi-stack)

> Objetivo: um `.gitignore` de referência para a maioria dos projetos (Node.js, Python, Java/C#, mobile, web). Inclui ficheiros de sistema (ex.: `.DS_Store`) e lixo de IDEs. Algumas decisões dependem do contexto do projeto, especialmente em **lockfiles** e **.vscode**.

## Enquadramento do template

Este template reúne padrões comuns de exclusão para projetos de programação. A estrutura está organizada por tipo de ficheiro para facilitar a leitura e a adaptação em aula.

- **Sistema e editores:** ficheiros gerados pelo sistema operativo ou pelo IDE.
- **Dependências e builds:** pastas recriáveis a partir do código e dos comandos do projeto.
- **Decisões de contexto:** secções comentadas, como lockfiles e `.vscode`, que dependem das regras definidas para cada projeto.

> Nota sobre **lockfiles** (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Pipfile.lock`, `poetry.lock`): em aplicações, por norma, o lockfile faz parte do repositório. As linhas estão comentadas para evitar exclusões acidentais.

---

## Template (.gitignore completo)

```gitignore
###############################
# SISTEMA / OS                #
###############################

# macOS
.DS_Store
.DS_Store?
.AppleDouble
.LSOverride
Icon
Icon?
._*
.Spotlight-V100
.Trashes
.fseventsd

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
*.lnk

# Linux
*~
.nfs*

# Comum
*.stackdump

###############################
# EDITORES / IDEs             #
###############################

# VS Code (ignora tudo por defeito, mas permite partilhar 2 ficheiros úteis)
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json

# JetBrains (IntelliJ/IDEA, PyCharm, Rider, etc.)
.idea/
*.iml

# Sublime / Vim / Emacs
*.sublime-workspace
*.sublime-project
*.swp
*.swo
*~
.emacs.d/

# Xcode
*.xcworkspace/
*.xcuserstate
*.xcuserdatad/
*.xccheckout
*.xcodeproj/project.xcworkspace/
*.xcodeproj/xcuserdata/
*.xcscmblueprint
DerivedData/

###############################
# AMBIENTES / SEGREDOS        #
###############################

.env
.env.*
.envrc
.venv/
venv/
venv*/
**/.env
**/.env.*
*.key
*.pem
*.p12
*.crt
*.cer
*.der
*.jks
*.keystore
*.pfx
*.secret
secrets.*
secret.*
*.token

###############################
# NODE / JS / TS              #
###############################

# Dependências e artefactos
node_modules/
**/node_modules/
bower_components/
jspm_packages/
.npm/
.pnpm-store/
.yarn/
.yarn/cache/
.yarn/unplugged/
.yarn/build-state.yml
.yarn/install-state.gz

# Logs e caches
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
*.log
.eslintcache
.stylelintcache
.cache/
.cache-loader/
.parcel-cache/
.vite/
.next/
.nuxt/
.svelte-kit/
.storybook-out/
storybook-static/

# Builds
dist/
build/
out/

# TypeScript
*.tsbuildinfo

# Lockfiles (normalmente fazem parte do repositório - linhas comentadas por segurança)
# package-lock.json
# yarn.lock
# pnpm-lock.yaml

###############################
# FRONTEND / WEB              #
###############################

# Frameworks/Tools
.tmp/
.tmp/*
.sass-cache/
bower_components/
coverage/
.nyc_output/

# Static hosts
.vercel/
.netlify/

###############################
# PYTHON                      #
###############################

# Compilados / cache
__pycache__/
*.py[cod]
*.pyo
*.pyd
*.so
*.dylib

# Builds / dist
build/
dist/
wheels/
*.egg-info/
.eggs/
*.egg
develop-eggs/
.installed.cfg
pip-wheel-metadata/

# Testes / ferramentas
.coverage
.coverage.*
htmlcov/
.tox/
.nox/
.pytest_cache/
.cache
.pyre/
.mypy_cache/
.pytype/
.ipynb_checkpoints/

# Ambientes virtuais (ver também secção AMBIENTES)
venv/
.venv/
env/
env*/

# Lockfiles (em geral, COMMITAR)
# Pipfile.lock
# poetry.lock
# requirements.lock

###############################
# JAVA / JVM                  #
###############################

# Gradle / Maven
.gradle/
build/
target/
out/
**/build/
**/target/
.mvn/wrapper/maven-wrapper.jar
!/.mvn/wrapper/maven-wrapper.jar

# IDE metadata
.settings/
.project
.classpath

# Bytecode / dumps
*.class
hs_err_pid*
replay_pid*

###############################
# C / C++ / GCC / CLANG       #
###############################

*.o
*.obj
*.gch
*.pch
*.a
*.lib
*.dll
*.so
*.dylib
*.exe
*.out
*.app

###############################
# C# / .NET                   #
###############################

# Artefactos
[Bb]in/
[Oo]bj/
[Ll]og/
[Tt]est[Rr]esult*/

# IDE / misc
.vs/
*.user
*.suo
*.userprefs
*.csproj.user
*.rsuser

# NuGet
*.nupkg
*.snupkg
packages/
# project.lock.json (obsoleto, não usar)
project.lock.json

###############################
# GO                          #
###############################

bin/
pkg/
*.test

###############################
# RUBY                        #
###############################

.bundle/
vendor/bundle/
coverage/
tmp/
log/
*.gem

###############################
# PHP / COMPOSER              #
###############################

vendor/
# composer.lock (em apps normalmente COMMITAR)
# composer.lock

###############################
# ANDROID                     #
###############################

.gradle/
/local.properties
.cxx/
captures/
*.apk
*.aab

###############################
# iOS / COCOA                 #
###############################

Pods/
Carthage/
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots
fastlane/test_output

###############################
# DOCKER                      #
###############################

.docker/
docker-compose.override.yml

###############################
# BASES DE DADOS / DATA       #
###############################

*.sqlite
*.sqlite3
*.db
*.mdb
*.tgz
*.tar
*.tar.gz
*.gz
*.7z
*.zip
*.rar
*.bak
*.old
*.orig
*.tmp

###############################
# DOCUMENTAÇÃO / OFFICE       #
###############################

~$*.doc*
~$*.xls*
~$*.ppt*

###############################
# MISC                        #
###############################

# Relatórios / cobertura
coverage/
reports/

# Artefactos diversos
Thumbs.db
Desktop.ini
.DS_Store
```

---

## Dicas finais

-   Mantém o `.gitignore` **curto e auditável**; remove o que não faz sentido para o projeto.
-   Preferível **comitar lockfiles** (Node, Python, PHP) em aplicações para builds reproduzíveis.
-   Em monorepos, `.gitignore` na raiz + ajustes granulares em cada pacote se necessário.

![Footer](../Images/Footer.png)
