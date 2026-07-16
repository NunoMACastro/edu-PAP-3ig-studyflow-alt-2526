# IA da sala adaptada ao ano escolar

## Objetivo

A IA da sala deve adaptar a forma da resposta ao ano escolar do aluno que faz a pergunta, sem alterar fontes, factos, permissoes ou membership.

Esta feature usa o campo `Ano` do perfil do aluno (`StudentProfile.year`). Nao usa idade exata nem pede data de nascimento.

## Fluxo de dados

1. O aluno preenche `Ano` em `/app/perfil`.
2. O aluno pergunta em `/app/salas/:id/ia`.
3. O frontend envia apenas `question` e `sourceIds` opcionais para `POST /api/study-rooms/:roomId/ai/answers`.
4. O backend valida membership da sala.
5. O backend recolhe apenas fontes processaveis autorizadas da sala.
6. O backend carrega o perfil do aluno autenticado com `StudentProfileService.getMyProfile(actor.id)`.
7. `resolveRoomAiPedagogicalContext(...)` transforma `year` num contexto pedagogico seguro.
8. `buildRoomAiPrompt(...)` injeta esse contexto no prompt como orientacao interna.
9. A resposta e validada contra as fontes autorizadas antes de ser persistida.

## Mapeamento do ano escolar

| Entrada no perfil | Contexto interno | Orientacao |
| --- | --- | --- |
| `1.º ano` a `4.º ano` | `PRIMARY` | Frases curtas, passos pequenos, exemplos concretos e vocabulario simples. |
| `5.º ano` a `9.º ano` | `LOWER_SECONDARY` | Explicacao progressiva, conceitos definidos e exemplos escolares. |
| `10.º ano` a `12.º ano` | `UPPER_SECONDARY` | Mais detalhe, ligacoes entre conceitos e linguagem de secundario. |
| `faculdade`, `ensino superior`, `licenciatura`, `mestrado`, `doutoramento` | `HIGHER_EDUCATION` | Linguagem tecnica, abstracao e justificacao mais formal. |
| Vazio ou ambiguo | `UNKNOWN` | Explicacao clara, gradual e inclusiva, sem assumir idade. |

## Privacidade e seguranca

- O frontend nunca envia ano escolar, idade ou nivel no pedido da IA da sala.
- O backend resolve o perfil a partir da sessao autenticada.
- O ano escolar nao e gravado em `RoomAiInteraction`.
- A IA recebe orientacao para nao mencionar idade nem dizer frases como "como tens X anos".
- O contexto pedagogico adapta apenas linguagem, granularidade, exemplos e profundidade.
- As fontes continuam limitadas por membership e `RoomShare.usableByAi`.

## Exemplos

Pergunta: `Porque e que 2+2 sao 4?`

Para `4.º ano`, a resposta deve tender a usar passos pequenos e exemplos concretos:

> Se tens 2 lapis e juntas mais 2 lapis, contas 1, 2, 3, 4. Por isso, 2+2 faz 4.

Para `ensino superior`, a resposta pode ser mais formal:

> Em aritmetica usual, `2` representa o sucessor de `1`; somar `2+2` corresponde a aplicar duas unidades a `2`, obtendo `4`.

Os exemplos acima explicam o estilo esperado. A resposta real deve continuar baseada nas fontes autorizadas da sala.

## Validacao

Comandos recomendados:

```bash
npm --prefix real_dev/api test -- room-ai.service.spec.ts --runInBand
npm --prefix real_dev/api test -- room-ai-pedagogy.spec.ts --runInBand
npm --prefix real_dev/api test -- export-technical-map.spec.ts --runInBand
npm --prefix real_dev/api run build
bash scripts/validate-planificacao.sh
```
