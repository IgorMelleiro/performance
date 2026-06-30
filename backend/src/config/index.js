import dotenv from 'dotenv';

dotenv.config();

function parseCorsOrigins(value) {
  if (!value?.trim()) {
    return ['http://localhost:5173'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN),
};

export function validateProductionEnv() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const missing = [];

  if (!process.env.DATABASE_URL?.trim()) {
    missing.push('DATABASE_URL');
  }

  if (!process.env.JWT_SECRET?.trim() || process.env.JWT_SECRET === 'dev-secret') {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    console.error('Variáveis de ambiente obrigatórias ausentes:');
    missing.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }
}
