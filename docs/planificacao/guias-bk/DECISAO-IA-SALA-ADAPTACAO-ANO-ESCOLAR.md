# Decisão - IA da sala adapta explicações ao ano escolar

## Estado

Ativa desde `2026-07-02`.

## Decisão

A IA da sala deve adaptar a forma da resposta ao `Ano` do perfil do aluno que faz a pergunta. A aplicação não deve pedir nem usar idade exata para esta personalização.

O dado canónico para esta superfície é `StudentProfile.year`. O frontend da IA da sala continua a enviar apenas `question` e `sourceIds`; o backend carrega o perfil do aluno autenticado pela sessão.

## Motivação

O ano escolar é mais adequado do que idade para adaptação pedagógica, porque representa contexto curricular aproximado e evita recolha de um dado pessoal mais sensível. Um aluno do 4.º ano precisa de linguagem, exemplos e granularidade diferentes de um aluno de ensino superior, mesmo que a fonte factual seja a mesma.

## Regras

- A adaptação aplica-se ao aluno que pergunta, não à média da sala.
- O ano escolar altera apenas linguagem, exemplos, granularidade e profundidade.
- O ano escolar não altera fontes, permissões, membership ou factos.
- `RoomAiInteraction` não deve guardar ano escolar nem idade.
- A IA não deve mencionar idade nem dizer frases como "como tens X anos".
- Quando o ano não existe ou é ambíguo, a IA usa fallback claro e gradual.

## Mapeamento pedagógico

| `StudentProfile.year` | Contexto |
| --- | --- |
| `1.º ano` a `4.º ano` | `PRIMARY` |
| `5.º ano` a `9.º ano` | `LOWER_SECONDARY` |
| `10.º ano` a `12.º ano` | `UPPER_SECONDARY` |
| `faculdade`, `ensino superior`, `licenciatura`, `mestrado`, `doutoramento` | `HIGHER_EDUCATION` |
| vazio ou ambíguo | `UNKNOWN` |

## Relação com BKs

- `BK-MF0-03` fornece o campo `Ano` no perfil do aluno.
- `BK-MF1-04` usa esse campo na IA partilhada da sala.
- `BK-MF8-03` fecha `RNF36` distinguindo explicação individual por `LearningProfile` e IA da sala por `StudentProfile.year`.

## Validação mínima

- Teste unitário do resolver pedagógico.
- Teste de `RoomAiService` com `4.º ano`.
- Teste de `RoomAiService` com ensino superior.
- Teste de fallback sem perfil.
- Teste negativo onde fonte inventada pelo provider continua rejeitada.
