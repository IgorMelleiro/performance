import HistoryIcon from '@mui/icons-material/History';
import {
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEmployeeHistory } from '@/hooks/useEmployees';
import { EmptyState } from '@/components/PageHeader';
import {
  formatDate,
  formatEvaluationStatus,
} from '@/utils/formatters';

export default function EmployeeHistoryDialog({ open, employee, onClose }) {
  const { data, isLoading, isError } = useEmployeeHistory(employee?.id, open);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <HistoryIcon color="primary" />
          <span>Histórico de avaliações</span>
        </Stack>
        {employee && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {employee.name}
          </Typography>
        )}
        <IconButton
          aria-label="Fechar"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Typography color="text.secondary">Carregando histórico...</Typography>
        )}

        {isError && (
          <Typography color="error">
            Não foi possível carregar o histórico.
          </Typography>
        )}

        {!isLoading && !isError && data?.evaluations.length === 0 && (
          <EmptyState
            title="Nenhuma avaliação registrada"
            description="Este colaborador ainda não possui avaliações."
          />
        )}

        {!isLoading && !isError && data?.evaluations.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Período</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Template</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Nota</TableCell>
                <TableCell>Classificação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.evaluations.map((evaluation) => (
                <TableRow key={evaluation.id} hover>
                  <TableCell>{evaluation.period}</TableCell>
                  <TableCell>{formatDate(evaluation.evaluatedAt)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={
                        evaluation.isAutoEvaluation ? 'Autoavaliação' : 'Gestão'
                      }
                    />
                  </TableCell>
                  <TableCell>{evaluation.template.name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={formatEvaluationStatus(evaluation.status)}
                      color={
                        evaluation.status === 'COMPLETED' ? 'success' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {evaluation.finalScore?.toFixed(2) ?? '—'}
                  </TableCell>
                  <TableCell>{evaluation.classification ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
