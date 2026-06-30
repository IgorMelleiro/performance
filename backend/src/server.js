import app from './app.js';
import { config, validateProductionEnv } from './config/index.js';

validateProductionEnv();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`API rodando na porta ${config.port}`);
  console.log(`CORS origins: ${config.corsOrigin.join(', ')}`);
});
