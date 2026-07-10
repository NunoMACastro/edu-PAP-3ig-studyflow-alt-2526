export function ColorTest() {
  return (
    <div className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">Teste de Paleta de Cores StudyFlow</h1>

      {/* Primary - Azul noite #0B161A */}
      <div>
        <h2 className="text-xl font-bold mb-2">Primary (Azul noite #0B161A)</h2>
        <div className="flex gap-4">
          <div className="bg-primary text-primary-foreground p-4 rounded">
            bg-primary + text-primary-foreground
          </div>
          <div className="text-primary p-4">
            text-primary
          </div>
          <div className="border-2 border-primary p-4 rounded">
            border-primary
          </div>
        </div>
      </div>

      {/* Accent - Azul vívido #1473E6 */}
      <div>
        <h2 className="text-xl font-bold mb-2">Accent (Azul vívido #1473E6)</h2>
        <div className="flex gap-4">
          <div className="bg-accent text-accent-foreground p-4 rounded">
            bg-accent + text-accent-foreground
          </div>
          <div className="text-accent p-4">
            text-accent
          </div>
          <button className="px-4 py-2 bg-accent text-white rounded hover:opacity-90">
            Botão Accent
          </button>
        </div>
      </div>

      {/* Secondary - Azul petróleo escuro #193138 */}
      <div>
        <h2 className="text-xl font-bold mb-2">Secondary (Azul petróleo escuro #193138)</h2>
        <div className="flex gap-4">
          <div className="bg-secondary text-secondary-foreground p-4 rounded">
            bg-secondary + text-secondary-foreground
          </div>
          <div className="text-secondary p-4 bg-white">
            text-secondary
          </div>
        </div>
      </div>

      {/* Destructive - Castanho avermelhado #9E5252 */}
      <div>
        <h2 className="text-xl font-bold mb-2">Destructive (Castanho avermelhado #9E5252)</h2>
        <div className="flex gap-4">
          <div className="bg-destructive text-destructive-foreground p-4 rounded">
            bg-destructive + text-destructive-foreground
          </div>
          <div className="text-destructive p-4">
            text-destructive
          </div>
          <button className="px-4 py-2 bg-destructive text-white rounded hover:opacity-90">
            Botão Destructive
          </button>
        </div>
      </div>

      {/* Border - Cinzento-claro #E0E0E0 */}
      <div>
        <h2 className="text-xl font-bold mb-2">Border (Cinzento-claro #E0E0E0)</h2>
        <div className="flex gap-4">
          <div className="border-2 border-border p-4 rounded bg-white">
            border-border
          </div>
          <div className="bg-white border-2 border-border rounded-lg p-6">
            Card com border
          </div>
        </div>
      </div>

      {/* Muted */}
      <div>
        <h2 className="text-xl font-bold mb-2">Muted (Backgrounds secundários)</h2>
        <div className="flex gap-4">
          <div className="bg-muted p-4 rounded">
            bg-muted
          </div>
          <div className="text-muted-foreground p-4 bg-white">
            text-muted-foreground
          </div>
        </div>
      </div>

      {/* Exemplo de Card */}
      <div>
        <h2 className="text-xl font-bold mb-4">Exemplo de Card</h2>
        <div className="bg-white border-2 border-border rounded-lg p-6 max-w-md">
          <h3 className="text-xl font-bold text-primary mb-2">Título do Card</h3>
          <p className="text-muted-foreground mb-4">
            Descrição com texto secundário
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-accent text-white rounded hover:opacity-90">
              Ação Principal
            </button>
            <button className="px-4 py-2 border border-border rounded hover:bg-muted">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
