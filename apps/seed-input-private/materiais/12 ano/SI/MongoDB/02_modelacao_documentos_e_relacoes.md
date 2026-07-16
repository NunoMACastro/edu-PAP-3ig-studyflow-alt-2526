![Header](../Images/Header.png)

# MongoDB (12.º Ano) - 02 · Modelação de documentos e relações

> **Objetivo deste ficheiro**
>
> - Pensar em dados como documentos usados por uma aplicação.
> - Decidir quando embutir dados e quando referenciar por `ObjectId`.
> - Desenhar coleções para um domínio simples de tarefas.
> - Evitar modelos que dificultam queries, updates e evolução do projeto.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Pensar por documentos](#sec-1)
- [2. [ESSENCIAL] Embutir vs referenciar](#sec-2)
- [3. [ESSENCIAL] Exemplo guiado: tarefas, categorias e comentários](#sec-3)
- [4. [ESSENCIAL+] Campos padrão e decisões de contrato](#sec-4)
- [5. [EXTRA] Antipadrões de modelação](#sec-5)
- [Exercícios - Modelação de documentos](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo aparece antes do CRUD porque a forma dos documentos influencia quase tudo: queries, índices, validação, endpoints e componentes React.

- **Núcleo do tema:** as secções [ESSENCIAL] trabalham documentos, relações e exemplos de domínio.
- **Aprofundamento:** as secções [ESSENCIAL+] ligam modelação a contrato de API.
- **Contexto adicional:** as secções [EXTRA] mostram escolhas que costumam causar problemas quando os dados crescem.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Pensar por documentos

### 1.1 Modelo mental

Em MongoDB, não começas por perguntar "quantas tabelas preciso?".

Começas por perguntar:

- Que ecrã vai ler estes dados?
- Que dados são mostrados juntos?
- Que dados mudam ao mesmo tempo?
- Que dados podem crescer muito?
- Que dados pertencem a outra entidade?

MongoDB favorece documentos que representam agregados úteis para a aplicação.

---

### 1.2 Documento base de tarefa

```json
{
    "_id": "665f1f7a0c4b5a7e4f123456",
    "titulo": "Rever MongoDB",
    "feito": false,
    "prioridade": "normal",
    "tags": ["backend", "dados"],
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z"
}
```

Este documento já responde bem a uma lista simples de tarefas.

---

### 1.3 Documento não precisa de ter todos os dados

Se cada tarefa tiver uma categoria, há duas opções:

- guardar a categoria dentro da tarefa;
- guardar só `categoriaId` e procurar a categoria noutra coleção.

A decisão depende de como a aplicação lê e altera os dados.

---

### 1.4 Erros comuns

- Copiar o modelo SQL diretamente para MongoDB sem pensar nas leituras.
- Guardar tudo dentro de um documento gigante.
- Separar tudo em coleções pequenas e depois precisar de juntar dados a toda a hora.

### 1.5 Checkpoint

- Que perguntas fazes antes de criar uma coleção?
- Porque é que a UI influencia a modelação?
- O que torna um documento "gigante" perigoso?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Embutir vs referenciar

### 2.1 Embutir dados

Embutir significa guardar dados dentro do mesmo documento.

```json
{
    "titulo": "Projeto Fullstack",
    "subtarefas": [
        { "titulo": "Criar backend", "feito": true },
        { "titulo": "Ligar React", "feito": false }
    ]
}
```

Faz sentido quando:

- os dados pertencem ao documento principal;
- são lidos quase sempre juntos;
- não crescem sem limite;
- não precisam de permissões ou ciclo de vida próprio.

---

### 2.2 Referenciar dados

Referenciar significa guardar o ID de outro documento.

```json
{
    "titulo": "Projeto Fullstack",
    "categoriaId": "665f1f7a0c4b5a7e4f123abc"
}
```

Faz sentido quando:

- o dado é partilhado por muitos documentos;
- pode ser alterado de forma independente;
- pode crescer muito;
- precisa de ser consultado separadamente.

---

### 2.3 Árvore de decisão

```text
Os dados são sempre lidos com o documento principal?
  ↓ sim
Podem crescer sem limite?
  ↓ não
Embutir pode fazer sentido.

Os dados são reutilizados por muitos documentos?
  ↓ sim
Referenciar costuma ser melhor.
```

---

### 2.4 Erros comuns

- Embutir arrays que podem crescer indefinidamente, como milhares de comentários.
- Referenciar dados pequenos que são sempre lidos juntos.
- Duplicar campos críticos sem estratégia de atualização.

### 2.5 Checkpoint

- Quando embutir subtarefas pode fazer sentido?
- Quando uma categoria deve ser referenciada?
- Que problema aparece num array sem limite?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Exemplo guiado: tarefas, categorias e comentários

### 3.1 Coleção `categorias`

```json
{
    "_id": "665f1f7a0c4b5a7e4f111111",
    "nome": "Estudo",
    "cor": "#0ea5e9",
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z"
}
```

Categoria é uma boa candidata a coleção própria porque pode ser reutilizada por muitas tarefas.

---

### 3.2 Coleção `tarefas`

```json
{
    "_id": "665f1f7a0c4b5a7e4f222222",
    "titulo": "Rever índices",
    "feito": false,
    "prioridade": "alta",
    "categoriaId": "665f1f7a0c4b5a7e4f111111",
    "tags": ["mongodb", "performance"],
    "subtarefas": [
        { "titulo": "Ler plano explain", "feito": false },
        { "titulo": "Criar índice composto", "feito": false }
    ],
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z"
}
```

Decisões:

- `categoriaId` é referência porque uma categoria pertence a muitas tarefas.
- `tags` são embutidas porque são pequenas e simples.
- `subtarefas` são embutidas enquanto forem poucas e pertencentes à tarefa.

---

### 3.3 Comentários: embutir ou separar?

Se uma tarefa tiver poucos comentários internos:

```json
{
    "titulo": "Preparar entrega",
    "comentarios": [
        {
            "autor": "Ana",
            "texto": "Falta rever validação",
            "createdAt": "2026-05-30T10:15:00.000Z"
        }
    ]
}
```

Se puder ter muitos comentários, pesquisa, moderação ou paginação, cria coleção própria:

```json
{
    "_id": "665f1f7a0c4b5a7e4f333333",
    "tarefaId": "665f1f7a0c4b5a7e4f222222",
    "autor": "Ana",
    "texto": "Falta rever validação",
    "createdAt": "2026-05-30T10:15:00.000Z"
}
```

---

### 3.4 Checkpoint

- Porque é que `categoriaId` foi referenciado?
- Porque é que `tags` ficaram embutidas?
- Em que situação comentários devem ir para coleção própria?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Campos padrão e decisões de contrato

### 4.1 Datas

Usa nomes consistentes:

- `createdAt`: quando o documento foi criado;
- `updatedAt`: quando foi alterado;
- `deletedAt`: quando foi removido logicamente.

Exemplo:

```json
{
    "titulo": "Ler documentação",
    "feito": false,
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z"
}
```

---

### 4.2 Soft delete

Em vez de apagar fisicamente:

```json
{
    "titulo": "Tarefa antiga",
    "feito": true,
    "deletedAt": "2026-05-30T11:00:00.000Z"
}
```

Depois filtras:

```js
const filter = { deletedAt: { $exists: false } };
```

Soft delete é útil quando precisas de histórico, recuperação ou auditoria. Se não precisas disso, `deleteOne` pode ser suficiente.

---

### 4.3 Contrato de API

MongoDB usa `_id`, mas o frontend não deve ter de conhecer todos os detalhes internos da base de dados.

Duas opções comuns:

1. devolver `_id` diretamente;
2. transformar `_id` em `id` na resposta.

Exemplo de transformação:

```js
function toTarefaResponse(doc) {
    return {
        id: doc._id.toString(),
        titulo: doc.titulo,
        feito: doc.feito,
        prioridade: doc.prioridade,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
```

Escolhe uma opção e mantém consistência em todos os endpoints.

---

### 4.4 Checkpoint

- Para que serve `deletedAt`?
- Qual é a diferença entre `_id` e `id` no contrato?
- Porque é importante manter nomes coerentes?

<a id="sec-5"></a>

## 5. [EXTRA] Antipadrões de modelação

- **Documento gigante:** guarda demasiados dados numa só entidade.
- **Array infinito:** comentários, logs ou eventos sem limite dentro de um documento.
- **Duplicação crítica sem plano:** o mesmo dado importante fica em vários sítios e fica desatualizado.
- **Nomes inconsistentes:** `titulo`, `title`, `name` para o mesmo conceito.
- **Modelar antes de conhecer as queries:** criar estrutura sem saber como a aplicação vai ler.

<a id="exercicios"></a>

## Exercícios - Modelação de documentos

1. Modela uma coleção `tarefas` com `titulo`, `feito`, `prioridade`, `tags`, `createdAt` e `updatedAt`.
2. Adiciona categorias ao domínio e decide se ficam embutidas ou referenciadas.
3. Modela subtarefas embutidas dentro da tarefa.
4. Modela comentários em duas versões: embutidos e em coleção própria.
5. Escreve uma justificação curta para cada decisão.
6. Define se a API vai devolver `_id` ou `id`.
7. Cria um exemplo de resposta paginada com `{ items, page, limit, total }`.
8. Identifica um antipadrão que queres evitar no teu modelo.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com modelos mentais, decisões de modelação, checkpoints e exercícios.
- 2026-04-17: capítulo criado com modelação documental e relações.

![Footer](../Images/Footer.png)
