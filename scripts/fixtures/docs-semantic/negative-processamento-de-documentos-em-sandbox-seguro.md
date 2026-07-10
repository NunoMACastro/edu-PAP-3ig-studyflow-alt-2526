# Fixture inválida: timeout que não termina o parser

```ts
await Promise.race([parseDocument(), timeout()]);
```
