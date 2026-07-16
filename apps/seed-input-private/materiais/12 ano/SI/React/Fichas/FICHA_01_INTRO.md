![Header](../../Images/Header.png)

# Tutorial passo a passo - Lista de Boas-vindas (Ficha React 12.º ano)

Esta ficha apresenta uma app React simples, mas completa para uma aula introdutória.

Objetivos pedagógicos desta ficha:

1. Entender a estrutura mínima de um componente React.
2. Usar `useState` para alterar a interface em tempo real.
3. Criar um formulário controlado (`value` + `onChange`).
4. Reagir ao `submit` de um formulário sem recarregar a página.
5. Renderizar listas com `.map()` e `key`.
6. Separar responsabilidades em componentes.

---

## 0) O que vais construir

Uma app chamada **Lista de Boas-vindas** que permite:

- alternar tema claro/escuro;
- escrever um nome num formulário;
- ao submeter, mostrar `Olá, <nome>!`;
- guardar esse nome numa lista apresentada por baixo.

### Vocabulário rápido

- **Componente**: função que devolve JSX para construir interface.
- **Estado (`state`)**: dados que mudam durante a execução.
- **Props**: dados/funções passadas do pai para o filho.
- **Input controlado**: o valor do input vem do estado React.
- **Renderização condicional**: mostrar algo apenas se certa condição for verdadeira.

### Organização da ficha

- A progressão está dividida em fases curtas e incrementais.
- Cada fase acrescenta uma ideia de React à app anterior.
- Os checkpoints assinalam estados intermédios esperados da aplicação.
- Os comentários do código destacam decisões importantes para discussão em aula.

### Debug rápido para toda a ficha

1. Estás na pasta certa? (`pwd`)
2. O projeto foi criado sem erros?
3. O servidor está a correr? (`npm run dev`)
4. A consola do browser mostra erros?
5. Os imports têm caminhos corretos?

### Pontos de paragem

- **Paragem A**: app mínima com título e texto.
- **Paragem B**: botão de tema funciona.
- **Paragem C**: formulário mostra saudação com o último nome.
- **Paragem D**: cada nome entra na lista.
- **Paragem E**: app separada em componentes (`FormularioNome`, `ListaNomes`).

### 0.1) Mapa de fases

- Fase 1 - Setup e app mínima: `src/App.jsx`
- Fase 2 - Tema com `useState`: `src/App.jsx`
- Fase 3 - Formulário controlado + saudação: `src/App.jsx`
- Fase 4 - Lista incremental de nomes: `src/App.jsx`
- Fase 5 - Separação por componentes: `src/App.jsx`, `src/components/FormularioNome.jsx`, `src/components/ListaNomes.jsx`

---

## 1) Pré-requisitos

- Node.js 18+
- npm
- VS Code (ou outro editor)

Verifica versões:

```bash
node -v
npm -v
```

Se algum comando falhar, instala primeiro o Node.js e repete.

---

## 2) Criar o projeto com Vite

1. Criar projeto:

```bash
npm create vite@latest ficha01 -- --template react
```

2. Entrar na pasta:

```bash
cd ficha01
```

3. Instalar dependências:

```bash
npm install
```

4. Arrancar servidor:

```bash
npm run dev
```

5. Abrir no editor (opcional):

```bash
code .
```

---

## 3) Limpeza inicial

Se quiseres começar limpo:

- apagar `src/App.css`;
- remover `import "./App.css"` do `src/App.jsx`.

No fim, garante que tens pelo menos:

```text
src/
  App.jsx
  main.jsx
```

Porque fazemos isto? Para reduzir distrações e focar apenas no que está a ser ensinado.

---

## 4) Fase 1 - App mínima (Paragem A)

Objetivo da fase:

- perceber a estrutura mínima de um componente React;
- confirmar que o projeto está funcional.

Substitui o conteúdo de `src/App.jsx` por:

```jsx
/**
 * Componente principal mínimo da app.
 * Nesta fase, o objetivo é apenas confirmar renderização.
 * @returns {JSX.Element}
 */
function App() {
    return (
        // Container principal com estilo inline simples.
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            {/* Título principal da aplicação. */}
            <h1>Lista de Boas-vindas</h1>

            {/* Pequena descrição para contextualizar o ecrã. */}
            <p>Primeira app React da turma.</p>
        </main>
    );
}

// Export default para o Vite/React conseguir montar este componente.
export default App;
```

Leitura guiada:

1. `function App()` define o componente.
2. `return (...)` devolve JSX (estrutura visual).
3. `export default App` permite importar este componente no `main.jsx`.

**Checkpoint A**

- Vês título e texto na página.
- Não há erros na consola.

---

## 5) Fase 2 - Tema claro/escuro (Paragem B)

Objetivo da fase:

- introduzir estado com `useState`;
- usar evento `onClick` para alterar UI.

Conceito-chave:

- `useState(false)` cria uma variável de estado e uma função para a atualizar.
- Sempre que o estado muda, o componente re-renderiza.

`src/App.jsx`:

```jsx
import { useState } from "react";

/**
 * Componente principal com alternância de tema.
 * @returns {JSX.Element}
 */
function App() {
    // Estado booleano: false = tema claro, true = tema escuro.
    const [temaEscuro, setTemaEscuro] = useState(false);

    // Objeto de estilos derivado do estado atual.
    const estilos = {
        // Faz o conteúdo ocupar toda a altura do ecrã.
        minHeight: "100vh",
        // Espaçamento interno global.
        padding: "24px",
        // Fonte base para legibilidade.
        fontFamily: "Arial, sans-serif",
        // Cor de fundo varia com o estado.
        backgroundColor: temaEscuro ? "#1f2937" : "#f3f4f6",
        // Cor do texto também varia com o estado.
        // A instrução segiuinte é equivalente a:
        // if (temaEscuro) {
        //     color = "#f9fafb";
        // } else {
        //     color = "#111827";
        // }
        color: temaEscuro ? "#f9fafb" : "#111827",
    };

    return (
        // Aplicamos o objeto de estilos calculado acima.
        <main style={estilos}>
            {/* Conteúdo principal mantém-se. */}
            <h1>Lista de Boas-vindas</h1>
            <p>Primeira app React da turma.</p>

            {/*
              Ao clicar, invertemos o estado atual.
              Se estava em false passa a true, e vice-versa.
            */}
            <button onClick={() => setTemaEscuro(!temaEscuro)}>
                Mudar tema
            </button>
        </main>
    );
}

export default App;
```

Leitura guiada:

1. `temaEscuro` decide as cores.
2. `setTemaEscuro` altera o estado.
3. O botão chama `setTemaEscuro(!temaEscuro)` para alternar.

**Checkpoint B**

- O botão altera fundo e cor de texto.
- O estado mantém-se coerente a cada clique.

---

## 6) Fase 3 - Formulário controlado e saudação (Paragem C)

Objetivo da fase:

- criar input controlado;
- tratar submissão de formulário;
- mostrar saudação condicional.

Conceitos-chave:

- `event.preventDefault()` evita recarregar a página no submit.
- `trim()` remove espaços no início/fim.
- `ultimoNome && <p>...</p>` só renderiza se houver valor.

`src/App.jsx`:

```jsx
import { useState } from "react";

/**
 * App com tema e formulário controlado.
 * @returns {JSX.Element}
 */
function App() {
    // Estado do tema.
    const [temaEscuro, setTemaEscuro] = useState(false);
    // Estado do texto atual no input.
    const [nome, setNome] = useState("");
    // Estado do último nome submetido (para saudação).
    const [ultimoNome, setUltimoNome] = useState("");

    // Estilos calculados com base no tema.
    const estilos = {
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: temaEscuro ? "#1f2937" : "#f3f4f6",
        color: temaEscuro ? "#f9fafb" : "#111827",
    };

    /**
     * Trata submissão do formulário de nome.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        // Impede comportamento nativo do browser (refresh da página).
        event.preventDefault();

        // Limpa espaços para evitar entradas como "   ".
        const nomeLimpo = nome.trim();

        // Se não houver conteúdo válido, termina cedo.
        if (!nomeLimpo) return;

        // Guarda o último nome válido para a saudação.
        setUltimoNome(nomeLimpo);

        // Limpa o input após submissão.
        setNome("");
    };

    return (
        <main style={estilos}>
            <h1>Lista de Boas-vindas</h1>
            <p>Primeira app React da turma.</p>

            {/* Botão de alternância do tema. */}
            <button onClick={() => setTemaEscuro(!temaEscuro)}>
                Mudar tema
            </button>

            {/*
              Formulário controlado:
              - o valor vem de "nome"
              - cada alteração atualiza "setNome"
              - o event no onChange é usado para capturar o texto escrito pelo utilizador. É um objeto que representa o evento de mudança, e "event.target.value" é o texto atual do input.
            */}
            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Escreve um nome"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                />
                <button type="submit">Adicionar</button>
            </form>

            {/* Renderização condicional da saudação. */}
            {ultimoNome && <p>Olá, {ultimoNome}!</p>}
        </main>
    );
}

export default App;
```

Leitura guiada:

1. O input está sempre sincronizado com `nome`.
2. No submit, validamos com `trim()`.
3. O texto de saudação depende de `ultimoNome`.

**Checkpoint C**

- Se submeteres vazio, nada acontece.
- Se submeteres um nome, aparece `Olá, nome!`.
- O input limpa após submit.

---

## 7) Fase 4 - Guardar nomes numa lista (Paragem D)

Objetivo da fase:

- acumular dados em lista;
- renderizar lista com `.map()`.

Conceito-chave:

- Estado com arrays deve ser atualizado de forma imutável.
- Por isso usamos `setNomes((anteriores) => [...anteriores, novo])`.

`src/App.jsx`:

```jsx
import { useState } from "react";

/**
 * App com tema, formulário e lista de nomes.
 * @returns {JSX.Element}
 */
function App() {
    // Estado do tema.
    const [temaEscuro, setTemaEscuro] = useState(false);
    // Estado do input.
    const [nome, setNome] = useState("");
    // Estado da saudação (último nome submetido).
    const [ultimoNome, setUltimoNome] = useState("");
    // Estado da lista acumulada de nomes.
    const [nomes, setNomes] = useState([]);

    const estilos = {
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: temaEscuro ? "#1f2937" : "#f3f4f6",
        color: temaEscuro ? "#f9fafb" : "#111827",
    };

    /**
     * Submete o nome e atualiza saudação + lista.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        // Normaliza o texto.
        const nomeLimpo = nome.trim();
        if (!nomeLimpo) return;

        // Atualiza saudação com o último valor submetido.
        setUltimoNome(nomeLimpo);

        // Atualiza lista de forma segura (imutável).
        setNomes((nomesAnteriores) => [...nomesAnteriores, nomeLimpo]);

        // Limpa o input para nova entrada.
        setNome("");
    };

    return (
        <main style={estilos}>
            <h1>Lista de Boas-vindas</h1>
            <p>Primeira app React da turma.</p>

            <button onClick={() => setTemaEscuro(!temaEscuro)}>
                Mudar tema
            </button>

            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Escreve um nome"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                />
                <button type="submit">Adicionar</button>
            </form>

            {/* Mostra saudação apenas quando existir último nome. */}
            {ultimoNome && <p>Olá, {ultimoNome}!</p>}

            {/* Secção da lista acumulada. */}
            <h2>Lista de nomes</h2>
            <ul>
                {/*
                  Renderiza cada nome.
                  A key combina texto + índice para estabilidade básica nesta ficha.
                */}
                {nomes.map((nomeAtual, index) => (
                    <li key={`${nomeAtual}-${index}`}>{nomeAtual}</li>
                ))}
            </ul>
        </main>
    );
}

export default App;
```

Leitura guiada:

1. `nomes` começa vazio.
2. Cada submit válido faz append no array.
3. `.map()` transforma cada item em `<li>`.

**Checkpoint D**

- A saudação mostra sempre o último nome submetido.
- A lista acumula todos os nomes submetidos.
- O render da lista usa `.map()`.

---

## 8) Fase 5 - Separar em componentes (Paragem E)

Objetivo da fase:

- organizar melhor o código;
- separar UI por responsabilidades;
- praticar `props`.

Estratégia:

- `FormularioNome` trata input + submit.
- `ListaNomes` só apresenta a lista.
- `App` mantém estado global e coordena tudo.

### 8.1) Criar `src/components/ListaNomes.jsx`

```jsx
/**
 * Lista visual de nomes submetidos.
 * @param {{ nomes: string[] }} props - Props do componente.
 * @returns {JSX.Element}
 */
function ListaNomes({ nomes }) {
    return (
        <>
            {/* Cabeçalho da secção da lista. */}
            <h2>Lista de nomes</h2>

            {/* Lista não ordenada com todos os nomes recebidos por props. */}
            <ul>
                {nomes.map((nomeAtual, index) => (
                    // A key identifica cada item no processo de reconciliação.
                    <li key={`${nomeAtual}-${index}`}>{nomeAtual}</li>
                ))}
            </ul>
        </>
    );
}

export default ListaNomes;
```

### 8.2) Criar `src/components/FormularioNome.jsx`

```jsx
import { useState } from "react";

/**
 * Formulário para adicionar nomes.
 * Mantém estado local do input e notifica o componente pai quando há submit válido.
 * @param {{ onAdicionarNome: (nome: string) => void }} props - Props do componente.
 * @returns {JSX.Element}
 */
function FormularioNome({ onAdicionarNome }) {
    // Estado local do texto do input.
    const [nome, setNome] = useState("");

    /**
     * Processa submissão do formulário.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        // Evita refresh da página.
        event.preventDefault();

        // Normaliza entrada.
        const nomeLimpo = nome.trim();
        if (!nomeLimpo) return;

        // Envia nome válido para o pai.
        onAdicionarNome(nomeLimpo);

        // Limpa input local.
        setNome("");
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
            <input
                type="text"
                placeholder="Escreve um nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
            />
            <button type="submit">Adicionar</button>
        </form>
    );
}

export default FormularioNome;
```

### 8.3) Atualizar `src/App.jsx`

```jsx
import { useState } from "react";
import FormularioNome from "./components/FormularioNome";
import ListaNomes from "./components/ListaNomes";

/**
 * Componente pai da app.
 * Guarda estado global e distribui comportamento por props.
 * @returns {JSX.Element}
 */
function App() {
    // Tema global.
    const [temaEscuro, setTemaEscuro] = useState(false);
    // Último nome submetido, usado na saudação.
    const [ultimoNome, setUltimoNome] = useState("");
    // Lista global de nomes.
    const [nomes, setNomes] = useState([]);

    // Estilos calculados dinamicamente por tema.
    const estilos = {
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: temaEscuro ? "#1f2937" : "#f3f4f6",
        color: temaEscuro ? "#f9fafb" : "#111827",
    };

    /**
     * Recebe um nome válido vindo do FormularioNome.
     * @param {string} nomeNovo - Nome a adicionar.
     */
    const adicionarNome = (nomeNovo) => {
        // Atualiza saudação com o nome mais recente.
        setUltimoNome(nomeNovo);

        // Acrescenta nome à lista mantendo imutabilidade.
        setNomes((nomesAnteriores) => [...nomesAnteriores, nomeNovo]);
    };

    return (
        <main style={estilos}>
            <h1>Lista de Boas-vindas</h1>
            <p>Primeira app React da turma.</p>

            {/* Controlo de tema continua no pai. */}
            <button onClick={() => setTemaEscuro(!temaEscuro)}>
                Mudar tema
            </button>

            {/* Filho recebe callback para comunicar submit válido ao pai. */}
            <FormularioNome onAdicionarNome={adicionarNome} />

            {/* Saudação é responsabilidade do pai porque usa estado global. */}
            {ultimoNome && <p>Olá, {ultimoNome}!</p>}

            {/* Filho recebe apenas dados para renderizar lista. */}
            <ListaNomes nomes={nomes} />
        </main>
    );
}

export default App;
```

Leitura guiada desta fase:

1. O estado principal fica no `App`.
2. O formulário só recolhe dados e chama `onAdicionarNome`.
3. A lista só recebe `nomes` e renderiza.
4. Esta separação facilita manutenção e reutilização.

**Checkpoint E**

- Comportamento final mantém-se igual ao da fase anterior.
- O `App` fica mais simples e legível.
- A lista e o formulário ficam reutilizáveis.

---

## 9) Erros comuns e correções

1. `Cannot find module ...`

- Confirma se criaste `src/components/ListaNomes.jsx` e `src/components/FormularioNome.jsx`.
- Revê maiúsculas/minúsculas nos nomes dos ficheiros e imports.

2. O botão não muda o tema

- Confirma o `onClick={() => setTemaEscuro(!temaEscuro)}`.
- Confirma que `temaEscuro` está a ser usado no objeto `estilos`.

3. Submeter não faz nada

- Verifica se o botão tem `type="submit"`.
- Verifica se o `<form>` tem `onSubmit={handleSubmit}`.
- Verifica se o `trim()` não está a bloquear por input vazio.

4. Lista não atualiza

- Confirma se estás a usar:

```jsx
setNomes((nomesAnteriores) => [...nomesAnteriores, nomeLimpo]);
```

- Não uses `nomes.push(...)` diretamente, porque isso muta o array.

5. Saudação não aparece

- Verifica se `setUltimoNome(...)` está dentro do submit válido.
- Verifica se existe `{ultimoNome && <p>...</p>}` no JSX.

---

## 10) Desafios finais

1. Não permitir nomes repetidos.
2. Adicionar botão para remover cada nome.
3. Mostrar contador total de nomes.
4. Ordenar lista alfabeticamente.
5. Guardar lista no `localStorage`.
6. Mostrar mensagem quando a lista estiver vazia.

---

## 11) Checklist de validação

Antes de terminares, confirma:

- [ ] projeto criado com Vite e a correr;
- [ ] tema claro/escuro funcional;
- [ ] formulário controlado funcional;
- [ ] saudação ao último nome submetido;
- [ ] lista de nomes acumulada e visível;
- [ ] app separada em componentes;
- [ ] consegues explicar, com as tuas palavras, o papel de `useState`, `props` e `.map()`.

![Footer](../../Images/Footer.png)
