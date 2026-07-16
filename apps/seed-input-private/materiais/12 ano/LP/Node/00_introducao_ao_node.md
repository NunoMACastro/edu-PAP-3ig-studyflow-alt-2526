![Header](../Images/Header.png)

# Node.js (12.º Ano) - 00 · Introdução ao Node.js

> **Objetivo deste ficheiro**
>
> - Perceber o que é o Node.js e porque permite correr JavaScript fora do browser.
> - Entender o modelo mental do **runtime**, do **event loop** e de I/O assíncrono.
> - Identificar bons casos de uso para Node.js.
> - Relacionar Node.js com servidores HTTP, APIs REST e aplicações fullstack.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que é o Node.js](#sec-1)
- [2. [ESSENCIAL] Como o Node.js executa código](#sec-2)
- [3. [ESSENCIAL] Cliente, servidor e APIs REST](#sec-3)
- [4. [ESSENCIAL+] Quando Node.js é uma boa escolha](#sec-4)
- [5. [EXTRA] Runtime, npm e ecossistema](#sec-5)
- [Exercícios - Introdução ao Node.js](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo abre o percurso de Node.js. O foco é construir o mapa mental antes de criar projetos, instalar dependências ou escrever servidores Express.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam as ideias necessárias para entender os capítulos seguintes.
- **Aprofundamento:** as secções [ESSENCIAL+] ligam Node.js a decisões de projeto.
- **Contexto adicional:** as secções [EXTRA] ajudam a reconhecer termos e ferramentas que aparecem no ecossistema.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é o Node.js

### 1.1 Modelo mental

JavaScript nasceu para correr no browser. O Node.js permite correr JavaScript diretamente no sistema operativo.

Isto muda o tipo de programas que consegues criar:

- scripts de terminal;
- ferramentas de automação;
- servidores HTTP;
- APIs para aplicações React;
- programas que leem e escrevem ficheiros;
- aplicações em tempo real, como chat ou notificações.

O browser dá-te APIs como `document`, `window` e eventos de UI.

O Node.js dá-te APIs como:

- `node:fs` para ficheiros;
- `node:http` para servidores HTTP;
- `node:path` para caminhos;
- `node:crypto` para IDs, hashes e valores aleatórios seguros.

> Ideia central: o JavaScript é a linguagem; o Node.js é um ambiente onde essa linguagem corre fora do browser.

---

### 1.2 Primeiro contacto

Podes executar JavaScript diretamente no terminal:

```bash
node -e "console.log('Olá Node.js')"
```

Ou criar um ficheiro `hello.js`:

```js
/**
 * Primeiro script em Node.js.
 */
console.log("Primeiro script Node.js");
```

E executar:

```bash
node hello.js
```

Neste exemplo não existe HTML, CSS nem browser. O programa corre no terminal.

---

### 1.3 Node.js não é uma linguagem nova

Este código continua a ser JavaScript:

```js
const nome = "Ana";
const cursos = ["Programação", "Redes", "Sistemas"];

for (const curso of cursos) {
    console.log(`${nome} está a estudar ${curso}`);
}
```

O que muda é o ambiente:

| Ambiente | Onde corre | Exemplos de APIs disponíveis |
| --- | --- | --- |
| Browser | Página web | `document`, `localStorage`, `fetch`, eventos de clique |
| Node.js | Sistema operativo/servidor | `fs`, `http`, `path`, `process`, `crypto` |

---

### 1.4 Erros comuns

- Pensar que Node.js substitui o browser. Não substitui: corre noutro ambiente.
- Usar `document.querySelector` em Node.js. Essa API é do browser, não do Node.
- Achar que `npm` e Node.js são a mesma coisa. O Node executa JavaScript; o `npm` gere pacotes.

### 1.5 Checkpoint

- Explica, com as tuas palavras, a diferença entre JavaScript e Node.js.
- Dá dois exemplos de programas que fazem sentido em Node.js.
- Porque é que `document` não existe num script Node.js?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Como o Node.js executa código

### 2.1 As peças principais

O Node.js junta várias peças:

- **V8:** motor que compila e executa JavaScript.
- **libuv:** biblioteca que ajuda a lidar com operações assíncronas, como ficheiros, rede e timers.
- **Event loop:** mecanismo que coordena o que corre agora e o que fica à espera.
- **APIs core:** módulos nativos como `node:fs`, `node:http`, `node:path` e `node:crypto`.

Não precisas de decorar estes nomes todos no início. O importante é perceber que o Node.js é bom a esperar por operações externas sem bloquear tudo.

---

### 2.2 Código bloqueante vs assíncrono

Imagina uma API que precisa de ler um ficheiro antes de responder.

Se o servidor ficasse parado enquanto lê o ficheiro, todos os outros pedidos teriam de esperar.

Com código assíncrono, a ideia é diferente:

```text
pedido chega
  ↓
Node inicia leitura do ficheiro
  ↓
Node fica livre para tratar outros pedidos
  ↓
quando a leitura termina, a resposta continua
```

Em JavaScript moderno, isto aparece muitas vezes com `async/await`:

```js
import fs from "node:fs/promises";

/**
 * Lê um ficheiro de texto sem bloquear o event loop.
 *
 * @param {string} caminho
 * @returns {Promise<string>}
 */
export async function lerTexto(caminho) {
    return fs.readFile(caminho, "utf8");
}
```

---

### 2.3 O event loop em frase curta

O event loop é o mecanismo que permite ao Node.js coordenar:

- código JavaScript que está pronto a correr;
- timers como `setTimeout`;
- operações de ficheiro;
- pedidos de rede;
- callbacks e Promises.

Modelo mental:

```text
JavaScript corre
  ↓
operações demoradas ficam pendentes
  ↓
quando terminam, regressam à fila
  ↓
o event loop continua a execução
```

---

### 2.4 Erros comuns

- Pensar que `async/await` torna tudo paralelo. Na verdade, torna Promises mais fáceis de ler.
- Fazer trabalho muito pesado em CPU dentro do servidor. Isso pode bloquear o event loop.
- Ignorar Promises rejeitadas. Um erro assíncrono precisa de ser tratado.

### 2.5 Checkpoint

- O que significa dizer que Node.js é bom em operações I/O?
- Porque é que uma API não deve bloquear enquanto espera por ficheiros ou rede?
- Que problema pode acontecer se fizeres cálculos muito pesados no thread principal?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Cliente, servidor e APIs REST

### 3.1 Cliente-servidor

Numa aplicação fullstack simples existem duas partes:

- **Cliente:** a aplicação que pede dados. Pode ser React no browser, uma app móvel ou outro servidor.
- **Servidor:** a aplicação Node.js que recebe pedidos, valida dados, executa regras e devolve respostas.

Fluxo típico:

```text
React/browser
  ↓ pedido HTTP
Node.js/Express
  ↓ lê dados, valida, executa regras
resposta JSON
  ↓
React/browser atualiza a interface
```

---

### 3.2 O que é uma API

Uma API é um contrato de comunicação entre programas.

Exemplo de contrato simples:

| Método | URL | Significado |
| --- | --- | --- |
| `GET` | `/api/v1/todos` | Listar tarefas |
| `POST` | `/api/v1/todos` | Criar tarefa |
| `GET` | `/api/v1/todos/:id` | Obter uma tarefa |
| `PATCH` | `/api/v1/todos/:id` | Atualizar parte de uma tarefa |
| `DELETE` | `/api/v1/todos/:id` | Remover uma tarefa |

Uma resposta JSON pode ser:

```json
{
    "id": "7f8f6b2a-5d9f-4c03-bc3c-1d6f7d9851bb",
    "titulo": "Estudar Node.js",
    "concluido": false
}
```

---

### 3.3 REST em poucas ideias

REST é uma forma comum de desenhar APIs HTTP.

Ideias importantes:

- URLs representam recursos: `/todos`, `/users`, `/products`.
- Métodos HTTP representam ações: `GET`, `POST`, `PATCH`, `DELETE`.
- Cada pedido deve trazer a informação necessária.
- O servidor responde com status HTTP e, muitas vezes, JSON.

---

### 3.4 Erros comuns

- Usar verbos na URL, como `/criarTodo`, quando `POST /todos` é mais claro.
- Devolver sempre status `200`, mesmo quando há erro.
- Misturar a lógica de interface com a lógica do servidor.

### 3.5 Checkpoint

- Qual é a diferença entre cliente e servidor?
- O que representa a URL `/api/v1/todos/:id`?
- Porque é que `POST /todos` faz mais sentido do que `GET /criarTodo`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Quando Node.js é uma boa escolha

### 4.1 Bons cenários

Node.js é especialmente útil quando a aplicação passa muito tempo à espera de I/O:

- APIs REST;
- backends para aplicações React;
- gateways que agregam dados de várias APIs;
- ferramentas CLI;
- automações;
- aplicações em tempo real.

Também é uma boa escolha quando queres manter JavaScript no frontend e no backend.

---

### 4.2 Cenários onde é preciso cuidado

Node.js pode não ser a melhor primeira escolha para:

- cálculo científico pesado;
- processamento de vídeo;
- machine learning intensivo;
- tarefas que ocupam CPU durante muito tempo.

Existem soluções em Node.js, como Worker Threads, mas a decisão deve depender do problema.

---

### 4.3 Checkpoint

- Dá um exemplo de aplicação onde Node.js faz sentido.
- Dá um exemplo onde Node.js pode exigir cuidado.
- Porque é que usar JavaScript no frontend e backend pode simplificar um projeto?

<a id="sec-5"></a>

## 5. [EXTRA] Runtime, npm e ecossistema

### 5.1 Termos úteis

- **Runtime:** ambiente que executa código. Node.js é um runtime JavaScript.
- **LTS:** versão com suporte prolongado, recomendada para projetos estáveis.
- **npm:** gestor de pacotes que instala bibliotecas e executa scripts.
- **npx:** executa comandos de pacotes sem instalação global permanente.
- **ES Modules:** sistema moderno de módulos com `import` e `export`.
- **CommonJS:** sistema antigo do Node.js com `require` e `module.exports`.

---

### 5.2 Mini linha temporal

| Ano | Marco |
| --- | --- |
| 2008 | O motor V8 aparece no Chrome. |
| 2009 | Node.js junta V8, I/O assíncrono e APIs de sistema. |
| 2010-2014 | O ecossistema npm cresce muito e Express torna-se popular. |
| 2015+ | ES Modules começam a ganhar espaço no JavaScript moderno. |
| Atualidade | Node.js é usado em APIs, tooling web, automação e aplicações fullstack. |

---

### 5.3 Próximos passos

O percurso segue por esta ordem:

1. configurar um projeto Node.js;
2. perceber módulos;
3. usar APIs core;
4. criar servidores HTTP;
5. evoluir para Express;
6. organizar rotas, controladores, validação, erros e persistência.

<a id="exercicios"></a>

## Exercícios - Introdução ao Node.js

1. Confirma a versão instalada com `node --version` e `npm --version`.
2. Cria `hello.js` e imprime uma mensagem no terminal.
3. Cria um array com três tarefas e imprime cada uma com `for...of`.
4. Explica por escrito a diferença entre browser e Node.js.
5. Escreve três exemplos de APIs core do Node.js e para que servem.
6. Desenha o fluxo `cliente -> servidor -> resposta`.
7. Cria uma tabela com quatro endpoints REST para um recurso `livros`.
8. Identifica que status HTTP usarias para sucesso, criação, erro de validação e recurso não encontrado.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, enquadramento, modelos mentais, checkpoints e exercícios.
- 2025-11-10: criação do capítulo introdutório com história, arquitetura, casos de uso e glossário do Node.js.

![Footer](../Images/Footer.png)
