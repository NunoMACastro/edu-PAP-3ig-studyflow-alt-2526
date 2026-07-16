![Header](../../Images/Header.png)

# Documentação de Código

## Convenções de nomes

- camelCase para variáveis e funções
- PascalCase para componentes e classes
- Funções com verbo: get/create/update/delete
- Booleanos: is/has/can/should

## Comentários

- Explicar decisões e contexto
- Evitar comentários redundantes

## JSDoc

```js
/**
 * Cria uma tarefa.
 * @param {{ titulo: string }} data
 * @returns {Promise<object>}
 */
export async function createTarefa(data) {
    // ...
}
```

## Contratos internos (DTOs e services)

- Documentar entradas e saídas dos services
- Indicar campos obrigatórios e tipos
- Manter alinhado com API.md e DADOS.md

## Erros e logs

- Usar contrato de erro padrão
- Não expor segredos em logs

## Estrutura de ficheiros

- Separar controllers, services, repositories
- Evitar lógica de negócio em controllers

## Lint e formatação (recomendado)

- ESLint para regras de estilo
- Prettier para formatação automática

![Footer](../../Images/Footer.png)
