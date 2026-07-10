# Fixture inválida: health sempre 200

```ts
@Get("health")
@HttpCode(200)
health() { return { status: "ok" }; }
```
