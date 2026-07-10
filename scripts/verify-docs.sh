#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MANIFEST_SHA="$(
    node real_dev/api/src/scripts/generate-implementation-manifest.mjs |
        python3 -c 'import json, sys; print(json.load(sys.stdin)["sha256"])'
)"

python3 scripts/validate_planificacao_canonica.py --semantic-fixtures --json
python3 scripts/mark_historical_documents.py --check
python3 scripts/sync_real_dev_status.py --manifest "$MANIFEST_SHA" --check
python3 docs/planificacao/scripts/solver_replaneamento.py --self-test >/dev/null
python3 docs/planificacao/scripts/solver_replaneamento.py --check >/dev/null
python3 scripts/validate_planificacao_canonica.py --project studyflow --json
npm --prefix real_dev/api run technical-map:check
npm --prefix real_dev/api run function-inventory:check
npm --prefix real_dev/api run secrets:scan

if rg -n '[[:blank:]]+$' docs real_dev/docs \
    real_dev/api/.env.example real_dev/web/.env.example real_dev/web/tests/e2e/README.md; then
    echo "docs:verify FAIL: trailing whitespace" >&2
    exit 1
fi

echo "docs:verify PASS: estrutura, semântica, geradores, links, manifesto e secrets"
