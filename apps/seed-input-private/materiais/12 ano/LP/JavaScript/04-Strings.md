![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 04 · Strings

> **Objetivo deste ficheiro**
>
> - Criar, combinar, procurar e transformar texto.
> - Usar `template literals` para construir mensagens legíveis.
> - Perceber que strings são imutáveis.
> - Aplicar métodos como `slice`, `includes`, `replace`, `split`, `join` e `trim`.
> - Reconhecer cuidados com acentos, maiúsculas/minúsculas e dados do utilizador.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Strings como valores de texto](#sec-1)
- [2. [ESSENCIAL] Procurar, cortar e normalizar](#sec-2)
- [3. [ESSENCIAL] Dividir, juntar e substituir](#sec-3)
- [4. [ESSENCIAL+] Funções úteis com strings](#sec-4)
- [5. [EXTRA] Unicode, acentos e segurança](#sec-5)
- [Exercícios - Strings](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Quase todos os programas recebem e mostram texto: nomes, mensagens, pesquisas, URLs, emails e respostas de APIs. Saber tratar strings com cuidado evita erros em validação, filtros e interfaces.

- **Núcleo do tema:** criar, ler, cortar, procurar, substituir e limpar texto.
- **Aprofundamento:** normalização, acentos, emojis e funções reutilizáveis.
- **Ligação ao percurso:** strings entram em formulários, DOM, `fetch`, rotas, queries e validação.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Strings como valores de texto

### 1.1 Modelo mental

Uma string é uma sequência de caracteres.

```js
const nome = "Ana";
const frase = "JavaScript é útil";
```

Strings são **imutáveis**: os métodos devolvem novas strings, não alteram a original.

```js
const texto = "  Olá  ";
const limpo = texto.trim();

console.log(texto); // "  Olá  "
console.log(limpo); // "Olá"
```

### 1.2 Aspas e `template literals`

```js
const nome = "Marta";
const idade = 17;

const mensagem = `Olá, ${nome}. Tens ${idade} anos.`;
```

`template literals` são a forma mais limpa de juntar variáveis e texto.

### 1.3 Tamanho e acesso

```js
const palavra = "banana";

palavra.length; // 6
palavra[0]; // "b"
palavra[99]; // undefined
```

### 1.4 Checkpoint

- O que significa dizer que uma string é imutável?
- Porque é que `template literals` melhoram a leitura?
- O que acontece se acederes a um índice que não existe?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Procurar, cortar e normalizar

### 2.1 Procurar texto

```js
"JavaScript".includes("Script"); // true
"ficheiro.pdf".endsWith(".pdf"); // true
"index.html".startsWith("index"); // true
"banana".indexOf("na"); // 2
```

Para pesquisa sem distinguir maiúsculas/minúsculas:

```js
const termo = "ana";
const nome = "Ana Maria";

nome.toLowerCase().includes(termo.toLowerCase()); // true
```

### 2.2 Cortar com `slice`

```js
const palavra = "programar";

palavra.slice(0, 3); // "pro"
palavra.slice(-3); // "mar"
```

Prefere `slice` para cortes simples, porque aceita índices negativos de forma previsível.

### 2.3 Limpar espaços

```js
"  texto  ".trim(); // "texto"
"  texto  ".trimStart(); // "texto  "
"  texto  ".trimEnd(); // "  texto"
```

### 2.4 Erros comuns

- Esquecer `.trim()` antes de validar campo vazio.
- Usar `indexOf(...) > 0` e falhar quando o texto aparece na posição `0`.
- Comparar texto sem normalizar maiúsculas/minúsculas.

### 2.5 Checkpoint

- Qual é a diferença entre `includes` e `indexOf`?
- Porque é que `indexOf(...) >= 0` é mais seguro do que `> 0`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Dividir, juntar e substituir

### 3.1 `split` e `join`

```js
const nomes = "Ana, Bruno, Carla";

const lista = nomes.split(",").map((nome) => nome.trim());
const texto = lista.join(" | ");

console.log(lista); // ["Ana", "Bruno", "Carla"]
console.log(texto); // "Ana | Bruno | Carla"
```

### 3.2 `replace` e `replaceAll`

```js
"olá mundo".replace("mundo", "JavaScript"); // "olá JavaScript"
"ana banana".replaceAll("na", "NA"); // "aNA baNANA"
```

Com expressões regulares:

```js
"Tel: 912-345-678".replace(/\D+/g, ""); // "912345678"
```

### 3.3 Preencher e repetir

```js
"7".padStart(3, "0"); // "007"
"-".repeat(5); // "-----"
```

### 3.4 Checkpoint

- Quando usarias `split` seguido de `map(...trim)`?
- Qual é a diferença entre `replace` e `replaceAll`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Funções úteis com strings

### 4.1 Capitalizar palavras

```js
function capitalizarPalavras(frase) {
    return frase
        .trim()
        .split(/\s+/)
        .map((palavra) => palavra[0].toUpperCase() + palavra.slice(1).toLowerCase())
        .join(" ");
}

console.log(capitalizarPalavras("  ana maria  ")); // "Ana Maria"
```

### 4.2 Criar slug simples

```js
function slugifyPt(frase) {
    return frase
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

console.log(slugifyPt("Introdução ao JavaScript!")); // "introducao-ao-javascript"
```

### 4.3 Contar vogais

```js
function contarVogais(texto) {
    const resultado = texto.match(/[aeiouáéíóúàâêîôûãõ]/gi);
    return resultado ? resultado.length : 0;
}
```

### 4.4 Checkpoint

- Porque é que `slugifyPt` usa `normalize("NFD")`?
- Que valor devolve `match(...)` quando não encontra nada?

<a id="sec-5"></a>

## 5. [EXTRA] Unicode, acentos e segurança

### 5.1 Emojis e `length`

```js
const emoji = "🙂";

emoji.length; // 2
Array.from(emoji).length; // 1
```

Para contar símbolos como uma pessoa os vê, `Array.from` é mais útil do que `length`.

### 5.2 Ordenação com acentos

```js
["Álvaro", "Ana", "Élia"].sort((a, b) => a.localeCompare(b, "pt-PT"));
```

### 5.3 Texto vindo do utilizador

Quando mostrares texto numa página, prefere `textContent`.

```js
const p = document.createElement("p");
p.textContent = textoDoUtilizador;
```

Evita usar `innerHTML` com texto que veio de fora da aplicação.

<a id="exercicios"></a>

## Exercícios - Strings

1. Pede uma frase e mostra-a sem espaços nas pontas.
2. Cria `capitalizarPalavras(frase)` e testa com nomes em minúsculas.
3. Cria `obterApelido(nomeCompleto)` usando `lastIndexOf(" ")` e `slice`.
4. Cria `contarLetra(frase, letra)` sem distinguir maiúsculas/minúsculas.
5. Cria `mascararEmail("ana@example.com")`, devolvendo algo como `"a***@example.com"`.
6. Cria `apenasNumeros(texto)` para limpar números de telefone.
7. Cria `slugifyPt(titulo)` e testa com acentos, espaços e pontuação.
8. Ordena uma lista de nomes com acentos usando `localeCompare("pt-PT")`.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Removida linguagem operacional e reforçados exemplos seguros para texto vindo do utilizador.

![Footer](../Images/Footer.png)
