import {
  Alert,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PageHeader, { EmptyState } from '@/components/PageHeader';
import { useTemplates } from '@/hooks/useEvaluations';
import { formatDate } from '@/utils/formatters';

export default function TemplatesPage() {
  const { data: templates = [], isLoading, isError } = useTemplates();

  return (
    <>
      <PageHeader
        title="Templates"
        subtitle="Modelos de avaliação disponíveis no sistema."
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar os templates.
        </Alert>
      )}

      {isLoading && (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
        </Stack>
      )}

      {!isLoading && templates.length === 0 && (
        <EmptyState
          title="Nenhum template ativo"
          description="Cadastre um template no banco para usar no fluxo de avaliações."
        />
      )}

      {!isLoading && templates.length > 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Criado em</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{template.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={template.active ? 'Ativo' : 'Inativo'}
                        color={template.active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(template.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
}
