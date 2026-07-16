![Header](../Images/Header.png)

# JavaScript (12.º Ano) - Percurso do módulo

Este módulo organiza os fundamentos de JavaScript que vais usar em páginas web, projetos com Node.js e aplicações React.

A ideia principal é simples: primeiro aprendes a pensar com a linguagem, depois usas esse pensamento para manipular dados, reagir a eventos, comunicar com APIs e estruturar código em vários ficheiros.

## Pré-requisitos

- Saber criar e editar ficheiros `.js`, `.html` e `.css`.
- Ter um browser moderno com DevTools.
- Ter Node.js LTS instalado para exemplos de terminal quando forem usados.
- Conhecer HTML e CSS básicos ajuda nos capítulos de DOM, eventos e `fetch`.

## Como correr exemplos

### No browser

Para capítulos iniciais, podes abrir um ficheiro HTML com um `<script>` simples:

```html
<script type="module" src="./main.js"></script>
```

O modo `type="module"` ativa ES Modules, `import`/`export` e comportamento moderno.

### Em Node.js

Para exemplos de terminal:

```bash
node ficheiro.js
```

Se usares `import`/`export` em Node, define no `package.json`:

```json
{
    "type": "module"
}
```

## Ordem recomendada

1. [Variáveis e tipos](01-Variaveis-Tipos.md)
2. [Input/Output básico](02-IO-Basico.md)
3. [Operadores](03-Operadores.md)
4. [Strings](04-Strings.md)
5. [Controlo de fluxo](05-Controlo-Fluxo.md)
6. [Ciclos](06-Ciclos.md)
7. [Arrays](07-Arrays.md)
8. [Objetos e this](08-Objetos-e-this.md)
9. [Exceções](09-Excecoes.md)
10. [Funções](10-Funcoes.md)
11. [Arrays: métodos de alto nível](11-Arrays-HighOrder.md)
12. [Módulos ES](12-Modulos-ES.md)
13. [Classes e POO](13-POO-Classes.md)
14. [Assíncrono e Event Loop](14-Assincrono-EventLoop.md)
15. [DOM básico](15-DOM-Basico.md)
16. [Fetch/AJAX](16-Fetch-AJAX.md)
17. [Outros tópicos úteis no browser](17-Outros-Topicos.md)

## Ligações com o resto do repositório

- **React:** usa JavaScript moderno para componentes, estado, eventos e chamadas HTTP.
- **Node:** usa a mesma linguagem fora do browser para criar servidores, scripts e APIs.
- **MongoDB:** entra mais tarde como persistência, normalmente consumida a partir de Node/Express.
- **Fullstack:** junta browser, React, Node, APIs e base de dados num fluxo completo.

## Ideias que atravessam o módulo

- Converter dados cedo: entradas de `prompt`, formulários e query strings chegam como texto.
- Preferir `const`; usar `let` quando o valor muda; evitar `var` em código novo.
- Usar comparação estrita (`===`, `!==`) e conversões explícitas.
- Separar responsabilidades: funções pequenas, módulos claros e nomes descritivos.
- Tratar erros de forma visível e previsível.
- Evitar `innerHTML` com dados do utilizador; preferir `textContent`.
- Usar `async/await` para código assíncrono legível.
- Preferir funções puras quando possível: são mais fáceis de testar, reutilizar e levar para React ou Node.

## Troubleshooting rápido

- **`ReferenceError: x is not defined`:** a variável não existe nesse escopo ou foi usada antes de ser declarada.
- **`TypeError: ... is not a function`:** estás a chamar algo que não é função ou o valor é `undefined`.
- **`Cannot use import statement outside a module`:** falta `type="module"` no browser ou `"type": "module"` no Node.
- **`fetch` falha com CORS:** o servidor não autorizou o pedido; resolve-se no servidor ou com proxy de desenvolvimento.
- **Elemento DOM vem `null`:** o script correu antes do HTML existir ou o seletor está errado.
- **Números dão resultados estranhos:** confirma se converteste texto com `Number(...)` e se validaste com `Number.isNaN(...)`.

## Changelog

- **v2.0.0 - 2026-05-30**
    - Criado percurso geral do módulo de JavaScript.
    - Acrescentadas ligações explícitas a React, Node, MongoDB e Fullstack.
    - Incluído troubleshooting inicial para erros frequentes.

![Footer](../Images/Footer.png)
