![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 05 · Controlo de fluxo

> **Objetivo deste ficheiro**
>
> - Tomar decisões com `if`, `else if`, `else` e `switch`.
> - Usar guard clauses para simplificar validações.
> - Evitar armadilhas com `truthy/falsy`.
> - Escolher entre `if`, `switch` e ternário.
> - Escrever condições legíveis e fáceis de testar.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Decisões com `if/else`](#sec-1)
- [2. [ESSENCIAL] `switch` e escolhas por casos](#sec-2)
- [3. [ESSENCIAL] Guard clauses](#sec-3)
- [4. [ESSENCIAL+] Condições legíveis](#sec-4)
- [5. [EXTRA] Diagnóstico rápido](#sec-5)
- [Exercícios - Controlo de fluxo](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Controlo de fluxo é a capacidade de o programa escolher caminhos diferentes. Sem isto, o código corria sempre da mesma forma.

- **Núcleo do tema:** `if`, `else`, `switch` e validações.
- **Aprofundamento:** guard clauses e composição de condições.
- **Ligação ao percurso:** estas decisões aparecem em ciclos, funções, formulários, APIs e tratamento de erros.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Decisões com `if/else`

### 1.1 Modelo mental

Um `if` é uma pergunta:

```txt
se a condição for verdadeira -> corre este bloco
caso contrário               -> segue outro caminho
```

### 1.2 Exemplo base

```js
const nota = 14;

if (nota >= 18) {
    console.log("Excelente");
} else if (nota >= 10) {
    console.log("Aprovado");
} else {
    console.log("Reprovado");
}
```

A ordem importa. O JavaScript testa de cima para baixo e pára quando encontra a primeira condição verdadeira.

### 1.3 Validação antes de classificar

```js
function classificarNota(nota) {
    if (typeof nota !== "number" || Number.isNaN(nota)) {
        return "Nota não numérica";
    }

    if (nota < 0 || nota > 20) {
        return "Nota fora do intervalo";
    }

    if (nota >= 18) return "Excelente";
    if (nota >= 10) return "Aprovado";
    return "Reprovado";
}
```

### 1.4 Erros comuns

- Escrever condições na ordem errada.
- Usar `if (valor)` quando `0` ou `""` são valores válidos.
- Esquecer `{}` e criar bugs ao acrescentar linhas.

### 1.5 Checkpoint

- Porque é que a ordem dos `else if` importa?
- Quando é que `if (valor)` pode ser perigoso?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `switch` e escolhas por casos

### 2.1 Quando usar

`switch` funciona bem quando comparas **o mesmo valor** contra vários casos.

```js
const opcao = "listar";

switch (opcao) {
    case "listar":
        console.log("A listar dados");
        break;
    case "criar":
        console.log("A criar registo");
        break;
    case "sair":
        console.log("A sair");
        break;
    default:
        console.log("Opção inválida");
}
```

### 2.2 `break`

Sem `break`, a execução continua para o caso seguinte.

```js
switch ("a") {
    case "a":
        console.log("A");
        break;
    case "b":
        console.log("B");
        break;
}
```

### 2.3 Agrupar casos

```js
const dia = "sábado";

switch (dia) {
    case "sábado":
    case "domingo":
        console.log("Fim de semana");
        break;
    default:
        console.log("Dia útil");
}
```

### 2.4 Checkpoint

- Em que situação `switch` é mais claro do que vários `if`?
- Para que serve `default`?
- O que acontece se esqueceres `break`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Guard clauses

### 3.1 Modelo mental

Guard clauses são saídas rápidas. Em vez de criar muitos blocos aninhados, validas cedo e sais.

```js
function calcularDesconto(preco, percentagem) {
    if (typeof preco !== "number" || Number.isNaN(preco)) return null;
    if (typeof percentagem !== "number" || Number.isNaN(percentagem)) return null;
    if (preco < 0) return null;
    if (percentagem < 0 || percentagem > 100) return null;

    return preco * (1 - percentagem / 100);
}
```

### 3.2 Antes e depois

Código muito aninhado:

```js
function podeComprar(preco, saldo) {
    if (preco > 0) {
        if (saldo >= preco) {
            return true;
        }
    }

    return false;
}
```

Com guard clauses:

```js
function podeComprar(preco, saldo) {
    if (preco <= 0) return false;
    if (saldo < preco) return false;
    return true;
}
```

### 3.3 Checkpoint

- Porque é que guard clauses reduzem aninhamento?
- Em que zona da função costumam aparecer?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Condições legíveis

### 4.1 Nomear partes da condição

```js
const emailValido = email.includes("@") && email.includes(".");
const senhaValida = senha.length >= 8;

if (emailValido && senhaValida) {
    console.log("Formulário válido");
}
```

Nomes claros transformam lógica em frases.

### 4.2 Ternário para escolher valores

```js
const estado = nota >= 10 ? "Aprovado" : "Reprovado";
```

Usa ternário para valores simples. Para fluxos com vários passos, usa `if/else`.

### 4.3 `switch(true)` com cuidado

```js
const temperatura = 22;

switch (true) {
    case temperatura < 0:
        console.log("Gelo");
        break;
    case temperatura < 18:
        console.log("Frio");
        break;
    default:
        console.log("Agradável");
}
```

É possível, mas muitas vezes `if/else if` fica mais natural.

### 4.4 Checkpoint

- Como podes tornar uma condição longa mais legível?
- Quando é que o ternário é uma boa escolha?

<a id="sec-5"></a>

## 5. [EXTRA] Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Código entra no ramo errado | Ordem dos `if` incorreta | Testar casos limite |
| `0` é tratado como vazio | Uso de `if (valor)` | Comparação explícita |
| `switch` executa vários casos | `break` em falta | Adicionar `break` |
| Função difícil de ler | Muitos níveis de `if` | Usar guard clauses |
| Ternário ilegível | Lógica demasiado grande | Trocar para `if/else` |

<a id="exercicios"></a>

## Exercícios - Controlo de fluxo

1. Cria `classificarNota(nota)` com validação e mensagens para inválida, reprovado, aprovado e excelente.
2. Cria um `switch` para opções de menu: `listar`, `criar`, `editar`, `sair`.
3. Reescreve uma função com vários `if` aninhados usando guard clauses.
4. Cria `validarEmail(email)` com regras simples: não vazio, inclui `@`, inclui `.`, mínimo de 6 caracteres.
5. Usa ternário para escolher uma etiqueta de estado a partir de `feito === true`.
6. Cria um programa que classifica temperatura com `if/else if`.
7. Repete a classificação da temperatura com `switch(true)` e compara a leitura.
8. Cria um objeto `campos` com `nome`, `idade` e `email`; devolve a primeira mensagem de erro encontrada.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçados guard clauses, validação explícita e diagnóstico de condições.

![Footer](../Images/Footer.png)
