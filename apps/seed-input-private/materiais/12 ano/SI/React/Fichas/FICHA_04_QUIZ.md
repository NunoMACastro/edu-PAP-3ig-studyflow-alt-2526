![Header](../../Images/Header.png)

# Tutorial passo a passo - Quiz Game: Jogo de Perguntas (Ficha React 12.º ano)

Esta ficha apresenta a construção de uma pequena app React em formato de jogo.

O objetivo é consolidar hooks e fluxo de dados em React com uma app divertida, mas controlada. A ficha começa com perguntas locais e só depois passa para perguntas vindas de uma API pública.

Objetivo desta versão da ficha:

1. Manter progressão realmente incremental.
2. Separar claramente lógica local, dados externos e interface.
3. Trabalhar dois usos diferentes de `useEffect`.
4. Mostrar quando props são suficientes e quando Context ajuda.
5. Garantir checkpoints curtos e validáveis.

Competências trabalhadas:

1. Setup e estrutura base com Vite.
2. JSX e renderização condicional.
3. Estado com `useState`.
4. Eventos e formulários controlados.
5. Listas com `.map()` e `key`.
6. Valores derivados com `useMemo`.
7. Efeito local com `useEffect` para temporizador.
8. Efeito externo com `useEffect` para carregar dados de API.
9. Componentização com props e callbacks.
10. Prop drilling e `useContext`.

### Entrega do trabalho

O repositório final deve ser entregue até ao dia **18/05 às 23:55**.

Além da app funcionar, a entrega inclui uma responsabilidade extra: **JSDoc dos snippets preenchidos da melhor forma possível**.

Nesta ficha, vários JSDoc aparecem como template. Em cada função ou componente, a explicação deve indicar:

- o **propósito** da função/componente;
- o que ela **produz/devolve**;
- o significado dos parâmetros, quando existirem;
- qualquer detalhe importante para outra pessoa perceber o código sem adivinhar.

---

## 0) O que vais construir

Uma app chamada **Quiz Game** onde o jogador responde a perguntas para testar conhecimentos.

A app permite:

- escrever o nome do jogador;
- escolher dificuldade;
- começar um jogo;
- responder a perguntas de escolha múltipla;
- ver um temporizador por pergunta;
- calcular pontuação final;
- carregar perguntas da **Open Trivia DB**;
- mostrar estados de loading e erro;
- alternar tema claro/escuro;
- perceber e resolver um caso simples de prop drilling.

### Vocabulário rápido

- **Estado (`state`)**: dados que mudam durante a execução da app.
- **Estado derivado**: valor calculado a partir de outro estado.
- **Efeito (`useEffect`)**: código que reage a alterações ou interage com o exterior.
- **API**: serviço externo que devolve dados.
- **Loading**: estado visual enquanto algo está a carregar.
- **Erro**: estado visual quando algo falha.
- **Props**: dados/funções passadas de um componente pai para um filho.
- **Callback**: função passada por props para o filho comunicar uma ação ao pai.
- **Prop drilling**: passar props por vários componentes que não precisam delas diretamente.
- **Context**: forma de disponibilizar dados a vários componentes sem passar props por todos os níveis.

### Organização da ficha

- A progressão está dividida em fases curtas e incrementais.
- Cada fase acrescenta uma parte do jogo ou uma decisão de arquitetura.
- Os checkpoints assinalam estados intermédios esperados da aplicação.
- Os comentários do código e os JSDoc destacam o raciocínio por trás de hooks, componentes e serviços.
- A secção de erros comuns reúne sintomas frequentes e pistas de diagnóstico.

### Tipos de snippets desta ficha

Esta ficha inclui snippets de duas formas:

1. **Versão completa de ficheiro**: aparece quando o enunciado identifica um ficheiro inteiro, por exemplo `src/App.jsx`.
2. **Alteração incremental**: aparece quando o enunciado identifica uma função, constante, bloco de JSX ou estado específico.

Critérios de leitura:

- Se o snippet começa com imports e termina com `export default`, normalmente é uma versão completa do ficheiro.
- Se o snippet mostra só uma função, uma constante ou um pedaço de JSX, é uma alteração incremental.
- Blocos condicionais são identificados pela condição de entrada, por exemplo `{gameStatus === "playing" && (...)}`.
- Alterações incrementais mantêm o restante ficheiro igual, salvo indicação explícita de substituição completa.
- A releitura do ficheiro completo ajuda a detetar variáveis duplicadas ou blocos fora do sítio.

### Critérios dos JSDoc

Os blocos JSDoc com `[Completa: ...]` reservam espaço para uma explicação própria.

Um bom JSDoc nesta ficha responde a duas perguntas:

1. **Qual é o propósito desta função/componente?**
2. **O que esta função/componente produz ou devolve?**

Exemplo de resposta demasiado vaga:

```jsx
/**
 * Propósito: faz o botão funcionar.
 * Produz/Devolve: coisas.
 */
```

Exemplo de resposta melhor:

```jsx
/**
 * Propósito: validar o nome do jogador e iniciar um novo jogo quando a entrada é válida.
 * Produz/Devolve: não devolve JSX; altera o estado da app para começar o fluxo de jogo.
 */
```

### Debug rápido para toda a ficha

1. Estás na pasta certa? (`pwd`)
2. O servidor está a correr? (`npm run dev`)
3. Guardaste o ficheiro antes de testar?
4. A consola do browser mostra erros?
5. O terminal mostra erros de import?
6. Os nomes dos ficheiros batem certo com os imports?
7. O pedido à API aparece no separador Network?

### Pontos de paragem

- **Paragem A**: layout base com estilos.
- **Paragem B1**: nome e dificuldade controlados por estado.
- **Paragem B2**: estado do jogo (`idle`, `playing`, `finished`).
- **Paragem C1**: perguntas locais carregadas.
- **Paragem C2**: resposta avança para a pergunta seguinte.
- **Paragem C3**: resultado final aparece.
- **Paragem D1**: estatísticas calculadas com `useMemo`.
- **Paragem D2**: respostas baralhadas sem mudar a cada render.
- **Paragem E1**: temporizador desce com `useEffect`.
- **Paragem E2**: tempo esgotado bloqueia respostas.
- **Paragem F**: app separada em componentes com props.
- **Paragem G**: loading, erro e serviço da API criados.
- **Paragem H**: perguntas carregadas da API com `useEffect`.
- **Paragem I**: prop drilling identificado.
- **Paragem J**: `useContext` usado para preferências globais.
- **Paragem K**: perguntas traduzidas para português com fallback.

### Mapa mental da app

- **Dados locais**: `localQuestions.js`, usados para aprender a mecânica do jogo.
- **Dados externos**: perguntas carregadas da Open Trivia DB.
- **Tradução externa**: textos traduzidos pela MyMemory, quando possível.
- **Estado principal**: vive no `App.jsx`.
- **Componentes**: mostram partes da interface e recebem props.
- **Serviço da API**: vive em `services/triviaApi.js`.
- **Context**: guarda preferências globais simples, como jogador, dificuldade e tema.

### Ligações diretas aos temas

1. **`useState`** - nome, dificuldade, estado do jogo, pergunta atual, respostas, tempo, loading e erro.
2. **`useEffect` local** - temporizador que diminui de segundo em segundo.
3. **`useEffect` externo** - pedido à API quando começa um jogo.
4. **`useMemo`** - estatísticas finais e respostas baralhadas.
5. **Props** - componentes recebem dados e callbacks.
6. **Prop drilling** - exemplo com `theme`, `playerName` e `difficulty`.
7. **`useContext`** - preferências globais sem passar props por todos os níveis.
8. **Camada de tradução** - segunda API com fallback para manter a app funcional.

### Conceitos essenciais

**1) Fluxo de dados**

- A interface mostra o estado atual.
- Quando o estado muda, o React volta a renderizar.
- O dado desce por props.
- As ações sobem por callbacks.

**2) Estado local vs dados externos**

- `playerName`, `difficulty`, `gameStatus`, `timeLeft` são estados locais.
- As perguntas da API são dados externos.
- Dados externos podem demorar, falhar ou vir num formato diferente do que a app precisa.

**3) Renderização condicional**

A app mostra ecrãs diferentes conforme `gameStatus`:

- `idle`: ecrã inicial;
- `loading`: a carregar perguntas;
- `playing`: pergunta atual;
- `finished`: resultado final.

**4) Efeitos**

Usamos `useEffect` quando a app precisa de fazer algo fora do cálculo normal do JSX:

- esperar 1 segundo e diminuir o tempo;
- fazer um pedido HTTP;
- cancelar um pedido se o componente deixar de precisar dele.

**5) Memoização**

`useMemo` deve ser usado para valores derivados que queremos recalcular apenas quando certas dependências mudam.

Nesta ficha usamos para:

- estatísticas finais;
- respostas baralhadas da pergunta atual.

**6) Props vs Context**

- Usa props quando o pai comunica diretamente com o filho.
- Usa Context quando vários componentes distantes precisam do mesmo dado global.
- Context não substitui todas as props.

---

## 1) Pré-requisitos

- Node.js 18+
- npm
- VS Code ou outro editor

Verifica versões:

```bash
node -v
npm -v
```

---

## 2) Criar o projeto

```bash
npm create vite@latest ficha04-quiz-game -- --template react
cd ficha04-quiz-game
npm install
npm run dev
```

Opcional:

```bash
code .
```

---

## 3) Limpeza inicial

Se quiseres começar limpo:

- apagar `src/App.css`;
- remover `import "./App.css"` do `src/App.jsx`;
- apagar `src/assets/`, se existir.

No mínimo, mantém:

```text
src/
  App.jsx
  main.jsx
```

---

## 4) Estrutura de pastas da ficha

Ao longo da ficha, o projeto vai ficar assim:

```text
ficha04-quiz-game/
├─ index.html
├─ package.json
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ data/
   │  └─ localQuestions.js
   ├─ services/
   │  ├─ triviaApi.js
   │  └─ translationApi.js
   ├─ context/
   │  └─ GameSettingsContext.jsx
   ├─ components/
   │  ├─ ErrorState.jsx
   │  ├─ LoadingState.jsx
   │  ├─ QuestionCard.jsx
   │  ├─ ResultScreen.jsx
   │  ├─ StartScreen.jsx
   │  └─ TimerBar.jsx
   └─ styles/
      ├─ index.css
      └─ quiz.css
```

Cria as pastas quando forem necessárias. Não precisas de criar tudo já.

---

## 5) Estilos base

Ideia desta fase:

- preparar uma interface simples, legível e consistente;
- evitar excesso de estilos inline nas fases finais.

Ficheiros a criar/editar nesta fase:

- criar `src/styles/index.css`;
- criar `src/styles/quiz.css`;
- editar `src/main.jsx`.

Cria `src/styles/index.css`:

```css
/* Garante que padding e border entram no cálculo da largura total.
   Isto torna os tamanhos mais previsíveis e evita surpresas quando adicionamos espaçamento. */
* {
    box-sizing: border-box;
}

/* Remove margens padrão do browser e define uma base visual simples.
   Começar com uma base controlada reduz diferenças entre browsers e facilita o debug visual. */
body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f3f4f6;
    color: #111827;
}

/* Faz inputs, selects e botões herdarem a fonte da página.
   Sem isto, alguns browsers usam fontes próprias nos controlos de formulário. */
button,
input,
select {
    font: inherit;
}

/* Mostra visualmente que os botões são elementos clicáveis.
   Este pequeno detalhe melhora a perceção de interatividade da interface. */
button {
    cursor: pointer;
}

/* Dá feedback quando um botão está bloqueado.
   O cursor e a opacidade ajudam o utilizador a perceber que a ação não está disponível. */
button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
```

Cria `src/styles/quiz.css`:

```css
/* Container global da aplicação.
   min-height garante que o fundo cobre o ecrã todo mesmo quando há pouco conteúdo. */
.app {
    min-height: 100vh;
    padding: 24px;
    background:
        radial-gradient(circle at top left, #dbeafe 0, transparent 30%),
        radial-gradient(circle at bottom right, #dcfce7 0, transparent 28%),
        #f8fafc;
    color: #111827;
}

/* Classe alternativa aplicada quando o tema escuro estiver ativo.
   O tema é controlado em React, mas a responsabilidade visual fica no CSS. */
.app--dark {
    background:
        radial-gradient(circle at top left, #1d4ed8 0, transparent 28%),
        radial-gradient(circle at bottom right, #047857 0, transparent 24%),
        #0f172a;
    color: #f9fafb;
}

/* Limita a largura da app para o conteúdo não ficar demasiado espalhado.
   Sem este limite, linhas longas tornam-se difíceis de ler em monitores grandes. */
.quiz-shell {
    max-width: 820px;
    margin: 0 auto;
}

/* Título principal da app.
   Mantemos o destaque no nome do jogo sem depender de estilos inline no JSX. */
.quiz-shell h1 {
    margin: 0;
    font-size: 2.4rem;
}

/* Texto introdutório logo abaixo do título.
   Este texto funciona como contexto rápido, por isso deve ser mais discreto que o h1. */
.quiz-shell > p {
    margin: 8px 0 0;
    color: #475569;
}

.app--dark .quiz-shell > p {
    color: #cbd5e1;
}

/* Cartão base usado para cada ecrã principal da ficha.
   Reutilizar a mesma classe mantém consistência entre início, pergunta, loading, erro e resultado. */
.quiz-card {
    margin-top: 24px;
    padding: 24px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.92);
    color: #111827;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(10px);
}

/* Remove a margem superior do primeiro título dentro de um cartão.
   Isto evita espaçamento duplicado entre o padding do cartão e o h2. */
.quiz-card h2 {
    margin-top: 0;
}

/* Ajusta o cartão quando o tema escuro está ativo.
   O contraste precisa de ser revisto no tema escuro para manter a leitura confortável. */
.app--dark .quiz-card {
    border-color: rgba(148, 163, 184, 0.24);
    background: rgba(15, 23, 42, 0.9);
    color: #f9fafb;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
}

/* Cada linha de formulário fica em coluna: label em cima, campo por baixo.
   Esta estrutura é mais clara para alunos e funciona bem em ecrãs estreitos. */
.form-row {
    display: grid;
    gap: 6px;
    margin-top: 14px;
}

/* Estilo comum para campos de texto e seleção.
   Agrupar estes estilos evita duplicação entre input e select. */
.form-row input,
.form-row select {
    padding: 11px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #ffffff;
    color: #111827;
}

.form-row input:focus,
.form-row select:focus {
    outline: 3px solid rgba(37, 99, 235, 0.18);
    border-color: #2563eb;
}

.app--dark .form-row input,
.app--dark .form-row select {
    border-color: #475569;
    background: #020617;
    color: #f8fafc;
}

/* Grelhas simples para botões principais e respostas.
   A mesma base permite organizar ações e respostas sem criar layouts diferentes para tudo. */
.button-row,
.answer-grid {
    display: grid;
    gap: 10px;
    margin-top: 18px;
}

/* Botões partilham tamanho e arredondamento para consistência visual.
   Quando controlos parecidos têm estilos parecidos, a UI fica mais fácil de interpretar. */
.button-primary,
.button-secondary,
.answer-button {
    padding: 11px 14px;
    border: 1px solid #2563eb;
    border-radius: 6px;
    background: #2563eb;
    color: white;
    transition:
        transform 0.15s ease,
        border-color 0.15s ease,
        background-color 0.15s ease,
        box-shadow 0.15s ease;
}

.button-primary:hover:not(:disabled),
.button-secondary:hover:not(:disabled),
.answer-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
}

/* Botão secundário: usado para ações menos principais.
   A diferença visual ajuda a separar ação principal de ação alternativa. */
.button-secondary {
    border-color: #6b7280;
    background: #6b7280;
}

/* Respostas parecem botões, mas com aspeto mais neutro.
   Como há várias respostas no mesmo nível, evitamos que todas pareçam ações primárias. */
.answer-button {
    border-color: #cbd5e1;
    background: #f8fafc;
    color: #0f172a;
    text-align: left;
}

/* Pequeno feedback ao passar o rato por uma resposta ativa.
   O hover confirma que a resposta pode ser selecionada enquanto não estiver disabled. */
.answer-button:hover:not(:disabled) {
    border-color: #2563eb;
    background: #eff6ff;
}

.app--dark .answer-button {
    border-color: #475569;
    background: #111827;
    color: #f8fafc;
}

.app--dark .answer-button:hover:not(:disabled) {
    border-color: #60a5fa;
    background: #1e293b;
}

/* Espaçamento do bloco do temporizador.
   Separar visualmente o tempo ajuda o aluno a perceber que ele afeta a pergunta atual. */
.timer {
    margin: 12px 0;
}

/* Fundo da barra do temporizador.
   O fundo representa o espaço total disponível antes de a pergunta bloquear. */
.timer-bar {
    height: 12px;
    overflow: hidden;
    border-radius: 999px;
    background: #e2e8f0;
}

/* Parte preenchida da barra.
   A largura vem de React porque depende do estado timeLeft; a cor fica no CSS. */
.timer-bar__fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
    transition: width 0.2s ease;
}

/* Mensagens de erro ou aviso importante.
   Usamos uma cor consistente para problemas de validação, timeout e falhas de API. */
.error-text {
    color: #b91c1c;
}

/* Texto secundário, usado para ajuda ou contexto.
   A cor mais suave indica que o texto ajuda, mas não é a ação principal. */
.muted {
    color: #6b7280;
}

.app--dark .muted {
    color: #cbd5e1;
}

@media (min-width: 700px) {
    .answer-grid {
        grid-template-columns: 1fr 1fr;
    }
}
```

Atualiza `src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import "./styles/quiz.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
```

**Checkpoint**

- O projeto continua a arrancar.
- Não há erro de import dos ficheiros CSS.

---

## 6) Fase 1 - Layout base (Paragem A)

Ideia nova desta fase:

- apenas renderização estática.

Ficheiro a editar nesta fase: `src/App.jsx`.

Substitui `src/App.jsx` por:

```jsx
/**
 * Propósito: [Completa: explica porque este componente existe nesta primeira fase.]
 * Produz/Devolve: [Completa: descreve a estrutura visual estática devolvida pelo componente.]
 * @returns {JSX.Element} [Completa: indica que JSX é renderizado no ecrã.]
 */
function App() {
    return (
        // <main> identifica o conteúdo principal da página.
        // Além de ser semanticamente correto, ajuda leitores de ecrã e mantém a estrutura HTML organizada.
        // A classe "app" concentra o fundo e o espaçamento global no CSS, evitando estilos espalhados pelo JSX.
        <main className="app">
            {/* "quiz-shell" limita a largura para que o conteúdo continue legível em ecrãs grandes. */}
            <div className="quiz-shell">
                <h1>Quiz Game</h1>
                <p>Responde a perguntas para testar conhecimentos.</p>

                {/* Nesta fase, o cartão é estático para confirmar layout antes de introduzir estado. */}
                <section className="quiz-card">
                    <h2>Preparar jogo</h2>
                    <p className="muted">
                        Na próxima fase vais controlar o nome e a dificuldade
                        com estado React.
                    </p>
                </section>
            </div>
        </main>
    );
}

export default App;
```

**Checkpoint A**

- Vês o título `Quiz Game`.
- Vês o cartão “Preparar jogo”.
- Não há erros na consola.

---

## 7) Fase 2 - Nome e dificuldade (Paragem B1)

Ideia nova desta fase:

- criar inputs controlados com `useState`.

Ficheiro a editar nesta fase: `src/App.jsx`.

Atualiza `src/App.jsx`:

```jsx
import { useState } from "react";

/**
 * Propósito: [Completa: explica como este componente liga inputs ao estado React.]
 * Produz/Devolve: [Completa: descreve a interface com nome, dificuldade e pré-visualização.]
 * @returns {JSX.Element} [Completa: indica que JSX este componente devolve.]
 */
function App() {
    // Estado do input do nome.
    // Começa vazio porque, antes de qualquer interação, ainda não existe jogador identificado.
    // Este state será a fonte de verdade do value do input.
    const [playerName, setPlayerName] = useState("");

    // Estado do select da dificuldade.
    // Começar em "easy" dá uma opção segura por defeito e evita um select sem valor controlado.
    const [difficulty, setDifficulty] = useState("easy");

    return (
        <main className="app">
            <div className="quiz-shell">
                <h1>Quiz Game</h1>
                <p>Responde a perguntas para testar conhecimentos.</p>

                <section className="quiz-card">
                    <h2>Preparar jogo</h2>

                    <label className="form-row">
                        Nome do jogador
                        {/*
                          Num input controlado, o value vem sempre do state.
                          O utilizador escreve, onChange recebe o novo texto, e setPlayerName sincroniza React com o input.
                          Assim, a UI nunca depende de um valor escondido apenas dentro do DOM.
                        */}
                        <input
                            type="text"
                            value={playerName}
                            onChange={(event) =>
                                setPlayerName(event.target.value)
                            }
                            placeholder="Ex.: Ana"
                        />
                    </label>

                    <label className="form-row">
                        Dificuldade
                        {/*
                          O select segue a mesma regra do input controlado.
                          event.target.value contém o value da option escolhida e passa a ser a dificuldade oficial da app.
                        */}
                        <select
                            value={difficulty}
                            onChange={(event) =>
                                setDifficulty(event.target.value)
                            }
                        >
                            <option value="easy">Fácil</option>
                            <option value="medium">Média</option>
                            <option value="hard">Difícil</option>
                        </select>
                    </label>

                    <p className="muted">
                        {/* Esta pré-visualização é um mini-debug visual: confirma que o state muda a cada interação. */}
                        Jogador: {playerName || "(sem nome)"} | Dificuldade:{" "}
                        {difficulty}
                    </p>
                </section>
            </div>
        </main>
    );
}

export default App;
```

**Checkpoint B1**

- O que escreves aparece em “Jogador”.
- A dificuldade muda quando alteras o `select`.

---

## 8) Fase 3 - Estado do jogo e validação (Paragem B2)

Ideia nova desta fase:

- controlar o ecrã atual da app;
- impedir começar sem nome.

Ficheiro a editar nesta fase: `src/App.jsx`.

Estados do jogo:

- `idle`: ecrã inicial;
- `playing`: jogo em curso;
- `finished`: resultado final;
- mais tarde vamos adicionar `loading`.

Atualiza `src/App.jsx`:

```jsx
import { useState } from "react";

/**
 * Propósito: [Completa: explica como este componente controla o ecrã atual do jogo.]
 * Produz/Devolve: [Completa: descreve os ecrãs que podem ser renderizados conforme gameStatus.]
 * @returns {JSX.Element} [Completa: indica o JSX produzido para idle, playing ou finished.]
 */
function App() {
    // Nome escrito pelo jogador.
    // É atualizado a cada tecla e usado depois para validação e resultado final.
    const [playerName, setPlayerName] = useState("");

    // Dificuldade escolhida no select.
    // Mais tarde será enviada para a API para pedir perguntas adequadas.
    const [difficulty, setDifficulty] = useState("easy");

    // Estado que decide que "ecrã" a app mostra neste momento.
    // Guardar isto num único state evita vários booleans soltos como isPlaying, isFinished, isLoading.
    const [gameStatus, setGameStatus] = useState("idle");

    // trim remove espaços no início/fim para evitar nomes que parecem preenchidos mas não têm caracteres úteis.
    const cleanPlayerName = playerName.trim();

    // Regra simples de validação.
    // Exigir pelo menos 2 caracteres impede começar com texto vazio ou demasiado ambíguo.
    const canStartGame = cleanPlayerName.length >= 2;

    const startGame = () => {
        // Se o nome ainda não for válido, a função termina imediatamente.
        // Esta proteção fica no handler mesmo que o botão já esteja disabled, porque a lógica não deve depender só da UI.
        if (!canStartGame) return;

        // Mudar o estado do jogo faz a UI trocar do ecrã inicial para o jogo.
        // Não manipulamos o DOM diretamente; pedimos ao React para renderizar outro bloco.
        setGameStatus("playing");
    };

    const resetGame = () => {
        // Volta ao ecrã inicial.
        // Nesta fase ainda não limpamos tudo, porque o objetivo é apenas testar transições.
        setGameStatus("idle");
    };

    return (
        <main className="app">
            <div className="quiz-shell">
                <h1>Quiz Game</h1>

                {gameStatus === "idle" && (
                    // Renderização condicional: este bloco só aparece no estado "idle".
                    // Esta técnica mantém vários ecrãs no mesmo componente sem mostrar todos ao mesmo tempo.
                    <section className="quiz-card">
                        <h2>Preparar jogo</h2>

                        <label className="form-row">
                            Nome do jogador
                            <input
                                type="text"
                                value={playerName}
                                onChange={(event) =>
                                    setPlayerName(event.target.value)
                                }
                                placeholder="Ex.: Ana"
                            />
                        </label>

                        <label className="form-row">
                            Dificuldade
                            <select
                                value={difficulty}
                                onChange={(event) =>
                                    setDifficulty(event.target.value)
                                }
                            >
                                <option value="easy">Fácil</option>
                                <option value="medium">Média</option>
                                <option value="hard">Difícil</option>
                            </select>
                        </label>

                        {!canStartGame && (
                            // Feedback imediato para explicar porque o botão está bloqueado.
                            // Sem esta mensagem, o utilizador poderia pensar que o botão não funciona.
                            <p className="error-text">
                                Escreve pelo menos 2 caracteres no nome.
                            </p>
                        )}

                        <div className="button-row">
                            {/*
                              O botão fica bloqueado até o nome ser válido.
                              Isto dá feedback visual, impede cliques inválidos e reforça a mesma regra usada no handler.
                            */}
                            <button
                                type="button"
                                className="button-primary"
                                onClick={startGame}
                                disabled={!canStartGame}
                            >
                                Começar jogo
                            </button>
                        </div>
                    </section>
                )}

                {gameStatus === "playing" && (
                    // Bloco temporário para confirmar a transição de estado.
                    // Antes de criar perguntas reais, validamos que o fluxo idle -> playing funciona.
                    <section className="quiz-card">
                        <h2>Jogo em curso</h2>
                        <p>Jogador: {cleanPlayerName}</p>
                        <p>Dificuldade: {difficulty}</p>
                        <button
                            type="button"
                            className="button-secondary"
                            onClick={() => setGameStatus("finished")}
                        >
                            Terminar teste rápido
                        </button>
                    </section>
                )}

                {gameStatus === "finished" && (
                    // Bloco final temporário.
                    // Mais tarde será substituído por um resultado calculado a partir das respostas do jogador.
                    <section className="quiz-card">
                        <h2>Fim do jogo</h2>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={resetGame}
                        >
                            Voltar ao início
                        </button>
                    </section>
                )}
            </div>
        </main>
    );
}

export default App;
```

**Checkpoint B2**

- Não consegues começar sem nome válido.
- O botão começa o jogo.
- O botão de teste termina o jogo.
- O botão final volta ao início.

---

## 9) Fase 4 - Perguntas locais (Paragem C1)

Ideia nova desta fase:

- começar com dados locais antes da API.

Isto evita misturar duas dificuldades ao mesmo tempo: primeiro aprendemos a mecânica do jogo, depois carregamos dados externos.

Ficheiros a criar/editar nesta fase:

- criar `src/data/localQuestions.js`;
- editar `src/App.jsx`.

Cria `src/data/localQuestions.js`:

```js
/**
 * Propósito: [Completa: explica porque começamos com perguntas locais antes de usar API.]
 * Produz/Devolve: [Completa: descreve o array exportado e a estrutura de cada pergunta.]
 */
export const localQuestions = [
    {
        // ID estável: útil para identificar a pergunta se mais tarde renderizarmos listas.
        // Mesmo que nesta fase ainda não seja essencial, habituamo-nos a modelar dados com identidade própria.
        id: "local-1",

        // Texto que aparece no ecrã.
        // Mantemos este campo com o mesmo nome que a app vai usar depois da API.
        question: "Qual destes é um hook do React?",

        // Resposta certa.
        // A função handleAnswer vai comparar a escolha do jogador com este valor exato.
        correctAnswer: "useState",

        // Respostas erradas.
        // Juntas com a resposta certa, formam as quatro opções de escolha múltipla.
        incorrectAnswers: ["setHTML", "createStyle", "onRender"],
    },
    {
        id: "local-2",
        question: "O que acontece quando o state muda?",
        correctAnswer: "O componente pode voltar a renderizar",
        incorrectAnswers: [
            "O browser fecha",
            "O ficheiro JSX é apagado",
            "O npm instala pacotes automaticamente",
        ],
    },
    {
        id: "local-3",
        question: "Para que servem props?",
        correctAnswer: "Para passar dados de pai para filho",
        incorrectAnswers: [
            "Para criar pastas",
            "Para substituir o CSS",
            "Para ligar diretamente à base de dados",
        ],
    },
];
```

Atualiza o início de `src/App.jsx`:

```jsx
import { useState } from "react";
import { localQuestions } from "./data/localQuestions";
```

A partir daqui, os snippets desta fase são **incrementais**: adicionas as linhas indicadas ao `App.jsx` que já tinhas na fase anterior.

Adiciona estado para a pergunta atual:

```jsx
// Índice da pergunta atual dentro do array de perguntas.
// Começa em 0 porque arrays em JavaScript começam no índice 0.
// Guardar só o índice é mais simples do que duplicar a pergunta inteira em state.
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
```

Adiciona estas variáveis antes do `return`:

```jsx
// Por agora, a fonte de perguntas é apenas o array local.
// Mais tarde, esta variável será substituída por state vindo da API.
// Esta etapa separa a mecânica do jogo da dificuldade adicional dos pedidos HTTP.
const questions = localQuestions;

// A pergunta atual é encontrada pelo índice guardado no state.
// Se currentQuestionIndex mudar, o React recalcula esta variável no render seguinte.
const currentQuestion = questions[currentQuestionIndex];

// Guardamos o total numa variável para não repetir questions.length no JSX.
// Também torna mais fácil trocar perguntas locais por perguntas externas sem mexer em vários sítios.
const totalQuestions = questions.length;
```

No `return`, dentro de `<div className="quiz-shell">`, encontra o bloco condicional do jogo que começa por `{gameStatus === "playing" && (...)}`.

Substitui temporariamente **apenas esse bloco `playing`** por:

```jsx
{gameStatus === "playing" && currentQuestion && (
    <section className="quiz-card">
        <p>
            Pergunta {currentQuestionIndex + 1} de {totalQuestions}
        </p>
        <h2>{currentQuestion.question}</h2>
        <p className="muted">
            Resposta certa nesta fase: {currentQuestion.correctAnswer}
        </p>
    </section>
)}
```

**Checkpoint C1**

- Ao começar, aparece a primeira pergunta local.
- Ainda não há botões de resposta.

---

## 10) Fase 5 - Responder e avançar (Paragem C2)

Ideia nova desta fase:

- criar lista de respostas;
- registar se a resposta foi certa ou errada;
- avançar para a próxima pergunta.

Ficheiro a editar nesta fase: `src/App.jsx`.

Atualiza o import do React:

```jsx
import { useRef, useState } from "react";
```

Este snippet substitui apenas a linha de import do React.

Adiciona estado e uma ref:

```jsx
// Guarda um boolean por cada resposta:
// true = certa, false = errada.
// Este formato é simples de contar com filter(Boolean) e evita guardar texto desnecessário.
const [answerResults, setAnswerResults] = useState([]);

// Guarda o índice da pergunta já respondida.
// useRef é usado aqui porque muda imediatamente e não precisa de esperar por novo render.
// Isto ajuda a impedir um duplo clique muito rápido na mesma resposta.
const answeredQuestionRef = useRef(-1);
```

Este snippet é incremental: adiciona o estado junto dos outros `useState` e a ref dentro do componente.

Adiciona esta função antes do `return`:

```jsx
/**
 * Propósito: [Completa: explica como a função avalia uma resposta e atualiza o progresso.]
 * Produz/Devolve: [Completa: indica que não devolve valor; altera estado e pode terminar o jogo.]
 * @param {string} selectedAnswer - [Completa: explica de onde vem esta resposta e como é usada.]
 */
const handleAnswer = (selectedAnswer) => {
    // Se esta pergunta já recebeu resposta, ignoramos cliques repetidos.
    // A ref bloqueia imediatamente, antes de o React fazer o próximo render.
    if (answeredQuestionRef.current === currentQuestionIndex) return;

    answeredQuestionRef.current = currentQuestionIndex;

    // Compara a resposta escolhida com a resposta certa da pergunta atual.
    // A comparação é direta porque cada botão envia exatamente o texto da resposta.
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // Criamos um novo array para respeitar a regra de imutabilidade do React.
    // Nunca fazemos answerResults.push(...), porque isso altera o array antigo e pode impedir o React de detetar a mudança.
    const updatedResults = [...answerResults, isCorrect];

    // Atualiza o histórico de respostas.
    // Depois deste setState, a próxima renderização já terá o novo resultado incluído.
    setAnswerResults(updatedResults);

    // Estamos na última pergunta se o índice atual for o último índice do array.
    // Como os índices começam em 0, o último índice é questions.length - 1.
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
        // Se era a última pergunta, o jogo termina.
        // Mudamos de ecrã em vez de tentar avançar para uma pergunta que não existe.
        setGameStatus("finished");
        return;
    }

    // Caso contrário, avança uma posição no array.
    // Usamos atualização funcional para trabalhar sempre com o índice mais recente.
    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
};
```

Atualiza `startGame` para reiniciar progresso:

```jsx
const startGame = () => {
    // Mantemos a validação da fase anterior.
    // A validação continua a proteger a lógica mesmo que a UI seja alterada no futuro.
    if (!canStartGame) return;

    // Cada novo jogo deve começar na primeira pergunta.
    // Sem isto, um segundo jogo poderia arrancar a meio da lista.
    setCurrentQuestionIndex(0);

    // Cada novo jogo deve limpar respostas antigas.
    // Caso contrário, os resultados do jogo anterior contaminariam a pontuação.
    setAnswerResults([]);

    // Também libertamos o bloqueio de resposta para o novo jogo.
    answeredQuestionRef.current = -1;

    // Só depois de reiniciar o progresso mudamos para o ecrã de jogo.
    // A ordem ajuda a garantir que o ecrã playing já recebe estado limpo.
    setGameStatus("playing");
};
```

Cria as respostas da pergunta atual:

```jsx
// Nesta fase, as respostas ainda aparecem sempre na mesma ordem:
// primeiro a correta, depois as erradas. Mais tarde vamos baralhar.
// Fazemos assim de propósito para aprender a mecânica antes de resolver o problema da ordem previsível.
const currentAnswers = currentQuestion
    ? [currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers]
    : [];
```

No `return`, substitui novamente **apenas o bloco `playing`**. Mantém o bloco `idle`, o bloco `finished`, o `<main>` e o `<div className="quiz-shell">` como estavam.

O bloco `playing` deve ficar assim:

```jsx
{gameStatus === "playing" && currentQuestion && (
    <section className="quiz-card">
        <p>
            Pergunta {currentQuestionIndex + 1} de {totalQuestions}
        </p>
        <h2>{currentQuestion.question}</h2>

        <div className="answer-grid">
            {currentAnswers.map((answer, index) => (
                /*
              Cada resposta gera um botão.
              A key ajuda o React a identificar cada item.
              Aqui o index é aceitável porque a lista é pequena, fixa por pergunta
              e não é editada pelo utilizador.
            */
                <button
                    key={`${currentQuestion.id}-${index}-${answer}`}
                    type="button"
                    className="answer-button"
                    onClick={() => handleAnswer(answer)}
                >
                    {answer}
                </button>
            ))}
        </div>
    </section>
)}
```

**Checkpoint C2**

- A pergunta mostra quatro respostas.
- Clicar numa resposta avança.
- No fim aparece o ecrã final.

---

## 11) Fase 6 - Resultado final simples (Paragem C3)

Ideia nova desta fase:

- mostrar resultado com base nas respostas registadas.

Ficheiro a editar nesta fase: `src/App.jsx`.

No `return`, encontra o bloco que começa por `{gameStatus === "finished" && (...)}`.

Substitui **apenas esse bloco `finished`** por:

```jsx
{gameStatus === "finished" && (
    <section className="quiz-card">
        <h2>Fim do jogo</h2>
        <p>Jogador: {cleanPlayerName}</p>
        <p>
            Respostas certas: {answerResults.filter(Boolean).length} de{" "}
            {totalQuestions}
        </p>

        <button
            type="button"
            className="button-primary"
            onClick={resetGame}
        >
            Voltar ao início
        </button>
    </section>
)}
```

**Checkpoint C3**

- No fim aparece o número de respostas certas.
- Se responderes tudo errado, aparece 0.
- Se responderes tudo certo, aparece 3.

---

## 12) Fase 7 - Estatísticas com `useMemo` (Paragem D1)

Ideia nova desta fase:

- calcular valores derivados sem criar estado desnecessário.

Não vamos criar `score`, `percentage` e `victory` com `useState`, porque estes valores derivam de `answerResults` e `totalQuestions`.

Ficheiro a editar nesta fase: `src/App.jsx`.

Atualiza o import:

```jsx
import { useMemo, useRef, useState } from "react";
```

Este snippet substitui apenas a linha de import do React. O resto do ficheiro mantém-se.

Adiciona antes do `return`:

```jsx
const gameStats = useMemo(() => {
    // Conta apenas os valores true.
    // Boolean é prático aqui porque cada resposta fica registada como true/false.
    // Assim transformamos o histórico de respostas num número de respostas certas sem criar novo state.
    const correctAnswers = answerResults.filter(Boolean).length;

    // Nesta regra simples, cada resposta certa vale 100 pontos.
    // A pontuação é derivada, por isso deve ser calculada e não guardada separadamente.
    const score = correctAnswers * 100;

    // Evita divisão por zero caso ainda não existam perguntas.
    // Esta proteção torna o cálculo robusto mesmo durante loading ou falhas da API.
    const percentage =
        totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0;

    // Regra do jogo: o jogador atinge o objetivo se acertar pelo menos 60%.
    // Separar esta regra numa variável facilita mudar o critério mais tarde.
    const victory = percentage >= 60;

    // Devolvemos um objeto para agrupar todas as estatísticas finais.
    // O ResultScreen recebe um único objeto em vez de várias props soltas.
    return {
        correctAnswers,
        totalQuestions,
        score,
        percentage,
        victory,
    };
    // O cálculo só precisa de ser refeito quando mudam as respostas ou o total.
    // Se outro state mudar, como o tema, estas estatísticas não precisam de ser recalculadas.
}, [answerResults, totalQuestions]);
```

No `return`, volta ao bloco `{gameStatus === "finished" && (...)}` que criaste na fase anterior.

Substitui **apenas esse bloco `finished`** por:

```jsx
{gameStatus === "finished" && (
    <section className="quiz-card">
        <h2>
            {gameStats.victory ? "Objetivo atingido!" : "Tenta novamente!"}
        </h2>
        <p>Jogador: {cleanPlayerName}</p>
        <p>Pontuação: {gameStats.score}</p>
        <p>
            Certas: {gameStats.correctAnswers} de {gameStats.totalQuestions}
        </p>
        <p>Percentagem: {gameStats.percentage}%</p>

        <button
            type="button"
            className="button-primary"
            onClick={resetGame}
        >
            Voltar ao início
        </button>
    </section>
)}
```

**Checkpoint D1**

- A pontuação aparece.
- A percentagem aparece.
- A vitória acontece com 60% ou mais.
- Não criaste estado extra para pontuação.

---

## 13) Fase 8 - Baralhar respostas com `useMemo` (Paragem D2)

Ideia nova desta fase:

- evitar que as respostas mudem de ordem em cada render.

Se usares `sort(() => Math.random() - 0.5)` diretamente no JSX, as respostas podem mudar de ordem sempre que o componente renderiza. Mais tarde, quando houver temporizador, isso seria muito confuso.

Ficheiro a editar nesta fase: `src/App.jsx`.

Adiciona esta função fora do componente `App`:

```jsx
/**
 * Propósito: [Completa: explica porque precisamos de baralhar respostas sem tocar no array original.]
 * Produz/Devolve: [Completa: indica que a função devolve uma nova lista com ordem alterada.]
 * @param {string[]} items - [Completa: descreve que lista entra nesta função.]
 * @returns {string[]} [Completa: descreve a lista devolvida.]
 */
function shuffleItems(items) {
    // [...items] cria uma cópia. Assim, não alteramos o array original.
    // Isto é importante porque arrays recebidos de state ou props não devem ser mutados diretamente.
    // sort com Math.random não é perfeito para produção, mas é suficiente para este exercício didático.
    return [...items].sort(() => Math.random() - 0.5);
}
```

Substitui `currentAnswers` por:

```jsx
const currentAnswers = useMemo(() => {
    // Durante alguns renders, pode ainda não existir pergunta atual.
    // Nesse caso, devolvemos array vazio para evitar erros no .map().
    // Esta guarda é especialmente útil quando a app passa por loading, erro ou troca de perguntas.
    if (!currentQuestion) return [];

    // Juntamos resposta certa + erradas num único array.
    // A UI só precisa de uma lista de botões, não de saber qual resposta era certa nesta etapa.
    return shuffleItems([
        currentQuestion.correctAnswer,
        ...currentQuestion.incorrectAnswers,
    ]);
    // Só queremos baralhar quando muda a pergunta atual.
    // Se o tempo mudar, currentQuestion não muda, por isso a ordem mantém-se.
    // Isto evita uma experiência injusta em que as respostas saltam de posição a cada segundo.
}, [currentQuestion]);
```

**Checkpoint D2**

- As respostas aparecem baralhadas.
- A ordem não muda só por a app voltar a renderizar.
- Ao avançar para outra pergunta, a nova pergunta tem nova lista de respostas.

---

## 14) Fase 9 - `useEffect` local: temporizador (Paragem E1)

Ideia nova desta fase:

- usar `useEffect` para um efeito local.

Vamos dar 15 segundos por pergunta.

Ficheiro a editar nesta fase: `src/App.jsx`.

Atualiza o import:

```jsx
import { useEffect, useMemo, useRef, useState } from "react";
```

Este snippet substitui novamente apenas a linha de import do React.

Adiciona uma constante fora do componente:

```jsx
// Tempo inicial de cada pergunta.
// Usar uma constante evita repetir o número 15 em vários sítios.
// Se a regra mudar para 20 segundos, alteramos apenas esta linha.
const QUESTION_TIME_LIMIT = 15;
```

Adiciona estado:

```jsx
// Tempo restante da pergunta atual.
// Este valor muda com o temporizador e também é reposto quando passamos para outra pergunta.
const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
```

Atualiza `startGame`:

```jsx
const startGame = () => {
    if (!canStartGame) return;

    setCurrentQuestionIndex(0);
    setAnswerResults([]);
    answeredQuestionRef.current = -1;

    // Cada jogo começa com o tempo completo.
    // Isto evita herdar o tempo que sobrou da tentativa anterior.
    setTimeLeft(QUESTION_TIME_LIMIT);
    setGameStatus("playing");
};
```

Adiciona o efeito:

```jsx
useEffect(() => {
    // O temporizador só deve correr durante o jogo.
    // Se estivermos no menu, loading, erro ou resultado, não faz nada.
    // Esta guarda impede contagens invisíveis quando o utilizador não está a responder.
    if (gameStatus !== "playing") return;

    // Se o tempo chegou a 0, paramos de agendar novos segundos.
    // Sem esta condição, o contador poderia continuar para valores negativos.
    if (timeLeft === 0) return;

    // setTimeout espera 1 segundo e depois atualiza o state.
    // Como timeLeft está nas dependências, cada atualização agenda o próximo segundo.
    const timeoutId = setTimeout(() => {
        // Forma funcional: recebe o valor mais recente do state.
        // Isto evita bugs quando várias atualizações ficam próximas no tempo.
        setTimeLeft((currentTime) => currentTime - 1);
    }, 1000);

    // Cleanup: se o componente renderizar outra vez antes do timeout terminar,
    // cancelamos o timeout anterior para evitar contagens duplicadas.
    // Este padrão é essencial em efeitos com timers.
    return () => {
        clearTimeout(timeoutId);
    };
    // Dependências: o efeito depende do estado do jogo e do tempo atual.
    // Se um destes valores mudar, o React reavalia se deve continuar a contar.
}, [gameStatus, timeLeft]);
```

Dentro do bloco `playing`, antes da pergunta, adiciona:

```jsx
<p>Tempo restante: {timeLeft}s</p>
```

Atualiza `handleAnswer` para reiniciar o tempo ao avançar:

```jsx
// Quando avança para a próxima pergunta, o temporizador reinicia.
// Esta linha deve ficar junto do avanço para manter índice e tempo sincronizados.
setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
setTimeLeft(QUESTION_TIME_LIMIT);
```

**Checkpoint E1**

- O tempo começa em 15.
- O tempo desce de segundo em segundo.
- Ao responder e avançar, o tempo volta a 15.

---

## 15) Fase 10 - Tempo esgotado (Paragem E2)

Ideia nova desta fase:

- bloquear respostas quando o tempo termina;
- contar a pergunta como errada se o jogador avançar sem responder.

Ficheiro a editar nesta fase: `src/App.jsx`.

Cria esta função:

```jsx
/**
 * Propósito: [Completa: explica como a função trata uma pergunta sem resposta dentro do tempo.]
 * Produz/Devolve: [Completa: indica que não devolve valor; reutiliza a lógica de resposta errada.]
 */
const handleTimeout = () => {
    // Reutilizamos handleAnswer para não duplicar lógica de avanço.
    // A string vazia nunca será igual à resposta certa, por isso conta como errada.
    // Assim, timeout e clique numa resposta seguem o mesmo caminho de atualização.
    handleAnswer("");
};
```

Dentro do bloco `playing`, procura a grelha de respostas:

```jsx
<div className="answer-grid">{/* ... */}</div>
```

Dentro dessa grelha, substitui **apenas o `.map()` das respostas** por:

```jsx
{currentAnswers.map((answer, index) => (
    <button
        key={`${currentQuestion.id}-${index}-${answer}`}
        type="button"
        className="answer-button"
        onClick={() => handleAnswer(answer)}
        disabled={timeLeft === 0}
    >
        {answer}
    </button>
))}
```

Depois da grelha de respostas, adiciona:

```jsx
{timeLeft === 0 && (
    <div className="button-row">
        <p className="error-text">Tempo esgotado.</p>
        <button
            type="button"
            className="button-secondary"
            onClick={handleTimeout}
        >
            Avançar
        </button>
    </div>
)}
```

**Checkpoint E2**

- Quando o tempo chega a 0, os botões ficam bloqueados.
- O botão “Avançar” conta a pergunta como errada.
- O jogo continua normalmente.

---

## 16) Fase 11 - Componentes e props (Paragem F)

Ideia nova desta fase:

- separar responsabilidades;
- passar dados e callbacks por props.

Ficheiros a criar/editar nesta fase:

- criar a pasta `src/components/`;
- criar `src/components/StartScreen.jsx`;
- criar `src/components/TimerBar.jsx`;
- criar `src/components/QuestionCard.jsx`;
- criar `src/components/ResultScreen.jsx`;
- editar `src/App.jsx`.

Cria a pasta `src/components/`.

### 16.1) `StartScreen.jsx`

Cria o ficheiro `src/components/StartScreen.jsx`:

```jsx
/**
 * Propósito: [Completa: explica o papel deste componente no início do jogo.]
 * Produz/Devolve: [Completa: descreve o formulário inicial e o botão de arranque.]
 * @param {object} props - [Completa: identifica o conjunto de dados e callbacks recebidos do App.]
 * @param {string} props.playerName - [Completa: explica como este valor controla o input.]
 * @param {(name: string) => void} props.onPlayerNameChange - [Completa: explica quando este callback é chamado.]
 * @param {string} props.difficulty - [Completa: explica como este valor controla o select.]
 * @param {(difficulty: string) => void} props.onDifficultyChange - [Completa: explica como a dificuldade sobe para o componente pai.]
 * @param {boolean} props.canStartGame - [Completa: explica que regra este boolean representa.]
 * @param {() => void} props.onStartGame - [Completa: explica que ação é pedida ao pai quando o botão é clicado.]
 * @returns {JSX.Element} [Completa: descreve o JSX do ecrã inicial.]
 */
function StartScreen({
    // Valores controlados pelo componente pai.
    // O StartScreen não guarda estado próprio para estes campos; apenas mostra e comunica alterações.
    playerName,
    onPlayerNameChange,
    difficulty,
    onDifficultyChange,

    // Validação também vem do pai, porque depende da regra da app.
    // Isto evita duplicar a mesma regra em dois componentes diferentes.
    canStartGame,

    // Callback chamado quando o jogador tenta começar.
    // O filho não muda gameStatus diretamente; pede ao App para decidir.
    onStartGame,
}) {
    return (
        <section className="quiz-card">
            <h2>Preparar jogo</h2>

            <label className="form-row">
                Nome do jogador
                {/*
                  O filho mostra o valor recebido por props e usa o callback
                  para pedir ao pai que atualize o state.
                  Isto é o fluxo normal do React: dados descem, ações sobem.
                */}
                <input
                    type="text"
                    value={playerName}
                    onChange={(event) => onPlayerNameChange(event.target.value)}
                    placeholder="Ex.: Ana"
                />
            </label>

            <label className="form-row">
                Dificuldade
                {/*
                  Mesma ideia do input: valor recebido por props,
                  atualização comunicada ao pai por callback.
                  O select não decide a dificuldade global sozinho.
                */}
                <select
                    value={difficulty}
                    onChange={(event) => onDifficultyChange(event.target.value)}
                >
                    <option value="easy">Fácil</option>
                    <option value="medium">Média</option>
                    <option value="hard">Difícil</option>
                </select>
            </label>

            {!canStartGame && (
                // A mensagem usa a validação calculada no pai.
                // Assim, o botão e o texto de erro obedecem exatamente à mesma condição.
                <p className="error-text">
                    Escreve pelo menos 2 caracteres no nome.
                </p>
            )}

            <div className="button-row">
                {/*
                  O clique sobe para o pai. O componente filho não decide
                  sozinho quando o jogo começa.
                  Esta separação deixa o componente reutilizável e fácil de testar.
                */}
                <button
                    type="button"
                    className="button-primary"
                    onClick={onStartGame}
                    disabled={!canStartGame}
                >
                    Começar jogo
                </button>
            </div>
        </section>
    );
}

export default StartScreen;
```

### 16.2) `TimerBar.jsx`

Cria o ficheiro `src/components/TimerBar.jsx`:

```jsx
/**
 * Propósito: [Completa: explica como este componente representa visualmente o tempo.]
 * Produz/Devolve: [Completa: descreve o texto e a barra de progresso gerados.]
 * @param {object} props - [Completa: descreve as props necessárias para calcular a barra.]
 * @param {number} props.timeLeft - [Completa: explica que unidade representa e como afeta a UI.]
 * @param {number} props.timeLimit - [Completa: explica qual é o tempo total da pergunta.]
 * @returns {JSX.Element} [Completa: descreve o JSX do temporizador.]
 */
function TimerBar({ timeLeft, timeLimit }) {
    // Converte segundos restantes em percentagem para controlar a largura da barra.
    // timeLimit vem do App para existir uma única fonte de verdade para a regra dos segundos.
    const percentage = (timeLeft / timeLimit) * 100;

    return (
        <div className="timer">
            <p>Tempo restante: {timeLeft}s</p>
            <div className="timer-bar">
                {/*
                  Este é um caso aceitável de estilo inline:
                  a largura depende de um valor dinâmico calculado em React.
                  As restantes regras visuais continuam no CSS para manter responsabilidades separadas.
                */}
                <div
                    className="timer-bar__fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default TimerBar;
```

### 16.3) `QuestionCard.jsx`

Cria o ficheiro `src/components/QuestionCard.jsx`:

```jsx
import TimerBar from "./TimerBar.jsx";

/**
 * Propósito: [Completa: explica como este componente apresenta uma pergunta jogável.]
 * Produz/Devolve: [Completa: descreve pergunta, respostas, temporizador e ação de timeout.]
 * @param {object} props - [Completa: descreve o conjunto de dados e ações vindos do App.]
 * @param {object} props.question - [Completa: explica que informação da pergunta é usada.]
 * @param {string[]} props.answers - [Completa: explica porque as respostas já chegam baralhadas.]
 * @param {number} props.questionNumber - [Completa: explica como este número aparece na interface.]
 * @param {number} props.totalQuestions - [Completa: explica porque o total é necessário.]
 * @param {number} props.timeLeft - [Completa: explica como o tempo altera os botões.]
 * @param {number} props.timeLimit - [Completa: explica porque o limite é necessário para o temporizador.]
 * @param {(answer: string) => void} props.onAnswer - [Completa: explica que valor é enviado ao pai.]
 * @param {() => void} props.onTimeout - [Completa: explica quando esta ação é usada.]
 * @returns {JSX.Element} [Completa: descreve o JSX da pergunta atual.]
 */
function QuestionCard({
    // Dados da pergunta atual.
    // Estes valores são apenas lidos; o QuestionCard não altera a pergunta.
    question,
    answers,
    questionNumber,
    totalQuestions,

    // Estado visual/controlado pelo pai.
    // timeLeft decide se os botões ainda estão ativos e que feedback aparece.
    // timeLimit permite que TimerBar calcule a percentagem sem duplicar constantes.
    timeLeft,
    timeLimit,

    // Callbacks para comunicar ações ao pai.
    // O componente não sabe calcular pontuação; apenas informa o que aconteceu.
    onAnswer,
    onTimeout,
}) {
    return (
        <section className="quiz-card">
            <p>
                Pergunta {questionNumber} de {totalQuestions}
            </p>

            <TimerBar timeLeft={timeLeft} timeLimit={timeLimit} />

            <h2>{question.question}</h2>

            <div className="answer-grid">
                {answers.map((answer, index) => (
                    /*
                      Cada resposta gera um botão independente.
                      O clique envia a resposta escolhida para o App.
                      A key junta id, posição e texto para evitar colisões se duas traduções ficarem iguais.
                      O index é aceitável aqui porque as respostas são pequenas, fixas e não editáveis.
                    */
                    <button
                        key={`${question.id}-${index}-${answer}`}
                        type="button"
                        className="answer-button"
                        onClick={() => onAnswer(answer)}
                        disabled={timeLeft === 0}
                    >
                        {answer}
                    </button>
                ))}
            </div>

            {timeLeft === 0 && (
                // Este bloco só aparece quando já não é possível responder.
                // Separar este estado visual evita cliques tardios depois do tempo terminar.
                <div className="button-row">
                    <p className="error-text">Tempo esgotado.</p>
                    {/*
                      O pai decide como tratar uma pergunta sem resposta.
                      Aqui apenas comunicamos que o tempo acabou.
                      Isto mantém a regra de pontuação concentrada no App.
                    */}
                    <button
                        type="button"
                        className="button-secondary"
                        onClick={onTimeout}
                    >
                        Avançar
                    </button>
                </div>
            )}
        </section>
    );
}

export default QuestionCard;
```

### 16.4) `ResultScreen.jsx`

Cria o ficheiro `src/components/ResultScreen.jsx`:

```jsx
/**
 * Propósito: [Completa: explica como este componente resume o desempenho do jogador.]
 * Produz/Devolve: [Completa: descreve pontuação, percentagem, mensagem final e botão de reinício.]
 * @param {object} props - [Completa: descreve os dados finais recebidos do App.]
 * @param {string} props.playerName - [Completa: explica porque mostramos o nome no resultado.]
 * @param {object} props.stats - [Completa: explica que estatísticas este objeto contém.]
 * @param {() => void} props.onReset - [Completa: explica que estado deve ser reposto pelo pai.]
 * @returns {JSX.Element} [Completa: descreve o JSX do ecrã final.]
 */
function ResultScreen({ playerName, stats, onReset }) {
    return (
        <section className="quiz-card">
            {/* A frase depende de stats.victory, calculado no App com useMemo.
                O ResultScreen só apresenta dados; não recalcula a regra de sucesso. */}
            <h2>{stats.victory ? "Objetivo atingido!" : "Tenta novamente!"}</h2>
            <p>Jogador: {playerName}</p>
            <p>Pontuação: {stats.score}</p>
            <p>
                Certas: {stats.correctAnswers} de {stats.totalQuestions}
            </p>
            <p>Percentagem: {stats.percentage}%</p>

            <button type="button" className="button-primary" onClick={onReset}>
                Voltar ao início
            </button>
        </section>
    );
}

export default ResultScreen;
```

Atualiza os imports no `App.jsx`:

```jsx
import QuestionCard from "./components/QuestionCard.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import StartScreen from "./components/StartScreen.jsx";
```

No `return` do `App.jsx`, mantém a estrutura exterior:

```jsx
<main className="app">
    <div className="quiz-shell">
        <h1>Quiz Game</h1>
        <p>Responde a perguntas para testar conhecimentos.</p>
        {/* blocos condicionais aqui */}
    </div>
</main>
```

Dentro de `<div className="quiz-shell">`, substitui **apenas os três blocos condicionais** que mostram:

- o ecrã inicial (`gameStatus === "idle"`);
- o ecrã de pergunta (`gameStatus === "playing"`);
- o ecrã final (`gameStatus === "finished"`).

Não substituas o ficheiro inteiro nesta etapa. Os três blocos condicionais devem ficar assim:

```jsx
{gameStatus === "idle" && (
    <StartScreen
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        canStartGame={canStartGame}
        onStartGame={startGame}
    />
)}

{gameStatus === "playing" && currentQuestion && (
    <QuestionCard
        question={currentQuestion}
        answers={currentAnswers}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        timeLimit={QUESTION_TIME_LIMIT}
        onAnswer={handleAnswer}
        onTimeout={handleTimeout}
    />
)}

{gameStatus === "finished" && (
    <ResultScreen
        playerName={cleanPlayerName}
        stats={gameStats}
        onReset={resetGame}
    />
)}
```

**Checkpoint F**

- A app continua a funcionar.
- `App.jsx` continua a guardar o estado principal.
- Os filhos recebem dados por props.
- Os filhos comunicam ações através de callbacks.

---

## 17) Fase 12 - Loading e erro (Paragem G)

Ideia nova desta fase:

- preparar estados visuais antes de chamar a API.

Ficheiros a criar nesta fase:

- criar `src/components/LoadingState.jsx`;
- criar `src/components/ErrorState.jsx`.

Cria `src/components/LoadingState.jsx`:

```jsx
/**
 * Propósito: [Completa: explica porque a app precisa de feedback enquanto espera por dados.]
 * Produz/Devolve: [Completa: descreve a mensagem visual mostrada durante o carregamento.]
 * @returns {JSX.Element} [Completa: descreve o JSX de loading.]
 */
function LoadingState() {
    return (
        <section className="quiz-card">
            {/* Este componente não precisa de state: só mostra feedback fixo.
                O estado loading já foi decidido pelo App. */}
            <h2>A carregar perguntas...</h2>
            <p className="muted">O jogo vai começar dentro de instantes.</p>
        </section>
    );
}

export default LoadingState;
```

Cria `src/components/ErrorState.jsx`:

```jsx
/**
 * Propósito: [Completa: explica como este componente recupera de uma falha da API.]
 * Produz/Devolve: [Completa: descreve a mensagem de erro e as ações disponíveis.]
 * @param {object} props - [Completa: descreve os dados e callbacks usados neste ecrã.]
 * @param {string} props.message - [Completa: explica de onde vem a mensagem.]
 * @param {() => void} props.onUseLocalQuestions - [Completa: explica quando usar perguntas locais.]
 * @param {() => void} props.onReset - [Completa: explica como voltar ao ecrã inicial.]
 * @returns {JSX.Element} [Completa: descreve o JSX de erro.]
 */
function ErrorState({ message, onUseLocalQuestions, onReset }) {
    return (
        <section className="quiz-card">
            <h2>Não foi possível começar o jogo</h2>

            {/* A mensagem vem do App, porque o erro nasce no pedido à API.
                O componente de erro não deve inventar a causa da falha. */}
            <p className="error-text">{message}</p>
            <p className="muted">
                Podes voltar ao início ou continuar com as perguntas locais da
                ficha.
            </p>

            {/*
              O filho não decide como recuperar do erro.
              Apenas chama os callbacks recebidos do pai.
              Assim, a recuperação continua centralizada no App.
            */}
            <div className="button-row">
                <button
                    type="button"
                    className="button-primary"
                    onClick={onUseLocalQuestions}
                >
                    Usar perguntas locais
                </button>

                <button
                    type="button"
                    className="button-secondary"
                    onClick={onReset}
                >
                    Voltar ao início
                </button>
            </div>
        </section>
    );
}

export default ErrorState;
```

**Checkpoint G**

- Os componentes existem.
- Ainda não precisam de aparecer no ecrã.
- Não há erro de import, se já os importaste.

---

## 18) Fase 13 - Serviço da API

Ideia nova desta fase:

- separar a comunicação com a API da interface.

Ficheiro a criar nesta fase: `src/services/triviaApi.js`.

Vamos usar a **Open Trivia DB**:

```text
https://opentdb.com/api.php?amount=5&type=multiple&difficulty=easy&encode=url3986
```

### 18.1) O que é a Open Trivia DB?

A **Open Trivia DB** é uma API pública de perguntas de trivia. Em vez de escrevermos todas as perguntas manualmente, podemos pedir perguntas a este serviço e receber uma resposta em JSON.

Documentação: `https://opentdb.com/api_config.php`

Nesta ficha, ela serve para praticar:

- pedidos HTTP com `fetch`;
- leitura de JSON;
- estados de `loading` e `error`;
- transformação de dados externos para o formato interno da app;
- cuidados com APIs públicas.

Segundo a documentação da Open Trivia DB:

- não é necessária API key para usar o endpoint principal;
- o endpoint devolve um objeto com `response_code` e `results`;
- `response_code` indica se a resposta foi bem-sucedida;
- cada pergunta pode vir com caracteres especiais codificados;
- o parâmetro `encode` controla o formato dessa codificação;
- existe limite de pedidos, por isso não devemos chamar a API sem necessidade.

### 18.2) Que parâmetros vamos usar?

O nosso pedido usa estes parâmetros:

| Parâmetro    | Valor                      | Significado                                        |
| ------------ | -------------------------- | -------------------------------------------------- |
| `amount`     | `5`                        | Queremos 5 perguntas.                              |
| `type`       | `multiple`                 | Queremos perguntas de escolha múltipla.            |
| `difficulty` | `easy`, `medium` ou `hard` | Vem do estado escolhido pelo jogador.              |
| `encode`     | `url3986`                  | Faz a API devolver texto em URL encoding RFC 3986. |

Exemplo:

```text
https://opentdb.com/api.php?amount=5&type=multiple&difficulty=easy&encode=url3986
```

### 18.3) Como é a resposta da API?

A resposta vem num formato parecido com este:

```json
{
    "response_code": 0,
    "results": [
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Science & Nature",
            "question": "What%20is%20H2O%3F",
            "correct_answer": "Water",
            "incorrect_answers": ["Oxygen", "Hydrogen", "Salt"]
        }
    ]
}
```

Repara em dois detalhes importantes:

1. A API usa nomes como `correct_answer` e `incorrect_answers`.
2. A nossa app usa nomes como `correctAnswer` e `incorrectAnswers`.

Por isso vamos criar uma função de normalização. A UI não deve depender diretamente do formato da API.

### 18.4) Porque usamos `encode=url3986`?

Algumas perguntas têm acentos, símbolos ou aspas. A API pode devolver esses caracteres codificados.

Com `encode=url3986`, uma pergunta pode vir assim:

```text
What%20is%20H2O%3F
```

Depois usamos:

```js
decodeURIComponent("What%20is%20H2O%3F");
```

Resultado:

```text
What is H2O?
```

Isto torna o tratamento mais previsível para esta ficha.

### 18.5) Limitação importante

A Open Trivia DB devolve perguntas em inglês. Mais à frente, antes dos desafios finais, vamos adicionar uma camada de tradução com a **MyMemory Translation API**.

Por agora, o objetivo é só carregar perguntas externas corretamente.

Cria `src/services/triviaApi.js`:

```js
const TRIVIA_API_URL = "https://opentdb.com/api.php";

/**
 * Propósito: [Completa: explica porque os textos da API precisam de descodificação.]
 * Produz/Devolve: [Completa: descreve o texto legível produzido pela função.]
 * @param {string} value - [Completa: explica que formato de texto entra na função.]
 * @returns {string} [Completa: explica o texto que sai da função.]
 */
function decodeApiText(value) {
    // A API devolve texto codificado quando usamos encode=url3986.
    // decodeURIComponent transforma esse texto em algo legível no ecrã.
    // Fazemos isto no serviço para os componentes receberem sempre texto já tratado.
    return decodeURIComponent(value);
}

/**
 * Propósito: [Completa: explica porque a app não deve depender diretamente do formato da API.]
 * Produz/Devolve: [Completa: descreve o objeto de pergunta no formato interno da app.]
 * @param {object} apiQuestion - [Completa: descreve a pergunta recebida da Open Trivia DB.]
 * @param {number} index - [Completa: explica como o índice ajuda a criar um id.]
 * @returns {object} [Completa: descreve os campos da pergunta normalizada.]
 */
function normalizeQuestion(apiQuestion, index) {
    // Primeiro descodificamos a pergunta para evitar caracteres estranhos.
    // A UI não deve ter de saber se o texto veio codificado pela API.
    const question = decodeApiText(apiQuestion.question);

    // A app não deve depender diretamente do formato da API.
    // Por isso transformamos tudo para o formato interno usado desde as perguntas locais.
    // Esta normalização permite trocar dados locais por dados externos sem reescrever os componentes.
    return {
        // ID simples e estável o suficiente para esta ficha.
        // Combinar índice e texto reduz a hipótese de chaves repetidas nos exemplos.
        id: `api-question-${index}-${question}`,
        question,

        // A API usa snake_case; a app usa camelCase.
        // Adaptar nomes aqui mantém o resto do código consistente com JavaScript moderno.
        correctAnswer: decodeApiText(apiQuestion.correct_answer),

        // Cada resposta errada também precisa de ser descodificada.
        // Se tratássemos só a pergunta, as opções ainda poderiam aparecer com símbolos codificados.
        incorrectAnswers: apiQuestion.incorrect_answers.map(decodeApiText),
    };
}

/**
 * Propósito: [Completa: explica como esta função comunica com a Open Trivia DB.]
 * Produz/Devolve: [Completa: descreve a lista de perguntas pronta a ser usada pela app.]
 * @param {string} difficulty - [Completa: explica como a dificuldade altera o pedido.]
 * @param {AbortSignal} signal - [Completa: explica porque o pedido pode ser cancelado.]
 * @returns {Promise<object[]>} [Completa: descreve a Promise resolvida com perguntas normalizadas.]
 */
export async function fetchTriviaQuestions(difficulty, signal) {
    // URLSearchParams constrói a query string de forma segura e legível.
    // Evita montar URLs manualmente com concatenações difíceis de rever.
    const params = new URLSearchParams({
        // Mantemos 5 perguntas para a ficha continuar curta.
        // Um número pequeno reduz tempo de espera e facilita testar todos os estados.
        amount: "5",

        // type=multiple garante 1 resposta certa + 3 erradas.
        // Isto bate certo com o formato que a app já aprendeu nas perguntas locais.
        type: "multiple",

        // difficulty vem do state/controlado pelo utilizador.
        // O serviço recebe a dificuldade já escolhida; não lê diretamente a UI.
        difficulty,

        // Facilita a descodificação dos textos.
        // Como escolhemos url3986, sabemos que decodeURIComponent é a ferramenta certa.
        encode: "url3986",
    });

    // O signal permite cancelar o pedido se o jogo for reiniciado rapidamente.
    // Isto evita atualizar state com uma resposta antiga que já não interessa.
    const response = await fetch(`${TRIVIA_API_URL}?${params}`, { signal });

    // response.ok valida erros HTTP, por exemplo 500 ou 404.
    // fetch só rejeita por erro de rede; por isso temos de tratar status HTTP manualmente.
    if (!response.ok) {
        throw new Error("Não foi possível contactar a API.");
    }

    // Converte o corpo JSON da resposta num objeto JavaScript.
    // A partir daqui podemos validar response_code e mapear results.
    const data = await response.json();

    // response_code é uma regra específica da Open Trivia DB.
    // 0 significa sucesso.
    // Mesmo com HTTP 200, a API pode dizer que não encontrou perguntas para esta configuração.
    if (data.response_code !== 0) {
        throw new Error("A API não devolveu perguntas para esta configuração.");
    }

    // Mesmo com response_code 0, validamos se existe uma lista utilizável.
    // Assim evitamos entrar no jogo sem perguntas ou com uma resposta inesperada.
    if (!Array.isArray(data.results) || data.results.length === 0) {
        throw new Error("A API não devolveu perguntas válidas.");
    }

    // A UI recebe sempre perguntas no nosso formato interno.
    // Esta linha é a fronteira entre "dados externos" e "dados prontos para React".
    return data.results.map(normalizeQuestion);
}
```

**Leitura guiada**

1. `fetchTriviaQuestions` faz o pedido.
2. `response.ok` valida se o pedido HTTP correu bem.
3. `response_code` valida a resposta específica da Open Trivia DB.
4. `Array.isArray(data.results)` confirma que há uma lista de perguntas utilizável.
5. `normalizeQuestion` adapta os dados ao formato que a app já usava.
6. `AbortSignal` permite cancelar o pedido se ele deixar de ser necessário.

---

## 19) Fase 14 - `useEffect` via API (Paragem H)

Ideia nova desta fase:

- carregar perguntas externas quando começa um jogo.

Agora a versão local já está estável. Vamos substituir o fluxo principal por API.

Ficheiro a editar nesta fase: `src/App.jsx`.

Atualiza os imports do `App.jsx`:

```jsx
import ErrorState from "./components/ErrorState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import { fetchTriviaQuestions } from "./services/triviaApi";
```

Estes imports são incrementais: junta-os aos imports que já existem no topo do `App.jsx`.

Adiciona estados:

```jsx
const [questions, setQuestions] = useState(localQuestions);
const [errorMessage, setErrorMessage] = useState("");
const [gameRequest, setGameRequest] = useState(null);
```

Substitui estas linhas:

```jsx
const questions = localQuestions;
const currentQuestion = questions[currentQuestionIndex];
const totalQuestions = questions.length;
```

por:

```jsx
const currentQuestion = questions[currentQuestionIndex];
const totalQuestions = questions.length;
```

Atualiza `startGame`:

```jsx
const startGame = () => {
    if (!canStartGame) return;

    // Libertamos qualquer bloqueio de resposta antes de pedir um novo jogo.
    answeredQuestionRef.current = -1;

    // gameRequest representa a intenção explícita de iniciar um jogo.
    // Guardamos a dificuldade neste momento para mudanças posteriores no select
    // não dispararem outro pedido sem novo clique em "Começar jogo".
    setGameRequest({
        id: Date.now(),
        difficulty,
    });
};
```

Adiciona o efeito da API:

```jsx
useEffect(() => {
    // Enquanto gameRequest for null, nenhum jogo foi pedido.
    // Esta guarda impede que a API seja chamada automaticamente no primeiro render.
    if (!gameRequest) return;

    // AbortController permite cancelar este fetch no cleanup.
    // É uma proteção contra respostas atrasadas quando o utilizador muda de fluxo rapidamente.
    const controller = new AbortController();

    async function loadQuestions() {
        try {
            // Antes do pedido, mostramos o ecrã de loading.
            // Isto dá feedback imediato e evita parecer que o botão não fez nada.
            setGameStatus("loading");

            // Limpamos erros antigos para não mostrar mensagens desatualizadas.
            // Um erro de uma tentativa anterior não deve aparecer durante uma nova tentativa.
            setErrorMessage("");

            // Um novo jogo recomeça sempre do início.
            // A API pode devolver uma lista nova, por isso o índice e os resultados antigos deixam de fazer sentido.
            setCurrentQuestionIndex(0);
            setAnswerResults([]);
            answeredQuestionRef.current = -1;
            setTimeLeft(QUESTION_TIME_LIMIT);

            // Pedido real à API. A dificuldade vem do pedido criado no clique.
            // Assim, alterar difficulty depois do jogo começar não dispara novo fetch.
            // O App coordena quando pedir dados; o serviço sabe como fazer o pedido.
            const apiQuestions = await fetchTriviaQuestions(
                gameRequest.difficulty,
                controller.signal,
            );

            // Guardamos as perguntas recebidas no state.
            // Quando este state muda, o ecrã de pergunta passa a usar a lista externa.
            setQuestions(apiQuestions);

            // Só depois de ter perguntas é que entramos no modo playing.
            // Isto evita renderizar QuestionCard sem dados suficientes.
            setGameStatus("playing");
        } catch (error) {
            // Se o erro foi causado por cancelamento, não mostramos erro ao utilizador.
            // Cancelamento é uma decisão normal da app, não uma falha que o aluno precise de ver.
            if (error.name === "AbortError") return;

            // Guardamos mensagem para o ErrorState.
            // Separar mensagem e estado visual torna o erro mais fácil de apresentar.
            setErrorMessage(error.message);

            // Mantemos perguntas locais como fallback interno para a app continuar consistente.
            // Mesmo quando a API falha, o formato das perguntas continua válido.
            setQuestions(localQuestions);

            // Estado próprio de erro para renderização condicional.
            // Assim a UI mostra uma recuperação clara em vez de ficar presa no loading.
            setGameStatus("error");
        }
    }

    loadQuestions();

    // Cleanup: cancela o pedido se este efeito for substituído ou desmontado.
    // Este padrão evita efeitos antigos a interferirem com o estado atual.
    return () => {
        controller.abort();
    };
    // O pedido deve correr apenas quando existe um novo pedido explícito de jogo.
    // A dificuldade usada já ficou guardada dentro de gameRequest.
}, [gameRequest]);
```

Atualiza `resetGame`:

```jsx
const resetGame = () => {
    // Volta ao ecrã inicial.
    // Mantemos nome e dificuldade para o utilizador poder corrigir ou tentar outra vez sem recomeçar tudo.
    setGameStatus("idle");

    // Limpa erro antigo para a próxima tentativa começar limpa.
    // Sem esta limpeza, uma mensagem antiga poderia aparecer num fluxo que já não está em erro.
    setErrorMessage("");
};
```

Adiciona também uma função para o caso de a API falhar e o jogador querer continuar com perguntas locais:

```jsx
const startLocalGame = () => {
    // Usa as perguntas locais já criadas no início da ficha.
    // Este fallback evita que a app dependa totalmente da disponibilidade da API pública.
    setQuestions(localQuestions);

    // Reinicia o progresso do jogo.
    // Ao mudar de fonte de dados, índice, respostas e tempo têm de voltar ao estado inicial.
    setCurrentQuestionIndex(0);
    setAnswerResults([]);
    answeredQuestionRef.current = -1;
    setTimeLeft(QUESTION_TIME_LIMIT);

    // Limpa o erro antigo e entra diretamente no jogo.
    // A partir daqui, a UI deixa de mostrar ErrorState e passa a mostrar QuestionCard.
    setErrorMessage("");
    setGameStatus("playing");
};
```

No `return`, dentro de `<div className="quiz-shell">`, adiciona estes dois blocos condicionais **entre o bloco `idle` e o bloco `playing`**.

Não substituas os blocos `idle`, `playing` ou `finished` nesta etapa. Apenas acrescenta:

```jsx
{gameStatus === "loading" && <LoadingState />}

{gameStatus === "error" && (
    <ErrorState
        message={errorMessage}
        onUseLocalQuestions={startLocalGame}
        onReset={resetGame}
    />
)}
```

**Checkpoint H**

- Ao começar, aparece loading.
- Depois aparecem perguntas vindas da API.
- Se a API falhar, aparece o ecrã de erro.
- Se a API falhar, podes carregar em “Usar perguntas locais” e continuar o jogo.
- O fluxo final usa `questions.length`, ou seja, o tamanho da lista atualmente em jogo.
- As perguntas locais continuam disponíveis como base didática/fallback interno.

---

## 20) Fase 15 - Quando as props são boas

Esta fase é conceptual. Não precisas de criar nem editar ficheiros.

Antes de avançar para Context, fixa esta regra:

Props são boas quando existe uma relação clara entre pai e filho.

Exemplos corretos nesta app:

```jsx
<QuestionCard
    question={currentQuestion}
    answers={currentAnswers}
    onAnswer={handleAnswer}
/>
```

Aqui faz sentido usar props:

- `QuestionCard` precisa da pergunta;
- `QuestionCard` precisa das respostas;
- `QuestionCard` precisa avisar o pai quando o jogador responde.

Não uses Context só para evitar escrever props. Usa Context quando o dado é realmente global ou transversal.

---

## 21) Fase 16 - Prop drilling (Paragem I)

Ideia nova desta fase:

- identificar um caso em que as props começam a ser transportadas por componentes que não precisam delas diretamente.

Esta fase é conceptual. Não precisas de criar nem editar ficheiros.

Imagina que queres usar estes dados em vários sítios:

- `playerName`;
- `difficulty`;
- `theme`;
- `toggleTheme`.

Sem Context, poderias começar a fazer isto:

```jsx
<StartScreen
    playerName={playerName}
    difficulty={difficulty}
    theme={theme}
    toggleTheme={toggleTheme}
/>

<QuestionCard
    question={currentQuestion}
    theme={theme}
/>

<ResultScreen
    playerName={playerName}
    difficulty={difficulty}
    theme={theme}
/>
```

Pior: `QuestionCard` podia receber `theme` só para o passar para `TimerBar`:

```jsx
<TimerBar timeLeft={timeLeft} timeLimit={QUESTION_TIME_LIMIT} theme={theme} />
```

Aqui, `QuestionCard` torna-se apenas um “transportador” de props. Isto é **prop drilling**.

**Checkpoint I**

Consegues explicar:

- porque props continuam corretas para `onAnswer`;
- porque `theme` é um melhor candidato a Context;
- porque Context não deve guardar tudo.

---

## 22) Fase 17 - `useContext` para preferências globais (Paragem J)

Ideia nova desta fase:

- criar um contexto para dados globais simples.

Ficheiros a criar/editar nesta fase:

- criar `src/context/GameSettingsContext.jsx`;
- editar `src/main.jsx`;
- editar `src/App.jsx`.

Vamos colocar em Context:

- `playerName`;
- `difficulty`;
- `theme`;
- funções para alterar estes valores.

### Nota sobre ESLint e Fast Refresh

Algumas configurações recentes do Vite/React usam a regra `react-refresh/only-export-components`. Essa regra prefere que um ficheiro exporte apenas componentes React, porque isso ajuda o Fast Refresh durante o desenvolvimento.

Nesta ficha vamos manter o `Provider` e o hook `useGameSettings` no mesmo ficheiro para facilitar a leitura didática. Por isso, se tiveres essa regra ativa, coloca o comentário abaixo no topo do ficheiro.

Em projetos maiores, uma alternativa mais limpa seria separar em dois ficheiros, por exemplo:

- `GameSettingsProvider.jsx`;
- `useGameSettings.js`.

Cria `src/context/GameSettingsContext.jsx`:

```jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const GameSettingsContext = createContext(null);

/**
 * Propósito: [Completa: explica que dados globais este Provider disponibiliza.]
 * Produz/Devolve: [Completa: descreve o Provider que envolve os componentes filhos.]
 * @param {object} props - [Completa: descreve as props recebidas pelo Provider.]
 * @param {React.ReactNode} props.children - [Completa: explica que componentes ficam dentro do contexto.]
 * @returns {JSX.Element} [Completa: descreve o JSX com o Provider.]
 */
export function GameSettingsProvider({ children }) {
    // Estes estados deixam de viver no App porque são preferências globais.
    // Vários componentes podem precisar deles, mesmo que não estejam numa relação direta de pai/filho.
    // Context evita passar estas preferências por componentes intermédios que não as usam.
    const [playerName, setPlayerName] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [theme, setTheme] = useState("light");

    const value = useMemo(() => {
        // Este objeto agrupa as preferências globais e as funções que as alteram.
        // Por isso deve conter apenas dados realmente globais e não ações específicas de um componente.
        return {
            playerName,
            setPlayerName,
            difficulty,
            setDifficulty,
            theme,
            toggleTheme: () => {
                // Atualização funcional para depender sempre do tema atual mais recente.
                // Isto é mais seguro do que calcular o próximo tema a partir de uma variável possivelmente antiga.
                setTheme((currentTheme) =>
                    currentTheme === "light" ? "dark" : "light",
                );
            },
        };
        // O objeto só é recriado quando alguma preferência muda.
        // Isto evita criar uma referência nova em todos os renders e reduz re-renders desnecessários dos consumidores.
    }, [playerName, difficulty, theme]);

    return (
        <GameSettingsContext.Provider value={value}>
            {children}
        </GameSettingsContext.Provider>
    );
}

/**
 * Propósito: [Completa: explica porque criamos um hook próprio em vez de usar useContext diretamente.]
 * Produz/Devolve: [Completa: descreve o objeto de preferências globais devolvido.]
 * @returns {object} [Completa: indica que valores e funções ficam disponíveis.]
 */
export function useGameSettings() {
    // useContext lê o valor mais próximo fornecido pelo Provider.
    // Se houver vários Providers, React usa o mais próximo na árvore de componentes.
    const context = useContext(GameSettingsContext);

    if (!context) {
        // Erro intencional: ajuda a detetar uso do hook fora do Provider.
        // Falhar cedo com uma mensagem clara é melhor do que devolver undefined e causar erros confusos mais tarde.
        throw new Error(
            "useGameSettings deve ser usado dentro de GameSettingsProvider.",
        );
    }

    return context;
}
```

Atualiza `src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GameSettingsProvider } from "./context/GameSettingsContext.jsx";
import "./styles/index.css";
import "./styles/quiz.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GameSettingsProvider>
            <App />
        </GameSettingsProvider>
    </React.StrictMode>,
);
```

No `App.jsx`, remove os estados:

```jsx
const [playerName, setPlayerName] = useState("");
const [difficulty, setDifficulty] = useState("easy");
```

E usa:

```jsx
const {
    playerName,
    setPlayerName,
    difficulty,
    setDifficulty,
    theme,
    toggleTheme,
} = useGameSettings();
```

Importa o hook:

```jsx
import { useGameSettings } from "./context/GameSettingsContext.jsx";
```

No `return`, substitui apenas a abertura do `<main>`.

Antes tinhas algo deste género:

```jsx
<main className="app">
    {/* mantém aqui o conteúdo que já existia dentro do main */}
</main>
```

Depois deve ficar assim:

```jsx
<main className={`app ${theme === "dark" ? "app--dark" : ""}`}>
    {/* mantém aqui o conteúdo que já existia dentro do main */}
</main>
```

Adiciona botão de tema no topo:

```jsx
<button type="button" className="button-secondary" onClick={toggleTheme}>
    Alternar tema
</button>
```

**Checkpoint J**

- O tema alterna.
- O nome continua controlado.
- A dificuldade continua a afetar o pedido à API.
- `playerName`, `difficulty` e `theme` já vivem no Context.
- `onAnswer` continua a ser prop, porque é uma ação específica do jogo.

---

## 23) Fase 18 - Tradução automática com MyMemory (Paragem K)

Ideia nova desta fase:

- usar uma segunda API para melhorar a experiência do utilizador;
- traduzir as perguntas da Open Trivia DB de inglês para português;
- manter fallback para inglês se a tradução falhar.

Ficheiros a criar/editar nesta fase:

- criar `src/services/translationApi.js`;
- editar `src/services/triviaApi.js`;
- editar `src/components/LoadingState.jsx`.

Esta fase aparece no fim porque a app principal já está funcional. Assim, se a tradução falhar, a ficha continua válida.

### 23.1) O que é a MyMemory?

A **MyMemory** é uma API de tradução baseada numa grande memória de tradução. Uma memória de tradução é uma coleção de frases já traduzidas. Quando não existe uma tradução humana adequada, o serviço pode recorrer a tradução automática.

Documentação técnica: `https://mymemory.translated.net/doc/spec.php`

Limites de utilização: `https://mymemory.translated.net/doc/usagelimits.php`

Nesta ficha, a MyMemory serve para traduzir:

- o texto da pergunta;
- a resposta certa;
- as respostas erradas.

Vamos usar o endpoint público:

```text
https://api.mymemory.translated.net/get
```

Segundo a documentação da MyMemory:

- o endpoint `get` recebe o texto no parâmetro `q`;
- o parâmetro `langpair` indica o par de línguas, por exemplo `en|pt-PT`;
- sem API key, é possível consultar memórias públicas;
- existe limite de utilização para pedidos gratuitos/anónimos;
- cada segmento em `q` deve ser curto;
- a resposta inclui normalmente `responseData.translatedText`.
- em projetos reais ou uso mais intensivo, é recomendado identificar o pedido com `de`, um email de contacto, para limites mais altos e suporte.

### 23.2) Porque esta fase deve ter fallback?

Agora a app passa a depender de duas APIs:

1. Open Trivia DB para perguntas;
2. MyMemory para tradução.

Isto aumenta a possibilidade de falha:

- a tradução pode atingir limite diário;
- a rede pode falhar;
- o serviço pode devolver uma tradução fraca;
- o texto pode não ter tradução encontrada;
- a tradução pode demorar mais do que o pedido inicial.

Por isso, a regra desta fase é:

> Se a tradução falhar, a app mostra a pergunta original em inglês.

Isto é uma decisão importante de UX: é melhor ter um quiz em inglês do que não ter quiz nenhum.

Também é normal o loading ficar mais lento nesta fase. O pedido às perguntas acontece uma vez, mas a tradução pode implicar vários pedidos pequenos. Por isso, o fallback da tradução deve ficar dentro de `translationApi.js`: o `App.jsx` não deve ir para o ecrã de erro só porque a tradução falhou.

### 23.3) Criar `src/services/translationApi.js`

Cria o ficheiro `src/services/translationApi.js`:

```js
const MYMEMORY_API_URL = "https://api.mymemory.translated.net/get";
const SOURCE_LANGUAGE = "en";
const TARGET_LANGUAGE = "pt-PT";

/**
 * Propósito: [Completa: explica como esta função traduz um único texto.]
 * Produz/Devolve: [Completa: descreve o texto traduzido ou o fallback devolvido.]
 * @param {string} text - [Completa: explica que texto deve ser enviado para tradução.]
 * @param {AbortSignal} signal - [Completa: explica porque a tradução pode ser cancelada.]
 * @returns {Promise<string>} [Completa: descreve a Promise com texto traduzido ou original.]
 */
async function translateTextToPortuguese(text, signal) {
    // Proteção simples: se o texto estiver vazio, não vale a pena chamar a API.
    // Evita pedidos inúteis e reduz o risco de atingir limites gratuitos.
    if (!text.trim()) return text;

    // A MyMemory usa query string, por isso URLSearchParams ajuda a codificar o texto.
    // Isto é importante porque perguntas podem ter espaços, símbolos e pontuação.
    const params = new URLSearchParams({
        q: text,
        langpair: `${SOURCE_LANGUAGE}|${TARGET_LANGUAGE}`,
    });

    // Cada tradução é um pedido GET.
    // O signal segue junto para permitir cancelar traduções pendentes se o jogo mudar.
    const response = await fetch(`${MYMEMORY_API_URL}?${params}`, { signal });

    if (!response.ok) {
        throw new Error("Não foi possível traduzir o texto.");
    }

    const data = await response.json();

    // responseData.translatedText é o campo principal usado pela API.
    // Se ele não existir, devolvemos o texto original como fallback local.
    // O objetivo é melhorar a experiência, não impedir o jogo por causa da tradução.
    return data.responseData?.translatedText || text;
}

/**
 * Propósito: [Completa: explica como esta função traduz todos os textos de uma pergunta.]
 * Produz/Devolve: [Completa: descreve a pergunta traduzida mantendo o mesmo formato interno.]
 * @param {object} question - [Completa: descreve a pergunta normalizada recebida.]
 * @param {AbortSignal} signal - [Completa: explica como o cancelamento atravessa as traduções.]
 * @returns {Promise<object>} [Completa: descreve a pergunta devolvida em português ou inglês.]
 */
export async function translateQuestionToPortuguese(question, signal) {
    try {
        // Juntamos todos os textos da pergunta numa lista.
        // Traduzir pergunta e respostas em conjunto mantém o formato interno fácil de reconstruir.
        const textsToTranslate = [
            question.question,
            question.correctAnswer,
            ...question.incorrectAnswers,
        ];

        // Traduzimos os textos da mesma pergunta em paralelo.
        // Isto torna cada pergunta mais rápida do que traduzir pergunta, certa e erradas uma a uma.
        const translatedTexts = await Promise.all(
            textsToTranslate.map((text) =>
                translateTextToPortuguese(text, signal),
            ),
        );

        const [
            translatedQuestion,
            translatedCorrectAnswer,
            ...translatedIncorrectAnswers
        ] = translatedTexts;

        return {
            ...question,
            question: translatedQuestion,
            correctAnswer: translatedCorrectAnswer,
            incorrectAnswers: translatedIncorrectAnswers,
        };
    } catch (error) {
        // AbortError deve continuar a subir para o useEffect cancelar corretamente.
        // Se engolíssemos este erro, a app poderia tratar um cancelamento como tradução falhada normal.
        if (error.name === "AbortError") throw error;

        // Se a tradução falhar, mantemos a pergunta original em inglês.
        // Este fallback preserva o jogo mesmo quando a segunda API está indisponível.
        return question;
    }
}

/**
 * Propósito: [Completa: explica porque traduzimos a lista depois de normalizar as perguntas.]
 * Produz/Devolve: [Completa: descreve a lista final usada pelo jogo.]
 * @param {object[]} questions - [Completa: descreve a lista de perguntas antes da tradução.]
 * @param {AbortSignal} signal - [Completa: explica como o cancelamento protege a app.]
 * @returns {Promise<object[]>} [Completa: descreve a Promise com perguntas traduzidas sempre que possível.]
 */
export async function translateQuestionsToPortuguese(questions, signal) {
    const translatedQuestions = [];

    // Usamos ciclo sequencial para ser mais simpático com a API gratuita.
    // Dentro de cada pergunta, os 5 textos continuam a ser traduzidos em paralelo.
    // É um compromisso: menos pressão sobre a API, mas ainda com alguma velocidade por pergunta.
    for (const question of questions) {
        const translatedQuestion = await translateQuestionToPortuguese(
            question,
            signal,
        );

        translatedQuestions.push(translatedQuestion);
    }

    return translatedQuestions;
}
```

### 23.4) Atualizar `src/services/triviaApi.js`

Agora vamos ligar a camada de tradução à camada de perguntas.

No topo de `src/services/triviaApi.js`, adiciona:

```js
import { translateQuestionsToPortuguese } from "./translationApi";
```

Depois, no fim de `fetchTriviaQuestions`, substitui:

```js
return data.results.map(normalizeQuestion);
```

por:

```js
const normalizedQuestions = data.results.map(normalizeQuestion);

return translateQuestionsToPortuguese(normalizedQuestions, signal);
```

Mantém a validação de `data.results` antes deste bloco. A tradução só deve receber uma lista de perguntas já validada e normalizada.

**O que mudou?**

- `triviaApi.js` continua responsável por carregar perguntas.
- `translationApi.js` fica responsável por traduzir textos.
- `App.jsx` não precisa de saber que existem duas APIs.
- Se a tradução falhar, a pergunta original continua disponível.

### 23.5) Ajustar o loading

Agora o loading pode demorar um pouco mais, porque a app faz:

1. pedido à Open Trivia DB;
2. normalização das perguntas;
3. pedidos de tradução à MyMemory.

Atualiza `LoadingState.jsx` para explicar melhor:

```jsx
/**
 * Propósito: [Completa: explica porque este loading menciona carregamento e tradução.]
 * Produz/Devolve: [Completa: descreve a mensagem mostrada ao utilizador.]
 * @returns {JSX.Element} [Completa: descreve o JSX de loading final.]
 */
function LoadingState() {
    return (
        <section className="quiz-card">
            <h2>A preparar perguntas...</h2>
            <p className="muted">
                A carregar perguntas e a tentar traduzir para português.
            </p>
        </section>
    );
}

export default LoadingState;
```

**Checkpoint K**

- O jogo continua a carregar perguntas.
- Sempre que a tradução funcionar, as perguntas aparecem em português.
- Se a tradução falhar, a app continua a mostrar perguntas em inglês.
- O `App.jsx` não ficou cheio de lógica de tradução.

---

## 24) Versão final sugerida - `App.jsx`

Esta versão junta as fases principais depois da componentização e do Context.

Ficheiro de referência desta secção: `src/App.jsx`.

Nota importante: nesta fase, `fetchTriviaQuestions` já carrega perguntas da Open Trivia DB e tenta traduzi-las através da MyMemory. O `App.jsx` não precisa de conhecer os detalhes da tradução.

```jsx
import { useEffect, useMemo, useRef, useState } from "react";
import ErrorState from "./components/ErrorState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import StartScreen from "./components/StartScreen.jsx";
import { useGameSettings } from "./context/GameSettingsContext.jsx";
import { localQuestions } from "./data/localQuestions";
import { fetchTriviaQuestions } from "./services/triviaApi";

const QUESTION_TIME_LIMIT = 15;

/**
 * Propósito: [Completa: explica porque esta função baralha sem mutar o array recebido.]
 * Produz/Devolve: [Completa: descreve a nova lista de respostas em ordem diferente.]
 * @param {string[]} items - [Completa: descreve os itens que podem ser baralhados.]
 * @returns {string[]} [Completa: descreve a cópia baralhada devolvida.]
 */
function shuffleItems(items) {
    return [...items].sort(() => Math.random() - 0.5);
}

/**
 * Propósito: [Completa: explica como o App coordena estado, efeitos, API, contexto e componentes.]
 * Produz/Devolve: [Completa: descreve os ecrãs possíveis e o fluxo principal renderizado.]
 * @returns {JSX.Element} [Completa: descreve o JSX final da aplicação.]
 */
function App() {
    // Preferências globais vêm do Context.
    // Assim, deixam de ter de ser passadas manualmente por vários níveis.
    // Isto resolve o caso de prop drilling sem transformar todas as props em Context.
    const {
        playerName,
        setPlayerName,
        difficulty,
        setDifficulty,
        theme,
        toggleTheme,
    } = useGameSettings();

    // Estado do fluxo principal da app.
    // Decide que ecrã é renderizado: idle, loading, error, playing ou finished.
    // Um único estado textual é mais fácil de manter do que vários booleans que podem entrar em conflito.
    const [gameStatus, setGameStatus] = useState("idle");

    // Lista de perguntas atualmente usada pelo jogo.
    // Começa com perguntas locais para a app ter uma base segura.
    // Depois da API, este mesmo state passa a guardar perguntas externas traduzidas quando possível.
    const [questions, setQuestions] = useState(localQuestions);

    // Índice da pergunta atual dentro de questions.
    // Guardar o índice mantém a pergunta atual derivada da lista, em vez de duplicar objetos em state.
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Histórico de resultados: true para certa, false para errada.
    // Este array é suficiente para calcular pontuação, percentagem e objetivo atingido.
    const [answerResults, setAnswerResults] = useState([]);

    // Tempo restante da pergunta atual.
    // É reiniciado sempre que o jogo começa ou avança para outra pergunta.
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);

    // Bloqueia respostas repetidas na mesma pergunta.
    // useRef muda imediatamente e evita duplo clique antes do próximo render.
    const answeredQuestionRef = useRef(-1);

    // Mensagem mostrada quando o pedido à API falha.
    // Guardamos a mensagem separada para o ErrorState poder apresentar feedback específico.
    const [errorMessage, setErrorMessage] = useState("");

    // Pedido explícito para iniciar um novo jogo via useEffect.
    // Guardamos a dificuldade escolhida no momento do clique em "Começar jogo".
    // Assim, mudar a dificuldade depois não dispara outro pedido automaticamente.
    const [gameRequest, setGameRequest] = useState(null);

    // Valor limpo usado na validação e no ecrã final.
    // trim evita que espaços extra contem como nome real.
    const cleanPlayerName = playerName.trim();

    // Regra mínima para poder começar.
    // Esta variável é usada no botão e no handler, mantendo a validação consistente.
    const canStartGame = cleanPlayerName.length >= 2;

    // Pergunta atual derivada do array e do índice.
    // Se a lista mudar ou o índice mudar, esta variável acompanha automaticamente.
    const currentQuestion = questions[currentQuestionIndex];

    // Total atual. Depois da API, pode ser diferente das perguntas locais.
    // Usar questions.length evita referências antigas a localQuestions.length.
    const totalQuestions = questions.length;

    const currentAnswers = useMemo(() => {
        if (!currentQuestion) return [];

        return shuffleItems([
            currentQuestion.correctAnswer,
            ...currentQuestion.incorrectAnswers,
        ]);
    }, [currentQuestion]);

    const gameStats = useMemo(() => {
        const correctAnswers = answerResults.filter(Boolean).length;
        const score = correctAnswers * 100;
        const percentage =
            totalQuestions > 0
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0;
        const victory = percentage >= 60;

        return {
            correctAnswers,
            totalQuestions,
            score,
            percentage,
            victory,
        };
    }, [answerResults, totalQuestions]);

    useEffect(() => {
        // Este efeito é exclusivamente local: controla o relógio.
        // Não comunica com APIs nem lê dados externos; apenas reage ao estado do jogo e ao tempo.
        if (gameStatus !== "playing") return;
        if (timeLeft === 0) return;

        const timeoutId = setTimeout(() => {
            setTimeLeft((currentTime) => currentTime - 1);
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [gameStatus, timeLeft]);

    useEffect(() => {
        // Este efeito é externo: comunica com a API.
        // Está separado do temporizador para distinguir bem os dois usos de useEffect.
        if (!gameRequest) return;

        const controller = new AbortController();

        async function loadQuestions() {
            try {
                setGameStatus("loading");
                setErrorMessage("");
                setCurrentQuestionIndex(0);
                setAnswerResults([]);
                answeredQuestionRef.current = -1;
                setTimeLeft(QUESTION_TIME_LIMIT);

                const apiQuestions = await fetchTriviaQuestions(
                    gameRequest.difficulty,
                    controller.signal,
                );

                setQuestions(apiQuestions);
                setGameStatus("playing");
            } catch (error) {
                if (error.name === "AbortError") return;

                setErrorMessage(error.message);
                setQuestions(localQuestions);
                setGameStatus("error");
            }
        }

        loadQuestions();

        return () => {
            controller.abort();
        };
    }, [gameRequest]);

    const startGame = () => {
        // Mantém a validação no handler para proteger a lógica,
        // mesmo que o botão já esteja disabled.
        // A interface ajuda o utilizador, mas a função continua responsável por validar.
        if (!canStartGame) return;

        // Criar um novo gameRequest é o "sinal" para o useEffect carregar perguntas.
        // A dificuldade fica congelada neste pedido concreto.
        answeredQuestionRef.current = -1;
        setGameRequest({
            id: Date.now(),
            difficulty,
        });
    };

    const resetGame = () => {
        // Volta ao ecrã inicial sem apagar nome/dificuldade.
        // Isto permite ao jogador repetir sem preencher tudo novamente.
        setGameStatus("idle");
        setErrorMessage("");
    };

    const startLocalGame = () => {
        // Fallback útil quando a API externa falha.
        // A ficha continua testável mesmo sem rede ou com limites da API.
        setQuestions(localQuestions);
        setCurrentQuestionIndex(0);
        setAnswerResults([]);
        answeredQuestionRef.current = -1;
        setTimeLeft(QUESTION_TIME_LIMIT);
        setErrorMessage("");
        setGameStatus("playing");
    };

    const handleAnswer = (selectedAnswer) => {
        // Evita que a mesma pergunta seja respondida duas vezes por duplo clique.
        // A ref é atualizada imediatamente, sem esperar por nova renderização.
        if (answeredQuestionRef.current === currentQuestionIndex) return;

        answeredQuestionRef.current = currentQuestionIndex;

        // Compara com a resposta certa da pergunta atual.
        // Toda a lógica de pontuação nasce desta comparação simples.
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        // Atualização imutável do histórico.
        // Criar novo array garante que o React deteta a alteração.
        const updatedResults = [...answerResults, isCorrect];

        setAnswerResults(updatedResults);

        // Se esta era a última pergunta, termina o jogo.
        // Evita avançar para um índice sem pergunta correspondente.
        const isLastQuestion = currentQuestionIndex === questions.length - 1;

        if (isLastQuestion) {
            setGameStatus("finished");
            return;
        }

        // Caso contrário, avança e reinicia o temporizador.
        // Índice e tempo mudam juntos para a próxima pergunta começar limpa.
        setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
        setTimeLeft(QUESTION_TIME_LIMIT);
    };

    const handleTimeout = () => {
        // Resposta vazia conta sempre como errada.
        // Isto permite reutilizar handleAnswer sem criar uma segunda lógica de pontuação.
        handleAnswer("");
    };

    return (
        <main className={`app ${theme === "dark" ? "app--dark" : ""}`}>
            <div className="quiz-shell">
                <h1>Quiz Game</h1>
                <p>Responde a perguntas para testar conhecimentos.</p>

                {/* toggleTheme vem do Context porque o tema é uma preferência global da app. */}
                <button
                    type="button"
                    className="button-secondary"
                    onClick={toggleTheme}
                >
                    Alternar tema
                </button>

                {gameStatus === "idle" && (
                    // Props específicas continuam a ser boas aqui:
                    // StartScreen precisa destes valores e callbacks diretamente.
                    // Context não substitui automaticamente comunicação direta entre pai e filho.
                    <StartScreen
                        playerName={playerName}
                        onPlayerNameChange={setPlayerName}
                        difficulty={difficulty}
                        onDifficultyChange={setDifficulty}
                        canStartGame={canStartGame}
                        onStartGame={startGame}
                    />
                )}

                {gameStatus === "loading" && <LoadingState />}

                {gameStatus === "error" && (
                    // O ecrã de erro também permite continuar com perguntas locais.
                    // Esta decisão melhora a experiência quando a API falha.
                    <ErrorState
                        message={errorMessage}
                        onUseLocalQuestions={startLocalGame}
                        onReset={resetGame}
                    />
                )}

                {gameStatus === "playing" && currentQuestion && (
                    // A pergunta recebe dados e callbacks específicos do jogo.
                    // Isto continua a ser props, não Context.
                    // onAnswer é uma ação local deste fluxo, não uma preferência global.
                    <QuestionCard
                        question={currentQuestion}
                        answers={currentAnswers}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={totalQuestions}
                        timeLeft={timeLeft}
                        timeLimit={QUESTION_TIME_LIMIT}
                        onAnswer={handleAnswer}
                        onTimeout={handleTimeout}
                    />
                )}

                {gameStatus === "finished" && (
                    // O ecrã final recebe estatísticas já calculadas.
                    // Assim o componente de apresentação não duplica lógica de cálculo.
                    <ResultScreen
                        playerName={cleanPlayerName}
                        stats={gameStats}
                        onReset={resetGame}
                    />
                )}
            </div>
        </main>
    );
}

export default App;
```

---

## 25) Critérios de aceitação obrigatórios

No fim da ficha, a app deve cumprir:

- O projeto arranca com `npm run dev`.
- O repositório fica pronto para entrega até **18/05 às 23:55**.
- O nome do jogador é obrigatório e tem validação mínima.
- A dificuldade é controlada por React.
- O jogo começa com loading.
- As perguntas vêm da Open Trivia DB.
- A app tenta traduzir as perguntas com a MyMemory.
- Se a tradução falhar, as perguntas continuam a aparecer em inglês.
- Se a API falhar, aparece ecrã de erro.
- Se a API falhar, existe um botão para usar perguntas locais.
- O temporizador desce de segundo em segundo.
- Quando o tempo chega a 0, as respostas ficam bloqueadas.
- O botão “Avançar” conta como resposta errada.
- A pontuação final é calculada com `useMemo`.
- O tema claro/escuro funciona com Context.
- Todos os JSDoc foram preenchidos com explicações próprias.
- Cada JSDoc explica o propósito da função/componente e o que ela produz/devolve.
- Não ficam placeholders `[Completa: ...]` nos JSDoc.
- A consola do browser não tem erros.

---

## 26) Erros comuns e correções

### O projeto não encontra os ficheiros CSS

Confirma os imports no `main.jsx`:

```jsx
import "./styles/index.css";
import "./styles/quiz.css";
```

E confirma se a pasta se chama mesmo `styles`.

### O temporizador está demasiado rápido

Confirma se usaste `1000` no `setTimeout`, não `100`.

### O temporizador continua após terminar o jogo

Confirma se o `useEffect` tem esta guarda:

```jsx
if (gameStatus !== "playing") return;
```

### O temporizador cria comportamentos estranhos

Confirma se existe cleanup:

```jsx
return () => {
    clearTimeout(timeoutId);
};
```

### As respostas mudam de ordem quando o tempo desce

Provavelmente estás a baralhar diretamente no JSX.

Usa `useMemo` com dependência em `currentQuestion`.

### A API devolve textos estranhos

Confirma se o pedido inclui:

```text
encode=url3986
```

E se estás a usar `decodeURIComponent`.

### A API falha

Verifica:

1. Tens internet?
2. O endpoint está correto?
3. A consola mostra erro de CORS ou rede?
4. Estás a verificar `response.ok`?
5. Estás a tratar `data.response_code`?

Mesmo tratando bem o erro, uma API pública pode estar temporariamente indisponível. Por isso, a ficha inclui o botão “Usar perguntas locais” no `ErrorState`. Esse botão não corrige a API, mas mantém o jogo utilizável.

### A tradução não aparece em português

Verifica:

1. A função `translateQuestionsToPortuguese` está importada no `triviaApi.js`?
2. Estás a chamar `translateQuestionsToPortuguese(normalizedQuestions, signal)`?
3. A consola mostra erro da MyMemory?
4. Atingiste o limite gratuito/anónimo?
5. A pergunta pode simplesmente não ter tradução boa disponível.

Lembra-te: nesta ficha, tradução é melhoria. Se falhar, o fallback para inglês é comportamento esperado.

### A tradução fica lenta

É normal ficar mais lenta do que antes. Agora a app faz pedidos à Open Trivia DB e depois vários pedidos à MyMemory.

Para reduzir pedidos:

- mantém `amount` em `5`;
- não chames a API a cada render;
- só começa novo jogo quando o utilizador carrega no botão.

### A app mostra resultado com 0 perguntas

Confirma se `totalQuestions` vem de `questions.length` e se a API carregou dados antes de entrar em `playing`.

### `useGameSettings` dá erro

Confirma se `App` está dentro do Provider:

```jsx
<GameSettingsProvider>
    <App />
</GameSettingsProvider>
```

### Context está a substituir props demais

Se o dado é específico de um componente filho, usa props.

Exemplo: `onAnswer` deve continuar a ser prop, porque é uma ação específica de `QuestionCard`.

### ESLint mostra erro em `GameSettingsContext.jsx`

Se aparecer uma mensagem parecida com:

```text
Fast refresh only works when a file only exports components
```

é a regra `react-refresh/only-export-components`.

Nesta ficha, a correção didática é manter o Provider e o hook juntos e adicionar no topo de `src/context/GameSettingsContext.jsx`:

```jsx
/* eslint-disable react-refresh/only-export-components */
```

Em projetos profissionais maiores, também podes separar o Provider e o hook em ficheiros diferentes.

### ESLint mostra erro `set-state-in-effect`

Algumas versões recentes do `eslint-plugin-react-hooks` avisam quando um `useEffect` faz `setState` diretamente no corpo do efeito.

Regra prática:

- usa `useEffect` para sincronizar com algo externo, como temporizadores, APIs ou eventos do browser;
- evita usar `useEffect` só para recalcular ou copiar estado;
- se um valor deriva de outro, prefere `useMemo` ou uma variável calculada;
- se uma ação acontece por clique ou resposta, atualiza o estado dentro do handler dessa ação.

Exemplo a evitar:

```jsx
useEffect(() => {
    setIsAnswerLocked(false);
}, [currentQuestionIndex]);
```

Melhor opção para esta ficha:

```jsx
const answeredQuestionRef = useRef(-1);

const handleAnswer = (selectedAnswer) => {
    if (answeredQuestionRef.current === currentQuestionIndex) return;

    answeredQuestionRef.current = currentQuestionIndex;
    // continua aqui a mesma lógica de avaliar a resposta, guardar o resultado,
    // avançar para a próxima pergunta ou terminar o jogo.
};
```

Este padrão já foi usado no fluxo principal da ficha. `useRef` evita um duplo clique muito rápido antes de o React conseguir renderizar outra vez.

O mesmo cuidado vale para o desafio do `localStorage`: guarda a melhor pontuação quando o jogo termina dentro da função que trata a última resposta, em vez de criar um `useEffect` só para reagir a `gameStatus === "finished"`.

---

## 27) Desafios finais

Escolhe 2 ou 3:

1. Adicionar botão “Jogar outra vez” no ecrã final.
2. Permitir escolher 5 ou 10 perguntas.
3. Guardar melhor pontuação no `localStorage`.
4. Mostrar uma medalha diferente conforme a percentagem final.
5. Mostrar feedback diferente para objetivo atingido e objetivo por atingir.
6. Mostrar uma mensagem curta de incentivo durante o jogo.
7. Criar componente `ScoreBadge`.
8. Mostrar a dificuldade no ecrã final.
9. Criar um botão “Usar perguntas locais” se a API falhar.

Notas para resolver os desafios sem criar problemas novos:

- No desafio do `localStorage`, guarda apenas dados simples: nome, pontuação, percentagem, dificuldade e data.
- Não guardes a melhor pontuação num `useEffect` que depende de muitos estados. É mais simples guardar quando detetas a última resposta em `handleAnswer`.
- No desafio “Usar perguntas locais”, reaproveita `localQuestions`; não faças novo pedido à API.
- Se adicionares escolha de 5 ou 10 perguntas, passa esse valor para `fetchTriviaQuestions` e para o fallback local.

---

## 28) Checklist de validação

Antes de entregar, confirma:

- [ ] A app arranca com `npm run dev`.
- [ ] O repositório está pronto para entrega até **18/05 às 23:55**.
- [ ] O layout usa `index.css` e `quiz.css`.
- [ ] O nome do jogador é controlado por React.
- [ ] O botão de começar fica bloqueado sem nome válido.
- [ ] A dificuldade altera o pedido à API.
- [ ] O jogo mostra loading.
- [ ] As perguntas externas aparecem.
- [ ] A app tenta traduzir perguntas para português.
- [ ] Se a tradução falhar, a app mantém perguntas em inglês.
- [ ] Existe ecrã de erro se a API falhar.
- [ ] O temporizador funciona.
- [ ] O temporizador bloqueia respostas aos 0 segundos.
- [ ] As respostas não mudam de ordem a cada segundo.
- [ ] A pontuação final está correta.
- [ ] `useMemo` é usado para estatísticas.
- [ ] `useMemo` é usado para respostas baralhadas.
- [ ] Os componentes recebem props adequadas.
- [ ] O prop drilling é explicado.
- [ ] `useContext` é usado para preferências globais.
- [ ] Preenchi todos os JSDoc com as minhas próprias palavras.
- [ ] Cada JSDoc explica claramente o propósito da função/componente.
- [ ] Cada JSDoc explica claramente o que a função/componente produz ou devolve.
- [ ] Os JSDoc não ficaram com placeholders `[Completa: ...]`.
- [ ] A consola do browser não tem erros.

---

## 29) Perguntas de revisão

1. Porque começámos com perguntas locais antes da API?
2. Qual é a diferença entre estado e estado derivado?
3. Porque não guardamos `score` diretamente em `useState`?
4. Porque as respostas devem ser baralhadas com `useMemo`?
5. Porque o temporizador precisa de cleanup?
6. O que aconteceria se fizesses `fetch` diretamente no corpo do componente?
7. Porque precisamos de estados `loading` e `error`?
8. O que é prop drilling?
9. Quando é melhor usar props em vez de Context?
10. Porque a tradução deve ter fallback para inglês?
11. Porque o `value` do Context foi criado com `useMemo`?

---

## 30) Resumo final

Nesta ficha construíste uma app React pequena, mas completa:

- começaste com layout estático;
- criaste inputs controlados;
- geriste estados de jogo;
- usaste perguntas locais para aprender a mecânica;
- calculaste estatísticas com `useMemo`;
- criaste um temporizador com `useEffect`;
- separaste a app em componentes;
- carregaste perguntas de uma API com outro `useEffect`;
- adicionaste uma camada de tradução com uma segunda API;
- trataste loading e erro;
- identificaste prop drilling;
- usaste `useContext` para preferências globais.

Antes de entregar, volta aos JSDoc e melhora-os. A qualidade dos JSDoc conta: eles devem mostrar que compreendes o propósito de cada função/componente e aquilo que cada uma produz ou devolve.

Prazo de entrega do repositório: **18/05 às 23:55**.

O objetivo não é decorar hooks. O objetivo é perceber quando cada ferramenta faz sentido.

![Footer](../../Images/Footer.png)
