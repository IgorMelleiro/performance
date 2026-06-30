const required = ['DATABASE_URL', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error('Variáveis de ambiente obrigatórias ausentes:');
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error('');
  console.error('No Railway: Service → Variables → adicione DATABASE_URL (Neon) e JWT_SECRET.');
  process.exit(1);
}
