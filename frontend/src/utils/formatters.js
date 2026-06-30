export function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

export function formatStatus(active) {
  return active ? 'Ativo' : 'Inativo';
}

export function formatEvaluationStatus(status) {
  if (status === 'COMPLETED') {
    return 'Concluída';
  }

  if (status === 'DRAFT') {
    return 'Rascunho';
  }

  return status || '—';
}
