![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 03 · Operadores essenciais

> **Objetivo deste ficheiro**
>
> - Usar operadores aritméticos, de atribuição, comparação e lógica.
> - Perceber coerção em expressões comuns.
> - Escrever condições legíveis com `&&`, `||`, `!`, `??` e ternário.
> - Reconhecer erros de precedência e comparação.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Operadores aritméticos](#sec-1)
- [2. [ESSENCIAL] Comparação e igualdade](#sec-2)
- [3. [ESSENCIAL] Lógicos, curto-circuito e valores por defeito](#sec-3)
- [4. [ESSENCIAL+] Precedência e expressões legíveis](#sec-4)
- [5. [EXTRA] Diagnóstico rápido](#sec-5)
- [Exercícios - Operadores essenciais](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Operadores são as peças que ligam valores: somam, comparam, negam, escolhem e atribuem. São pequenos, mas definem a maior parte das decisões que o programa toma.

- **Núcleo do tema:** aritmética, comparação e lógica.
- **Aprofundamento:** curto-circuito, `??`, precedência e ternário.
- **Ligação ao percurso:** operadores aparecem em condições, ciclos, validação, filtros e regras de negócio.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Operadores aritméticos

### 1.1 Modelo mental

Operadores são verbos curtos entre valores. Eles dizem ao JavaScript que operação deve acontecer:

```txt
valor operador valor -> resultado
```

Exemplo:

```js
2 + 3; // 5
```

### 1.2 Operações principais

```js
5 + 2; // 7
5 - 2; // 3
5 * 2; // 10
5 / 2; // 2.5
7 % 3; // 1
2 ** 3; // 8
```

`%` devolve o resto da divisão e é muito usado para descobrir pares:

```js
const numero = 8;
const par = numero % 2 === 0;
```

### 1.3 Coerção com `+`

O operador `+` também junta strings.

```js
"5" + 2; // "52"
"5" - 2; // 3
Number("5") + 2; // 7
```

Quando a intenção é fazer contas, converte antes.

### 1.4 Atribuição curta

```js
let pontos = 10;

pontos += 5; // pontos = pontos + 5
pontos -= 2;
pontos *= 3;
```

Estas formas são úteis quando a variável depende do seu valor anterior.

### 1.5 Checkpoint

- Para que serve `%`?
- Porque é que `"5" + 2` não devolve `7`?
- Quando é que `+=` melhora a leitura?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Comparação e igualdade

### 2.1 Comparações numéricas

```js
10 > 5; // true
10 >= 10; // true
3 < 2; // false
```

Em condições, guarda expressões importantes em variáveis com nomes claros.

```js
const nota = 14;
const aprovado = nota >= 10;
```

### 2.2 Igualdade estrita

```js
2 === "2"; // false
2 !== "2"; // true
```

Evita `==` e `!=`, porque fazem coerção automática.

```js
"" == 0; // true, surpresa comum
"" === 0; // false
```

### 2.3 Comparar strings

```js
"Ana" < "Bruno"; // true
```

Para ordenação com acentos, prefere `localeCompare`.

```js
["Élia", "Ana", "Álvaro"].sort((a, b) => a.localeCompare(b, "pt-PT"));
```

### 2.4 Erros comuns

- Usar `=` dentro de uma condição quando querias comparar.
- Usar `==` e não perceber que houve conversão.
- Comparar strings como se fossem números.

### 2.5 Checkpoint

- Qual é a diferença entre `=` e `===`?
- Porque é que `==` pode esconder bugs?
- Como ordenas palavras com acentos?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Lógicos, curto-circuito e valores por defeito

### 3.1 `&&`, `||` e `!`

```js
const idade = 18;
const temDocumento = true;

if (idade >= 18 && temDocumento) {
    console.log("Pode avançar");
}
```

- `&&` exige que tudo seja verdadeiro.
- `||` aceita que pelo menos uma parte seja verdadeira.
- `!` inverte.

### 3.2 Curto-circuito

```js
const nome = "";
const nomeVisivel = nome || "Sem nome";
```

`||` devolve o primeiro valor `truthy`. Isto é útil, mas pode ser perigoso com `0`, `""` ou `false`.

### 3.3 `??`

```js
const pagina = 0;

const paginaA = pagina || 1; // 1
const paginaB = pagina ?? 1; // 0
```

`??` só troca quando o valor é `null` ou `undefined`.

### 3.4 Ternário

```js
const estado = nota >= 10 ? "Aprovado" : "Reprovado";
```

Usa ternário quando queres escolher um valor simples. Se houver várias instruções, usa `if/else`.

### 3.5 Checkpoint

- Quando é que `&&` para de avaliar?
- Porque é que `??` preserva `0`?
- Quando é que o ternário deixa de ser boa opção?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Precedência e expressões legíveis

### 4.1 Parênteses mostram intenção

```js
2 + 3 * 4; // 14
(2 + 3) * 4; // 20
```

Em condições maiores, usa parênteses mesmo quando a linguagem não obriga.

```js
const podeEntrar = (idade >= 18 && temDocumento) || temAutorizacao;
```

### 4.2 Dividir condições

```js
const temIdade = idade >= 18;
const documentoValido = documento !== null && documento.ativo === true;

if (temIdade && documentoValido) {
    console.log("Entrada validada");
}
```

Condições com nomes tornam o programa mais fácil de verificar.

### 4.3 Checkpoint

- Porque é que parênteses podem melhorar código mesmo quando não são obrigatórios?
- Como podes simplificar uma condição muito comprida?

<a id="sec-5"></a>

## 5. [EXTRA] Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Resultado virou string | Uso de `+` com texto | Converter com `Number` |
| Condição aceita valores estranhos | Uso de `==` | Trocar para `===` |
| `0` vira valor por defeito | Uso de `||` | Usar `??` |
| Expressão difícil de ler | Demasiados operadores juntos | Criar variáveis intermédias |
| Resultado matemático inesperado | Precedência | Usar parênteses |

<a id="exercicios"></a>

## Exercícios - Operadores essenciais

1. Calcula e confirma no `console`: `"7" - 2`, `"7" + 2`, `Number("7") + 2`.
2. Cria uma função `ehPar(numero)` usando `%`.
3. Escreve uma expressão que indique se uma nota está entre 0 e 20.
4. Compara `"" == 0`, `"" === 0`, `false == 0` e `false === 0`. Comenta cada resultado.
5. Cria `valorPorDefeito(valor)` que usa `??` para devolver `"N/D"` apenas quando o valor é `null` ou `undefined`.
6. Reescreve uma condição longa dividindo-a em variáveis auxiliares.
7. Usa ternário para devolver `"Aprovado"` ou `"Reprovado"` a partir de uma nota.
8. Ordena uma lista de nomes com acentos usando `localeCompare("pt-PT")`.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçada a distinção entre coerção, igualdade estrita e valores por defeito.

![Footer](../Images/Footer.png)
