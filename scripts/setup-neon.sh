#!/usr/bin/env bash
# Configura o banco Neon: migrations + seed opcional
# Uso:
#   DATABASE_URL="postgresql://..." ./scripts/setup-neon.sh
#   DATABASE_URL="..." ./scripts/setup-neon.sh --seed

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Erro: defina DATABASE_URL com a connection string do Neon."
  echo ""
  echo "Exemplo:"
  echo '  DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" ./scripts/setup-neon.sh --seed'
  exit 1
fi

# Neon exige SSL
if [[ "$DATABASE_URL" != *"sslmode="* ]]; then
  if [[ "$DATABASE_URL" == *"?"* ]]; then
    export DATABASE_URL="${DATABASE_URL}&sslmode=require"
  else
    export DATABASE_URL="${DATABASE_URL}?sslmode=require"
  fi
  echo "→ Adicionado sslmode=require à URL"
fi

cd "$BACKEND"

echo "→ Gerando Prisma Client..."
npm run prisma:generate

echo "→ Aplicando migrations..."
npm run prisma:migrate:deploy

if [[ "${1:-}" == "--seed" ]]; then
  echo "→ Executando seed (usuário RH + template)..."
  npm run prisma:seed
fi

echo ""
echo "✓ Banco Neon configurado com sucesso!"
echo ""
echo "Teste a conexão:"
echo '  DATABASE_URL="..." node -e "import pg from '\''pg'\''; const p=new pg.Pool({connectionString:process.env.DATABASE_URL}); p.query('\''SELECT 1'\'').then(()=>{console.log('\''OK'\'');p.end()}).catch(e=>{console.error(e);p.end()})"'
