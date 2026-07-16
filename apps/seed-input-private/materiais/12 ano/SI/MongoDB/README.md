![Header](../Images/Header.png)

# MongoDB (12.º Ano) - Percurso do módulo

Este módulo liga a persistência real aos projetos Node/Express e Fullstack. A ideia principal é simples: o backend deixa de guardar dados em memória ou ficheiros JSON e passa a trabalhar com uma base de dados documental.

---

## Pré-requisitos

- **JavaScript moderno:** objetos, arrays, módulos, `async/await`.
- **Node.js + Express:** rotas, controllers, services, repositories, validação e erros.
- **Configuração:** `.env`, variáveis de ambiente e cuidado com segredos.
- **MongoDB Atlas:** conta criada, cluster disponível e string de ligação.

---

## O que vais aprender

- Pensar em documentos, coleções e relações no modelo documental.
- Modelar dados a partir das leituras e escritas reais da aplicação.
- Fazer CRUD com filtros, projeções, paginação e operadores.
- Usar o MongoDB Node driver quando queres controlo direto.
- Usar Mongoose quando queres schemas, models e validação declarativa.
- Criar pipelines de agregação para estatísticas e dashboards.
- Perceber índices, custo de queries e `explain`.
- Tratar validação, `ObjectId`, duplicados e erros de forma consistente.

---

## Índice de ficheiros

1. [Introdução e setup Atlas](01_introducao_e_setup_atlas.md)
2. [Modelação de documentos e relações](02_modelacao_documentos_e_relacoes.md)
3. [CRUD básico e operadores](03_crud_basico_e_operadores.md)
4. [Node driver: fundamentos](04_node_driver_fundamentos.md)
5. [Mongoose: schemas e models](05_mongoose_schemas_models.md)
6. [Agregações e pipeline](06_agregacoes_e_pipeline.md)
7. [Queries e indexação](07_queries_e_indexacao.md)
8. [Validação e erros](08_validacao_e_erros.md)

---

## Ligação com outros módulos

- [Node: estrutura MVC leve](../Node/05_estrutura_mvc.md)
- [Node: rotas, controladores e validação](../Node/06_rotas_controladores_validacao.md)
- [Node: configuração e 12-Factor](../Node/10_config_e_12factor.md)
- [React: consumo de API com backend Node.js](../React/11_consumo_api_e_backend_node.md)
- [Fullstack: fluxo React, Express e MongoDB](../Fullstack/01_fluxo_front_back_db.md)

---

## Modelo mental fullstack

MongoDB aparece no fim do fluxo, mas influencia o contrato todo:

```text
evento no browser
  ↓
fetch no React
  ↓
rota Express
  ↓
controller
  ↓
validação
  ↓
service
  ↓
repository
  ↓
MongoDB
  ↓
resposta JSON
  ↓
estado atualizado no React
```

O frontend não conhece a connection string nem faz queries à base de dados. A API recebe o pedido, valida, aplica regras e só depois consulta MongoDB. A resposta deve voltar num formato que React consiga usar sem adivinhar nomes de campos.

---

## Contrato base usado nos exemplos

Muitos exemplos usam o recurso `tarefas`.

```json
{
    "_id": "665f1f7a0c4b5a7e4f123456",
    "titulo": "Estudar MongoDB",
    "feito": false,
    "prioridade": "normal",
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z"
}
```

Respostas paginadas usam um envelope consistente:

```json
{
    "items": [],
    "page": 1,
    "limit": 20,
    "total": 0
}
```

Erros seguem o mesmo formato usado nos módulos Node e Fullstack:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Dados inválidos",
        "details": []
    }
}
```

---

## Changelog

- 2026-05-30: acrescentado modelo mental fullstack e reforçada a ligação entre React, Express e MongoDB.
- 2026-05-30: README reestruturado para alinhar o módulo com React, Node e Fullstack.
- 2026-04-17: módulo recriado com 8 capítulos e ligação curricular a Node/React/Fullstack.

![Footer](../Images/Footer.png)
