![Header](../Images/Header.png)

# JavaScript (12.º Ano) - 13 · Classes e POO

> **Objetivo deste ficheiro**
>
> - Perceber classes como moldes para criar objetos.
> - Usar `constructor`, métodos, getters, setters e campos privados.
> - Distinguir métodos de instância de métodos `static`.
> - Usar herança apenas quando a relação faz sentido.
> - Preferir composição quando ela simplifica o desenho do código.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Classe, objeto e instância](#sec-1)
- [2. [ESSENCIAL] Encapsulamento com `#`, getters e setters](#sec-2)
- [3. [ESSENCIAL] Métodos `static` e validação](#sec-3)
- [4. [ESSENCIAL+] Herança vs composição](#sec-4)
- [5. [EXTRA] `this`, JSON, fábricas e diagnóstico](#sec-5)
- [Exercícios - Classes e POO](#exercicios)
- [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

JavaScript não obriga a escrever código orientado a objetos, mas classes são úteis quando queres representar entidades com dados e comportamento juntos.

- **Núcleo do tema:** classe, instância, `constructor`, métodos e `this`.
- **Aprofundamento:** encapsulamento, herança, composição e serialização.
- **Ligação ao percurso:** classes ajudam a perceber modelos, erros personalizados, serviços e algumas bibliotecas.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Classe, objeto e instância

### 1.1 Modelo mental

Uma classe é um molde. Uma instância é um objeto criado a partir desse molde.

```js
class Pessoa {
    constructor(nome, idade) {
        this.nome = nome;
        this.idade = idade;
    }

    apresentar() {
        return `${this.nome} tem ${this.idade} anos.`;
    }
}

const ana = new Pessoa("Ana", 17);
console.log(ana.apresentar());
```

### 1.2 O papel de `new`

`new Pessoa(...)`:

1. cria um novo objeto;
2. chama o `constructor`;
3. liga `this` à nova instância;
4. devolve a instância.

### 1.3 Métodos vivem na classe

Cada instância tem os seus dados, mas os métodos são partilhados pelo protótipo da classe.

```js
const a = new Pessoa("Ana", 17);
const b = new Pessoa("Bruno", 18);

console.log(a.apresentar());
console.log(b.apresentar());
```

### 1.4 Erros comuns

- Esquecer `new`.
- Tentar usar `this` antes de `super(...)` numa subclasse.
- Colocar demasiada lógica dentro do `constructor`.

### 1.5 Checkpoint

- O que é uma instância?
- Para que serve o `constructor`?
- O que representa `this` dentro de um método de instância?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Encapsulamento com `#`, getters e setters

### 2.1 Campo privado

Campos começados por `#` só podem ser usados dentro da classe.

```js
class Conta {
    #saldo = 0;

    depositar(valor) {
        if (valor <= 0) throw new RangeError("Valor inválido");
        this.#saldo += valor;
    }

    get saldo() {
        return this.#saldo;
    }
}

const conta = new Conta();
conta.depositar(50);
console.log(conta.saldo); // 50
```

### 2.2 Getter e setter

```js
class Produto {
    #preco;

    constructor(nome, preco) {
        this.nome = nome;
        this.preco = preco;
    }

    get preco() {
        return this.#preco;
    }

    set preco(valor) {
        if (typeof valor !== "number" || valor < 0) {
            throw new RangeError("Preço inválido");
        }

        this.#preco = valor;
    }
}
```

O setter valida antes de guardar.

### 2.3 Encapsular não é esconder tudo

Encapsular é controlar como o estado muda.

```js
produto.preco = 10; // usa o setter
```

O exterior usa uma API simples; a classe protege as regras internas.

### 2.4 Checkpoint

- Para que servem campos privados?
- Qual é a vantagem de validar num setter?
- Porque é que `get saldo()` pode expor leitura sem permitir escrita direta?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Métodos `static` e validação

### 3.1 Métodos da classe

`static` pertence à classe, não à instância.

```js
class Conversor {
    static eurParaUsd(valor, taxa = 1.08) {
        return valor * taxa;
    }
}

console.log(Conversor.eurParaUsd(10));
```

### 3.2 Fábricas estáticas

```js
class Tarefa {
    constructor(titulo, feito = false) {
        this.titulo = titulo;
        this.feito = feito;
    }

    static criarPorTitulo(titulo) {
        if (titulo.trim() === "") {
            throw new RangeError("Título em falta");
        }

        return new Tarefa(titulo.trim());
    }
}
```

### 3.3 Checkpoint

- Porque é que `static` não precisa de instância?
- Quando uma fábrica estática pode ser útil?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Herança vs composição

### 4.1 Herança: relação “é um”

```js
class Pessoa {
    constructor(nome) {
        this.nome = nome;
    }

    apresentar() {
        return `Sou ${this.nome}`;
    }
}

class Utilizador extends Pessoa {
    constructor(nome, email) {
        super(nome);
        this.email = email;
    }

    apresentar() {
        return `${super.apresentar()} e uso ${this.email}`;
    }
}
```

Usa herança quando a subclasse pode ser usada no lugar da classe base sem surpresa.

### 4.2 Composição: relação “tem um”

```js
class Temporizador {
    #id = null;

    iniciar(ms, callback) {
        this.parar();
        this.#id = setInterval(callback, ms);
    }

    parar() {
        if (this.#id !== null) {
            clearInterval(this.#id);
            this.#id = null;
        }
    }
}

class Relogio {
    #temporizador = new Temporizador();
    #segundos = 0;

    iniciar() {
        this.#temporizador.iniciar(1000, () => {
            this.#segundos++;
        });
    }

    parar() {
        this.#temporizador.parar();
    }

    get segundos() {
        return this.#segundos;
    }
}
```

Composição costuma ser mais flexível do que árvores grandes de herança.

### 4.3 Checkpoint

- Que pergunta ajuda a decidir herança?
- Que pergunta ajuda a decidir composição?
- Porque é que herança em excesso pode complicar um projeto?

<a id="sec-5"></a>

## 5. [EXTRA] `this`, JSON, fábricas e diagnóstico

### 5.1 `this` em callbacks

Ao passar um método como callback, podes perder o `this`.

```js
class BotaoLogico {
    constructor() {
        this.contador = 0;
    }

    clicar = () => {
        this.contador++;
    };
}
```

Campos com arrow function podem ser úteis quando o método vai ser usado como callback.

### 5.2 JSON e classes

`JSON.stringify` não guarda métodos nem campos privados.

```js
class Pessoa {
    #idade;

    constructor(nome, idade) {
        this.nome = nome;
        this.#idade = idade;
    }

    toJSON() {
        return { nome: this.nome, idade: this.#idade };
    }
}
```

### 5.3 Fábrica sem classe

```js
function criarContador(inicial = 0) {
    let valor = inicial;

    return {
        incrementar() {
            valor++;
        },
        get valor() {
            return valor;
        },
    };
}
```

Classes não são obrigatórias. Usa-as quando melhoram a estrutura.

### 5.4 Diagnóstico rápido

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| `this` é `undefined` | Método perdeu contexto | Usar chamada correta, `bind` ou arrow field |
| Campo privado dá erro | Acesso fora da classe | Criar método/getter público |
| `super` dá erro | Usado depois de `this` | Chamar `super(...)` primeiro |
| JSON não inclui dados | Campos privados/métodos | Criar `toJSON()` |
| Hierarquia confusa | Herança mal escolhida | Preferir composição |

<a id="exercicios"></a>

## Exercícios - Classes e POO

1. Cria `class Pessoa` com `nome`, `idade` e `apresentar()`.
2. Cria `class Conta` com `#saldo`, `depositar`, `levantar` e `get saldo`.
3. Cria `class Produto` com setter que rejeita preço negativo.
4. Cria `class Conversor` com métodos `static` para EUR/USD e USD/EUR.
5. Cria `class Tarefa` com fábrica estática `criarPorTitulo`.
6. Cria uma herança simples `Pessoa -> Utilizador`.
7. Cria uma composição em que `Relogio` usa internamente `Temporizador`.
8. Adiciona `toJSON()` a uma classe com campos privados.

<a id="changelog"></a>

## Changelog

- **v2.0.0 - 2026-05-30**
    - Reestruturado com objetivos, índice, enquadramento, níveis, checkpoints e exercícios.
    - Reforçada a diferença entre encapsulamento, herança e composição.

![Footer](../Images/Footer.png)
