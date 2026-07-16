![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 02 · Input/Output básico

> **Objetivo deste ficheiro**
>
> - Mostrar informação com `console`, `alert` e elementos HTML simples.
> - Recolher dados no browser com `prompt` e `confirm`.
> - Recolher dados em Node.js com `readline/promises`.
> - Converter e validar entradas antes de as usar.
> - Perceber diferenças entre browser e Node.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Output: ver o que o programa está a fazer](#sec-1)
- [2. [ESSENCIAL] Input no browser](#sec-2)
- [3. [ESSENCIAL] Input em Node.js](#sec-3)
- [4. [ESSENCIAL+] Validar entradas](#sec-4)
- [5. [EXTRA] Pequenos padrões úteis](#sec-5)
- [Exercícios - Input/Output básico](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Input/output é a primeira forma de perceber que o programa comunica com o exterior. O programa recebe dados, processa-os e mostra resultados.

- **Núcleo do tema:** `console`, `prompt`, `confirm`, `alert` e `readline`.
- **Aprofundamento:** validação e diferenças entre browser e Node.js.
- **Ligação ao percurso:** validação de entradas volta a aparecer em formulários, APIs, DOM, Node e MongoDB.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Output: ver o que o programa está a fazer

### 1.1 Modelo mental

Output é tudo o que o programa mostra:

- texto na consola;
- caixas no browser;
- conteúdo numa página;
- resposta de uma API.

Nos primeiros exercícios, a consola é o sítio mais rápido para observar dados.

### 1.2 `console.*`

```js
console.log("Mensagem normal");
console.info("Informação");
console.warn("Aviso");
console.error("Erro");

console.table([
    { nome: "Ana", nota: 18 },
    { nome: "Bruno", nota: 9 },
]);
```

`console.table` é muito útil para arrays de objetos.

### 1.3 `alert`

```js
alert("Operação concluída");
```

`alert` interrompe a interação até a pessoa fechar a caixa. É útil em exemplos simples, mas em páginas reais costuma ser melhor mostrar mensagens no HTML.

### 1.4 Erros comuns

- Usar `console.log` para tudo e não distinguir avisos ou erros.
- Deixar logs temporários espalhados num projeto final.
- Tentar mostrar objetos complexos em `alert`; a consola é melhor para isso.

### 1.5 Checkpoint

- Quando é que `console.table` ajuda mais do que `console.log`?
- Porque é que `alert` não é ideal para interfaces maiores?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Input no browser

### 2.1 `prompt`

`prompt` devolve sempre uma string ou `null` se for cancelado.

```js
const nome = prompt("Nome:");

if (nome === null || nome.trim() === "") {
    alert("Nome em falta");
} else {
    alert(`Olá, ${nome.trim()}!`);
}
```

### 2.2 Converter números

```js
const texto = prompt("Idade:");
const idade = Number(texto);

if (Number.isNaN(idade)) {
    alert("Idade inválida");
} else {
    alert(`Daqui a um ano terás ${idade + 1}`);
}
```

`prompt` não sabe que queres um número. Tens de converter.

### 2.3 `confirm`

```js
const querContinuar = confirm("Queres continuar?");

if (querContinuar) {
    console.log("A continuar");
} else {
    console.log("Cancelado");
}
```

`confirm` devolve `true` ou `false`.

### 2.4 Checkpoint

- Que valor devolve `prompt` quando é cancelado?
- Porque é que `Number(prompt(...))` pode produzir `NaN`?
- O que devolve `confirm`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Input em Node.js

### 3.1 Browser vs Node

No browser existem `prompt`, `alert` e `confirm`.

Em Node.js, o programa corre no terminal. Para ler texto, usa-se o módulo nativo `readline/promises`.

### 3.2 Exemplo completo

```js
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

const nome = await rl.question("Nome: ");
const idadeTexto = await rl.question("Idade: ");
const idade = Number(idadeTexto);

if (nome.trim() === "" || Number.isNaN(idade)) {
    console.log("Dados inválidos");
} else {
    console.log(`${nome.trim()} tem ${idade} anos.`);
}

rl.close();
```

Para este exemplo funcionar com `await` no topo, o ficheiro deve ser um módulo ES.

### 3.3 Erros comuns

- Esquecer `rl.close()` e deixar o processo preso.
- Usar `prompt` em Node.js.
- Esquecer que tudo o que vem de `question(...)` é texto.

### 3.4 Checkpoint

- Porque é que `readline/promises` devolve texto?
- O que acontece se não fechares a interface `rl`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Validar entradas

### 4.1 Função reutilizável

```js
function lerNumero(texto) {
    const numero = Number(texto);

    if (texto === null || texto.trim() === "" || Number.isNaN(numero)) {
        return null;
    }

    return numero;
}

const idade = lerNumero(prompt("Idade:"));

if (idade === null) {
    alert("Número inválido");
} else {
    alert(`Idade válida: ${idade}`);
}
```

### 4.2 Separar ler, converter e decidir

Uma forma limpa de pensar:

```txt
entrada -> conversão -> validação -> decisão -> output
```

Exemplo:

```js
const entrada = prompt("Nota:");
const nota = lerNumero(entrada);

if (nota === null || nota < 0 || nota > 20) {
    alert("Nota inválida");
} else if (nota >= 10) {
    alert("Aprovado");
} else {
    alert("Reprovado");
}
```

### 4.3 Checkpoint

- Porque é útil criar `lerNumero`?
- Que vantagens há em separar conversão e decisão?

<a id="sec-5"></a>

## 5. [EXTRA] Pequenos padrões úteis

### 5.1 Agrupar saída na consola

```js
console.group("Resultado");
console.log("Nome:", "Ana");
console.log("Nota:", 18);
console.groupEnd();
```

### 5.2 Mostrar listas

```js
const nomes = "Ana, Bruno, Carla"
    .split(",")
    .map((nome) => nome.trim())
    .filter(Boolean);

console.table(nomes.map((nome, indice) => ({ indice, nome })));
```

### 5.3 Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Resultado é `NaN` | Conversão falhou | Validar com `Number.isNaN` |
| Nome vem com espaços | Entrada não foi aparada | Usar `.trim()` |
| Node não termina | `rl.close()` em falta | Fechar a interface |
| `prompt is not defined` | Código corre em Node | Usar `readline` |

<a id="exercicios"></a>

## Exercícios - Input/Output básico

1. Pede primeiro e último nome com `prompt`. Mostra uma saudação apenas se ambos tiverem texto.
2. Pede dois números, calcula a média e mostra o resultado com duas casas decimais.
3. Usa `confirm` para perguntar se uma operação deve continuar e mostra mensagens diferentes.
4. Cria `lerNumero(texto)` e usa-a para validar idade, nota e preço.
5. Em Node.js, lê nome e idade com `readline/promises` e mostra uma frase final.
6. Cria uma lista a partir de texto separado por vírgulas e mostra-a com `console.table`.
7. Usa `console.group` para organizar a saída de um cálculo com dobro, triplo e quadrado.
8. Escreve um pequeno menu em Node com as opções `1 - Somar`, `2 - Dobrar`, `3 - Sair`.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçada a validação de entradas no browser e em Node.js.

![Footer](../Images/Footer.png)
