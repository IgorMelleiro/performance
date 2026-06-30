import {
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export default function SummaryStep({ summary, employee, period, evaluatedAt }) {
  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumo da avaliação
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Revise os resultados antes de concluir.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
          <Typography variant="body2">
            <strong>Colaborador:</strong> {employee?.name || '—'}
          </Typography>
          <Typography variant="body2">
            <strong>Período:</strong> {period}
          </Typography>
          <Typography variant="body2">
            <strong>Data:</strong>{' '}
            {evaluatedAt
              ? new Intl.DateTimeFormat('pt-BR').format(new Date(evaluatedAt))
              : '—'}
          </Typography>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Categoria</TableCell>
              <TableCell>Peso</TableCell>
              <TableCell>Média</TableCell>
              <TableCell>Pontuação ponderada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.categories.map((category) => (
              <TableRow key={category.categoryId}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.weight}%</TableCell>
                <TableCell>
                  {category.average?.toFixed(2) ?? '—'}
                </TableCell>
                <TableCell>
                  {category.weightedScore?.toFixed(2) ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3}>
          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Nota final
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {summary.finalScore.toFixed(2)}
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Classificação automática
            </Typography>
            <Chip
              label={summary.classification}
              color="primary"
              sx={{ mt: 1 }}
            />
          </Paper>
        </Stack>
      </Paper>
    </Stack>
  );
}
