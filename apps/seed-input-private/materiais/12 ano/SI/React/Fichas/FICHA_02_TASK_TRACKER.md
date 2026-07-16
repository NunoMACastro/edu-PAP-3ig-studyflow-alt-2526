![Header](../../Images/Header.png)

# Tutorial passo a passo - Task Tracker da Turma (Ficha React 12.º ano)

Esta ficha apresenta uma app React de tarefas com progressão **realmente incremental**.

Objetivo desta versão da ficha:

1. Reduzir os saltos entre fases.
2. Introduzir uma ideia nova de cada vez.
3. Garantir que cada checkpoint é curto e validável.

Competências trabalhadas:

1. Setup e estrutura base.
2. JSX e componentes.
3. Estado com `useState`.
4. Eventos e formulários controlados.
5. Listas e renderização condicional.
6. Estado derivado (filtros e contadores).
7. Persistência com `useEffect` + `localStorage`.
8. Componentização por responsabilidade.

---

## 0) O que vais construir

Uma app chamada **Task Tracker da Turma** onde podes:

- criar tarefas;
- marcar tarefas como concluídas;
- remover tarefas;
- filtrar tarefas (`Todas`, `Ativas`, `Concluídas`);
- ver contadores;
- guardar dados no browser com `localStorage`.

### Vocabulário rápido

- **Tarefa ativa**: ainda não concluída.
- **Tarefa concluída**: já terminada.
- **Persistência**: dados mantêm-se após recarregar a página.
- **Componente pai**: mantém estado principal.
- **Componente filho**: recebe dados e funções por props.
- **Estado derivado**: valor calculado a partir de outro estado.

### Organização da ficha

- A progressão está dividida em fases curtas e validáveis.
- Cada fase introduz uma ideia nova ou evolui uma decisão anterior.
- Os checkpoints assinalam o estado esperado da aplicação em momentos-chave.
- Os comentários do código explicam o motivo das principais decisões.

### Debug rápido para toda a ficha

1. Estás na pasta certa? (`pwd`)
2. O servidor está a correr? (`npm run dev`)
3. Há erros no terminal ou consola do browser?
4. Guardaste o ficheiro antes de testar?
5. Os imports estão corretos?

### Pontos de paragem (agora mais graduais)

- **Paragem A**: layout base.
- **Paragem B1**: input controlado.
- **Paragem B2**: submit adiciona itens simples.
- **Paragem C1**: tarefas como objetos.
- **Paragem C2**: concluir/reabrir.
- **Paragem C3**: remover tarefa.
- **Paragem D1**: filtros.
- **Paragem D2**: contadores e estado vazio.
- **Paragem E**: persistência no `localStorage`.
- **Paragem F**: componentização.

---

## 1) Pré-requisitos

- Node.js 18+
- npm
- VS Code (ou editor equivalente)

Verifica versões:

```bash
node -v
npm -v
```

---

## 2) Criar o projeto

```bash
npm create vite@latest ficha02-task-tracker -- --template react
cd ficha02-task-tracker
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
- remover `import "./App.css"` do `src/App.jsx`.

No mínimo, mantém:

```text
src/
  App.jsx
  main.jsx
```

---

## 4) Fase 1 - Layout base (Paragem A)

Ideia nova desta fase:

- apenas renderização estática.

`src/App.jsx`

```jsx
/**
 * Componente mínimo da app.
 * Nesta fase só validamos renderização base.
 * @returns {JSX.Element}
 */
function App() {
    return (
        // Container principal com espaçamento simples.
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            {/* Título da app. */}
            <h1>Task Tracker da Turma</h1>

            {/* Descrição curta. */}
            <p>Organiza as tuas tarefas de estudo.</p>
        </main>
    );
}

export default App;
```

**Checkpoint A**

- Vês título e descrição.
- Sem erros na consola.

---

## 5) Fase 2 - Input controlado (Paragem B1)

Ideia nova desta fase:

- ligar input ao estado React.

Ainda **não** vamos adicionar tarefas à lista.

`src/App.jsx`

```jsx
import { useState } from "react";

/**
 * App com input controlado.
 * @returns {JSX.Element}
 */
function App() {
    // Estado do conteúdo atual do input.
    const [texto, setTexto] = useState("");

    return (
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            <h1>Task Tracker da Turma</h1>
            <p>Organiza as tuas tarefas de estudo.</p>

            {/*
              Formulário sem lógica de submit (ainda).
              Nesta fase só treinamos o conceito de input controlado.
            */}
            <form style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Nova tarefa"
                    // O valor mostrado no input vem do estado.
                    value={texto}
                    // Cada tecla atualiza o estado.
                    onChange={(event) => setTexto(event.target.value)}
                />
            </form>

            {/* Pré-visualização para confirmar sincronização input <-> estado. */}
            <p style={{ marginTop: "12px" }}>
                A escrever: {texto || "(vazio)"}
            </p>
        </main>
    );
}

export default App;
```

**Checkpoint B1**

- O que escreves no input aparece em `A escrever: ...`.
- Se apagares tudo, mostra `(vazio)`.

---

## 6) Fase 3 - Submit e lista simples (Paragem B2)

Ideia nova desta fase:

- no submit, guardar texto numa lista.

Para reduzir complexidade, a lista ainda é de `string[]` (não objetos).

`src/App.jsx`

```jsx
import { useState } from "react";

/**
 * App com input controlado e lista simples de textos.
 * @returns {JSX.Element}
 */
function App() {
    // Texto atual do input.
    const [texto, setTexto] = useState("");
    // Lista simples de tarefas (strings).
    const [tarefas, setTarefas] = useState([]);

    /**
     * Submete o formulário e adiciona texto à lista.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        // Evita refresh da página.
        event.preventDefault();

        // Remove espaços laterais.
        const textoLimpo = texto.trim();

        // Bloqueia submit vazio.
        if (!textoLimpo) return;

        // Adiciona item ao fim da lista (imutável).
        setTarefas((anteriores) => [...anteriores, textoLimpo]);

        // Limpa o input para próxima tarefa.
        setTexto("");
    };

    return (
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            <h1>Task Tracker da Turma</h1>
            <p>Organiza as tuas tarefas de estudo.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Nova tarefa"
                    value={texto}
                    onChange={(event) => setTexto(event.target.value)}
                />
                <button type="submit">Adicionar</button>
            </form>

            <ul style={{ marginTop: "16px" }}>
                {/*
                  Ainda usamos índice na key porque a lista é só de strings.
                  Vamos melhorar isto na próxima fase com ID.
                */}
                {tarefas.map((tarefa, index) => (
                    <li key={`${tarefa}-${index}`}>{tarefa}</li>
                ))}
            </ul>
        </main>
    );
}

export default App;
```

**Checkpoint B2**

- Submit válido adiciona item à lista.
- Submit vazio não adiciona.
- Input limpa após submit.

---

## 7) Fase 4 - Evoluir estrutura para objetos (Paragem C1)

Ideia nova desta fase:

- cada tarefa deixa de ser string e passa a objeto.

Porquê esta mudança?

- sem objeto, não consegues guardar `concluida`, `prioridade`, `data`, etc.

Nova estrutura de tarefa:

```js
{
  id: "...",
  texto: "...",
  concluida: false
}
```

`src/App.jsx`

```jsx
import { useState } from "react";

/**
 * App com tarefas como objetos.
 * @returns {JSX.Element}
 */
function App() {
    const [texto, setTexto] = useState("");
    const [tarefas, setTarefas] = useState([]);

    /**
     * Cria tarefa-objeto no submit.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        const textoLimpo = texto.trim();
        if (!textoLimpo) return;

        // Agora criamos objeto completo para cada tarefa.
        const novaTarefa = {
            // ID único e estável.
            id: crypto.randomUUID(),
            // Texto validado do input.
            texto: textoLimpo,
            // Prepara campo para funcionalidade de conclusão.
            concluida: false,
        };

        setTarefas((anteriores) => [...anteriores, novaTarefa]);
        setTexto("");
    };

    return (
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            <h1>Task Tracker da Turma</h1>
            <p>Organiza as tuas tarefas de estudo.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Nova tarefa"
                    value={texto}
                    onChange={(event) => setTexto(event.target.value)}
                />
                <button type="submit">Adicionar</button>
            </form>

            <ul style={{ marginTop: "16px" }}>
                {tarefas.map((tarefa) => (
                    // A key agora usa id (melhor que índice).
                    <li key={tarefa.id}>{tarefa.texto}</li>
                ))}
            </ul>
        </main>
    );
}

export default App;
```

**Checkpoint C1**

- App continua a adicionar tarefas.
- Não há mudança visual grande.
- Internamente a estrutura ficou preparada para próximas fases.

---

## 8) Fase 5 - Concluir/Reabrir (Paragem C2)

Ideia nova desta fase:

- alternar `concluida` em cada tarefa.

`src/App.jsx`

```jsx
import { useState } from "react";

/**
 * App com ação de concluir/reabrir.
 * @returns {JSX.Element}
 */
function App() {
    const [texto, setTexto] = useState("");
    const [tarefas, setTarefas] = useState([]);

    /**
     * Adiciona nova tarefa.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        const textoLimpo = texto.trim();
        if (!textoLimpo) return;

        const novaTarefa = {
            id: crypto.randomUUID(),
            texto: textoLimpo,
            concluida: false,
        };

        setTarefas((anteriores) => [...anteriores, novaTarefa]);
        setTexto("");
    };

    /**
     * Alterna tarefa entre concluída e ativa.
     * @param {string} id - ID da tarefa alvo.
     */
    const alternarConcluida = (id) => {
        setTarefas((anteriores) =>
            anteriores.map((tarefa) =>
                tarefa.id === id
                    ? { ...tarefa, concluida: !tarefa.concluida }
                    : tarefa,
            ),
        );
    };

    return (
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            <h1>Task Tracker da Turma</h1>
            <p>Organiza as tuas tarefas de estudo.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Nova tarefa"
                    value={texto}
                    onChange={(event) => setTexto(event.target.value)}
                />
                <button type="submit">Adicionar</button>
            </form>

            <ul style={{ marginTop: "16px" }}>
                {tarefas.map((tarefa) => (
                    <li key={tarefa.id} style={{ marginBottom: "8px" }}>
                        <span
                            style={{
                                // Se concluída, mostra risco no texto.
                                textDecoration: tarefa.concluida
                                    ? "line-through"
                                    : "none",
                                marginRight: "12px",
                            }}
                        >
                            {tarefa.texto}
                        </span>

                        <button onClick={() => alternarConcluida(tarefa.id)}>
                            {tarefa.concluida ? "Reabrir" : "Concluir"}
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}

export default App;
```

**Checkpoint C2**

- Consegues concluir e reabrir tarefas.
- O texto riscado acompanha o estado.

---

## 9) Fase 6 - Remover tarefa (Paragem C3)

Ideia nova desta fase:

- remover item da lista com `filter`.

`src/App.jsx`

```jsx
import { useState } from "react";

/**
 * App com criar, concluir/reabrir e remover.
 * @returns {JSX.Element}
 */
function App() {
    const [texto, setTexto] = useState("");
    const [tarefas, setTarefas] = useState([]);

    /**
     * Adiciona nova tarefa.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        const textoLimpo = texto.trim();
        if (!textoLimpo) return;

        const novaTarefa = {
            id: crypto.randomUUID(),
            texto: textoLimpo,
            concluida: false,
        };

        setTarefas((anteriores) => [...anteriores, novaTarefa]);
        setTexto("");
    };

    /**
     * Alterna estado concluída.
     * @param {string} id - ID da tarefa alvo.
     */
    const alternarConcluida = (id) => {
        setTarefas((anteriores) =>
            anteriores.map((tarefa) =>
                tarefa.id === id
                    ? { ...tarefa, concluida: !tarefa.concluida }
                    : tarefa,
            ),
        );
    };

    /**
     * Remove tarefa pelo ID.
     * @param {string} id - ID da tarefa a remover.
     */
    const removerTarefa = (id) => {
        setTarefas((anteriores) =>
            anteriores.filter((tarefa) => tarefa.id !== id),
        );
    };

    return (
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            <h1>Task Tracker da Turma</h1>
            <p>Organiza as tuas tarefas de estudo.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Nova tarefa"
                    value={texto}
                    onChange={(event) => setTexto(event.target.value)}
                />
                <button type="submit">Adicionar</button>
            </form>

            <ul style={{ marginTop: "16px" }}>
                {tarefas.map((tarefa) => (
                    <li key={tarefa.id} style={{ marginBottom: "8px" }}>
                        <span
                            style={{
                                textDecoration: tarefa.concluida
                                    ? "line-through"
                                    : "none",
                                marginRight: "12px",
                            }}
                        >
                            {tarefa.texto}
                        </span>

                        <button onClick={() => alternarConcluida(tarefa.id)}>
                            {tarefa.concluida ? "Reabrir" : "Concluir"}
                        </button>

                        <button
                            onClick={() => removerTarefa(tarefa.id)}
                            style={{ marginLeft: "8px" }}
                        >
                            Remover
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}

export default App;
```

**Checkpoint C3**

- Botão `Remover` elimina só o item correto.
- As restantes funcionalidades continuam estáveis.

---

## 10) Fase 7 - Filtros (Paragem D1)

Ideia nova desta fase:

- mostrar subconjuntos da lista (`todas`, `ativas`, `concluidas`).

Ainda **sem contadores** (vamos separar isso na fase seguinte).

`src/App.jsx`

```jsx
import { useState } from "react";

/**
 * App com filtros de visualização.
 * @returns {JSX.Element}
 */
function App() {
    const [texto, setTexto] = useState("");
    const [tarefas, setTarefas] = useState([]);
    // Estado específico para o filtro ativo na UI.
    const [filtro, setFiltro] = useState("todas");

    /**
     * Adiciona nova tarefa.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        const textoLimpo = texto.trim();
        if (!textoLimpo) return;

        const novaTarefa = {
            id: crypto.randomUUID(),
            texto: textoLimpo,
            concluida: false,
        };

        setTarefas((anteriores) => [...anteriores, novaTarefa]);
        setTexto("");
    };

    /**
     * Alterna estado concluída.
     * @param {string} id - ID da tarefa alvo.
     */
    const alternarConcluida = (id) => {
        setTarefas((anteriores) =>
            anteriores.map((tarefa) =>
                tarefa.id === id
                    ? { ...tarefa, concluida: !tarefa.concluida }
                    : tarefa,
            ),
        );
    };

    /**
     * Remove tarefa pelo ID.
     * @param {string} id - ID da tarefa a remover.
     */
    const removerTarefa = (id) => {
        setTarefas((anteriores) =>
            anteriores.filter((tarefa) => tarefa.id !== id),
        );
    };

    // Lista derivada conforme filtro selecionado.
    const tarefasFiltradas = tarefas.filter((tarefa) => {
        if (filtro === "ativas") return !tarefa.concluida;
        if (filtro === "concluidas") return tarefa.concluida;
        return true; // "todas"
    });

    return (
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            <h1>Task Tracker da Turma</h1>
            <p>Organiza as tuas tarefas de estudo.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Nova tarefa"
                    value={texto}
                    onChange={(event) => setTexto(event.target.value)}
                />
                <button type="submit">Adicionar</button>
            </form>

            {/* Botões para escolher o filtro da lista. */}
            <div style={{ marginTop: "16px" }}>
                <button onClick={() => setFiltro("todas")}>Todas</button>
                <button
                    onClick={() => setFiltro("ativas")}
                    style={{ marginLeft: "8px" }}
                >
                    Ativas
                </button>
                <button
                    onClick={() => setFiltro("concluidas")}
                    style={{ marginLeft: "8px" }}
                >
                    Concluídas
                </button>
            </div>

            <ul style={{ marginTop: "16px" }}>
                {tarefasFiltradas.map((tarefa) => (
                    <li key={tarefa.id} style={{ marginBottom: "8px" }}>
                        <span
                            style={{
                                textDecoration: tarefa.concluida
                                    ? "line-through"
                                    : "none",
                                marginRight: "12px",
                            }}
                        >
                            {tarefa.texto}
                        </span>

                        <button onClick={() => alternarConcluida(tarefa.id)}>
                            {tarefa.concluida ? "Reabrir" : "Concluir"}
                        </button>

                        <button
                            onClick={() => removerTarefa(tarefa.id)}
                            style={{ marginLeft: "8px" }}
                        >
                            Remover
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}

export default App;
```

**Checkpoint D1**

- Botões de filtro alteram o que é mostrado.
- `Todas` mostra tudo, `Ativas` só pendentes, `Concluídas` só finalizadas.

---

## 11) Fase 8 - Contadores e estado vazio (Paragem D2)

Ideias novas desta fase:

- mostrar contadores derivados;
- mostrar mensagem quando o filtro não tem resultados.

`src/App.jsx`

```jsx
import { useState } from "react";

/**
 * App com filtros, contadores e estado vazio.
 * @returns {JSX.Element}
 */
function App() {
    const [texto, setTexto] = useState("");
    const [tarefas, setTarefas] = useState([]);
    const [filtro, setFiltro] = useState("todas");

    /**
     * Adiciona nova tarefa.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        const textoLimpo = texto.trim();
        if (!textoLimpo) return;

        const novaTarefa = {
            id: crypto.randomUUID(),
            texto: textoLimpo,
            concluida: false,
        };

        setTarefas((anteriores) => [...anteriores, novaTarefa]);
        setTexto("");
    };

    /**
     * Alterna estado concluída.
     * @param {string} id - ID da tarefa alvo.
     */
    const alternarConcluida = (id) => {
        setTarefas((anteriores) =>
            anteriores.map((tarefa) =>
                tarefa.id === id
                    ? { ...tarefa, concluida: !tarefa.concluida }
                    : tarefa,
            ),
        );
    };

    /**
     * Remove tarefa pelo ID.
     * @param {string} id - ID da tarefa a remover.
     */
    const removerTarefa = (id) => {
        setTarefas((anteriores) =>
            anteriores.filter((tarefa) => tarefa.id !== id),
        );
    };

    // Estado derivado para renderização filtrada.
    const tarefasFiltradas = tarefas.filter((tarefa) => {
        if (filtro === "ativas") return !tarefa.concluida;
        if (filtro === "concluidas") return tarefa.concluida;
        return true;
    });

    // Contadores derivados.
    const total = tarefas.length;
    const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
    const ativas = total - concluidas;

    return (
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            <h1>Task Tracker da Turma</h1>
            <p>Organiza as tuas tarefas de estudo.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <input
                    type="text"
                    placeholder="Nova tarefa"
                    value={texto}
                    onChange={(event) => setTexto(event.target.value)}
                />
                <button type="submit">Adicionar</button>
            </form>

            <div style={{ marginTop: "16px" }}>
                <button onClick={() => setFiltro("todas")}>Todas</button>
                <button
                    onClick={() => setFiltro("ativas")}
                    style={{ marginLeft: "8px" }}
                >
                    Ativas
                </button>
                <button
                    onClick={() => setFiltro("concluidas")}
                    style={{ marginLeft: "8px" }}
                >
                    Concluídas
                </button>
            </div>

            {/* Linha de resumo da lista. */}
            <p style={{ marginTop: "12px" }}>
                Total: {total} | Ativas: {ativas} | Concluídas: {concluidas}
            </p>

            {/* Renderização condicional para caso sem resultados no filtro atual. */}
            {tarefasFiltradas.length === 0 ? (
                <p>Sem tarefas para este filtro.</p>
            ) : (
                <ul>
                    {tarefasFiltradas.map((tarefa) => (
                        <li key={tarefa.id} style={{ marginBottom: "8px" }}>
                            <span
                                style={{
                                    textDecoration: tarefa.concluida
                                        ? "line-through"
                                        : "none",
                                    marginRight: "12px",
                                }}
                            >
                                {tarefa.texto}
                            </span>

                            <button
                                onClick={() => alternarConcluida(tarefa.id)}
                            >
                                {tarefa.concluida ? "Reabrir" : "Concluir"}
                            </button>

                            <button
                                onClick={() => removerTarefa(tarefa.id)}
                                style={{ marginLeft: "8px" }}
                            >
                                Remover
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default App;
```

**Checkpoint D2**

- Contadores atualizam em tempo real.
- Se filtro não tiver itens, aparece mensagem apropriada.

---

## 12) Fase 9 - Persistência com localStorage (Paragem E)

Ideia nova desta fase:

- guardar e recuperar tarefas do browser.

### 12.1) Atualizar import

No topo de `src/App.jsx`:

```jsx
import { useEffect, useState } from "react";
```

### 12.2) Ler do localStorage no estado inicial

Substitui o estado `tarefas` por:

```jsx
// Lê tarefas guardadas apenas na inicialização do componente.
const [tarefas, setTarefas] = useState(() => {
    const guardadas = localStorage.getItem("tarefas_turma");
    return guardadas ? JSON.parse(guardadas) : [];
});
```

### 12.3) Gravar no localStorage sempre que tarefas mudar

Adiciona este efeito abaixo dos estados:

```jsx
// Sempre que a lista muda, persistimos a versão atual.
useEffect(() => {
    localStorage.setItem("tarefas_turma", JSON.stringify(tarefas));
}, [tarefas]);
```

Explicação rápida:

1. `localStorage` guarda apenas texto.
2. `JSON.stringify(...)` converte array para string.
3. `JSON.parse(...)` converte string para array novamente.

**Checkpoint E**

- Cria tarefas.
- Faz refresh da página.
- Os dados permanecem.

---

## 13) Fase 10 - Separar em componentes (Paragem F)

Ideia nova desta fase:

- dividir o `App` em componentes menores.

Cria pasta e ficheiros:

```text
src/components/
  TaskForm.jsx
  TaskFilters.jsx
  TaskList.jsx
  TaskItem.jsx
```

### 13.1) `src/components/TaskForm.jsx`

```jsx
import { useState } from "react";

/**
 * Formulário de criação de tarefa.
 * @param {{ onAddTask: (texto: string) => void }} props - Props do componente.
 * @returns {JSX.Element}
 */
function TaskForm({ onAddTask }) {
    // Estado local do input.
    const [texto, setTexto] = useState("");

    /**
     * Trata submit do formulário.
     * @param {React.FormEvent<HTMLFormElement>} event - Evento submit.
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        const textoLimpo = texto.trim();
        if (!textoLimpo) return;

        // Notifica o pai com o texto validado.
        onAddTask(textoLimpo);

        // Limpa input local.
        setTexto("");
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
            <input
                type="text"
                placeholder="Nova tarefa"
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
            />
            <button type="submit">Adicionar</button>
        </form>
    );
}

export default TaskForm;
```

### 13.2) `src/components/TaskFilters.jsx`

```jsx
/**
 * Grupo de botões de filtro.
 * @param {{
 *  filtro: "todas" | "ativas" | "concluidas",
 *  onChangeFiltro: (novoFiltro: "todas" | "ativas" | "concluidas") => void
 * }} props - Props do componente.
 * @returns {JSX.Element}
 */
function TaskFilters({ filtro, onChangeFiltro }) {
    return (
        <div style={{ marginTop: "16px" }}>
            <button
                onClick={() => onChangeFiltro("todas")}
                disabled={filtro === "todas"}
            >
                Todas
            </button>

            <button
                onClick={() => onChangeFiltro("ativas")}
                disabled={filtro === "ativas"}
                style={{ marginLeft: "8px" }}
            >
                Ativas
            </button>

            <button
                onClick={() => onChangeFiltro("concluidas")}
                disabled={filtro === "concluidas"}
                style={{ marginLeft: "8px" }}
            >
                Concluídas
            </button>
        </div>
    );
}

export default TaskFilters;
```

### 13.3) `src/components/TaskItem.jsx`

```jsx
/**
 * Representa uma tarefa individual.
 * @param {{
 *  tarefa: { id: string, texto: string, concluida: boolean },
 *  onToggleTask: (id: string) => void,
 *  onRemoveTask: (id: string) => void
 * }} props - Props do componente.
 * @returns {JSX.Element}
 */
function TaskItem({ tarefa, onToggleTask, onRemoveTask }) {
    return (
        <li style={{ marginBottom: "8px" }}>
            <span
                style={{
                    textDecoration: tarefa.concluida ? "line-through" : "none",
                    marginRight: "12px",
                }}
            >
                {tarefa.texto}
            </span>

            <button onClick={() => onToggleTask(tarefa.id)}>
                {tarefa.concluida ? "Reabrir" : "Concluir"}
            </button>

            <button
                onClick={() => onRemoveTask(tarefa.id)}
                style={{ marginLeft: "8px" }}
            >
                Remover
            </button>
        </li>
    );
}

export default TaskItem;
```

### 13.4) `src/components/TaskList.jsx`

```jsx
import TaskItem from "./TaskItem";

/**
 * Lista de tarefas já filtradas.
 * @param {{
 *  tarefas: Array<{ id: string, texto: string, concluida: boolean }>,
 *  onToggleTask: (id: string) => void,
 *  onRemoveTask: (id: string) => void
 * }} props - Props do componente.
 * @returns {JSX.Element}
 */
function TaskList({ tarefas, onToggleTask, onRemoveTask }) {
    // Caso de lista vazia para o filtro atual.
    if (tarefas.length === 0) {
        return <p>Sem tarefas para este filtro.</p>;
    }

    return (
        <ul>
            {tarefas.map((tarefa) => (
                <TaskItem
                    key={tarefa.id}
                    tarefa={tarefa}
                    onToggleTask={onToggleTask}
                    onRemoveTask={onRemoveTask}
                />
            ))}
        </ul>
    );
}

export default TaskList;
```

### 13.5) `src/App.jsx` final

```jsx
import { useEffect, useState } from "react";
import TaskFilters from "./components/TaskFilters";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

/**
 * Componente pai da aplicação.
 * Guarda estado global, aplica regras e passa props aos filhos.
 * @returns {JSX.Element}
 */
function App() {
    // Estado principal com inicialização a partir de localStorage.
    const [tarefas, setTarefas] = useState(() => {
        const guardadas = localStorage.getItem("tarefas_turma");
        return guardadas ? JSON.parse(guardadas) : [];
    });

    // Estado do filtro atual.
    const [filtro, setFiltro] = useState("todas");

    // Persistência automática sempre que tarefas muda.
    useEffect(() => {
        localStorage.setItem("tarefas_turma", JSON.stringify(tarefas));
    }, [tarefas]);

    /**
     * Adiciona tarefa nova.
     * @param {string} texto - Texto da tarefa.
     */
    const addTask = (texto) => {
        const novaTarefa = {
            id: crypto.randomUUID(),
            texto,
            concluida: false,
        };

        setTarefas((anteriores) => [...anteriores, novaTarefa]);
    };

    /**
     * Alterna estado concluída da tarefa.
     * @param {string} id - ID da tarefa.
     */
    const toggleTask = (id) => {
        setTarefas((anteriores) =>
            anteriores.map((tarefa) =>
                tarefa.id === id
                    ? { ...tarefa, concluida: !tarefa.concluida }
                    : tarefa,
            ),
        );
    };

    /**
     * Remove tarefa pelo ID.
     * @param {string} id - ID da tarefa.
     */
    const removeTask = (id) => {
        setTarefas((anteriores) =>
            anteriores.filter((tarefa) => tarefa.id !== id),
        );
    };

    // Lista derivada conforme filtro.
    const tarefasFiltradas = tarefas.filter((tarefa) => {
        if (filtro === "ativas") return !tarefa.concluida;
        if (filtro === "concluidas") return tarefa.concluida;
        return true;
    });

    // Contadores derivados.
    const total = tarefas.length;
    const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
    const ativas = total - concluidas;

    return (
        <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
            <h1>Task Tracker da Turma</h1>
            <p>Organiza as tuas tarefas de estudo.</p>

            <TaskForm onAddTask={addTask} />

            <TaskFilters filtro={filtro} onChangeFiltro={setFiltro} />

            <p style={{ marginTop: "12px" }}>
                Total: {total} | Ativas: {ativas} | Concluídas: {concluidas}
            </p>

            <TaskList
                tarefas={tarefasFiltradas}
                onToggleTask={toggleTask}
                onRemoveTask={removeTask}
            />
        </main>
    );
}

export default App;
```

**Checkpoint F**

- Mesma funcionalidade da fase anterior.
- Código separado por responsabilidades.
- `App` fica mais focado em estado e regras.

---

## 14) Erros comuns e correções

1. `Cannot find module` nos componentes

- Confirma nomes e caminhos em `src/components`.
- Confirma maiúsculas/minúsculas no nome do ficheiro.

2. Submit não adiciona tarefa

- Verifica `onSubmit={handleSubmit}` no formulário.
- Verifica `type="submit"` no botão.
- Verifica se `texto.trim()` não está vazio.

3. Tarefas desaparecem após refresh

- Confirma `useEffect` com `localStorage.setItem(...)`.
- Confirma leitura inicial com `localStorage.getItem(...)`.

4. Filtro não funciona

- Confirma as strings exatas: `todas`, `ativas`, `concluidas`.

5. Botões atuam na tarefa errada

- Confirma se estás a passar `tarefa.id` para as callbacks.

---

## 15) Desafios finais

1. Não permitir tarefas com o mesmo texto.
2. Botão `Limpar concluídas`.
3. Editar texto de tarefa.
4. Ordenar por mais recentes.
5. Adicionar prioridade (`baixa`, `média`, `alta`).
6. Mostrar data/hora de criação.

---

## 16) Checklist de validação

- [ ] Input controlado funcional
- [ ] Criação de tarefas funcional
- [ ] Concluir/reabrir funcional
- [ ] Remover funcional
- [ ] Filtros funcionais
- [ ] Contadores corretos
- [ ] Persistência com `localStorage`
- [ ] Componentização concluída
- [ ] Consegues explicar o papel de `useState`, `useEffect`, `.map()` e `.filter()`

![Footer](../../Images/Footer.png)
