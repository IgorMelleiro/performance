export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' });
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message =
    err.isOperational || statusCode < 500
      ? err.message
      : 'Erro interno do servidor.';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
}
