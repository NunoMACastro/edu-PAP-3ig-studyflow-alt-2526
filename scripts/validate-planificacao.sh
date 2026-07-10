#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 scripts/validate_planificacao_canonica.py --semantic-fixtures --json
python3 scripts/validate_planificacao_canonica.py --project studyflow --json
