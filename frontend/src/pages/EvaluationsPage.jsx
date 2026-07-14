import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader, { EmptyState } from '@/components/PageHeader';
import { PERMISSIONS } from '@/auth/permissions';
import { useEvaluationMutations } from '@/hooks/useEvaluationMutations';
import { useEvaluations } from '@/hooks/useEvaluations';
import { usePermissions } from '@/hooks/usePermissions';
import {
  formatDate,
  formatEvaluationStatus,
} from '@/utils/formatters';

const initialFilters = {
  search: '',
  status: 'all',
  page: 1,
  limit: 10,
};

export default function EvaluationsPage() {
  const navigate = useNavigate();
  const { can, canAny, isFuncionario, isGerente } = usePermissions();
  const canCreateManager = canAny([
    PERMISSIONS.EVALUATIONS_CREATE,
    PERMISSIONS.EVALUATIONS_CREATE_TEAM,
  ]);
  const canCreateSelf = can(PERMISSIONS.EVALUATIONS_CREATE_SELF);
  const canDelete = can(PERMISSIONS.EVALUATIONS_DELETE);
  const canEditDraft = canAny([
    PERMISSIONS.EVALUATIONS_UPDATE,
    PERMISSIONS.EVALUATIONS_UPDATE_TEAM,
    PERMISSIONS.EVALUATIONS_UPDATE_SELF,
  ]);

  const pageTitle = isFuncionario ? 'Minhas Avaliações' : 'Avaliações';
  const pageSubtitle = isFuncionario
    ? 'Histórico das suas avaliações e autoavaliações.'
    : isGerente
      ? 'Avaliações dos colaboradores dos seus times.'
      : 'Consulte, continue rascunhos ou crie novas avaliações.';

  const headerAction = canCreateManager ? (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => navigate('/avaliacoes/nova')}
    >
      Nova avaliação
    </Button>
  ) : canCreateSelf ? (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => navigate('/autoavaliacao')}
    >
      Nova autoavaliação
    </Button>
  ) : null;
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useEvaluations(filters);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((current) => {
        if (current.search === searchInput) {
          return current;
        }

        return { ...current, search: searchInput, page: 1 };
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const { deleteMutation } = useEvaluationMutations({
    onSuccess: (message) => {
      setDeleteTarget(null);
      showSnackbar(message);
    },
    onError: (error) => {
      showSnackbar(
        error?.response?.data?.message || 'Não foi possível excluir.',
        'error',
      );
    },
  });

  const evaluations = data?.data ?? [];
  const meta = data?.meta;
  const showEmptyState =
    !isLoading &&
    !isError &&
    evaluations.length === 0 &&
    filters.search === '' &&
    filters.status === 'all';

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        action={headerAction}
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar as avaliações.
        </Alert>
      )}

      {showEmptyState ? (
        <EmptyState
          title="Nenhuma avaliação encontrada"
          description={
            canCreateManager || canCreateSelf
              ? canCreateSelf && !canCreateManager
                ? 'Inicie sua autoavaliação para registrar seu desempenho.'
                : 'Crie a primeira avaliação de performance.'
              : 'Ainda não há avaliações no seu escopo.'
          }
        />
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Pesquisar"
                placeholder="Colaborador, período ou classificação"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value,
                      page: 1,
                    }))
                  }
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="DRAFT">Rascunho</MenuItem>
                  <MenuItem value="COMPLETED">Concluída</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Colaborador</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Nota final</TableCell>
                    <TableCell>Classificação</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography color="text.secondary">
                          Carregando avaliações...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading && evaluations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography color="text.secondary">
                          Nenhuma avaliação encontrada.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading &&
                    evaluations.map((evaluation) => {
                      const canEditThisDraft =
                        canEditDraft &&
                        evaluation.status === 'DRAFT' &&
                        (!isFuncionario || evaluation.isAutoEvaluation);

                      const editPath = evaluation.isAutoEvaluation
                        ? `/autoavaliacao/${evaluation.id}/edit`
                        : `/avaliacoes/${evaluation.id}/edit`;

                      return (
                        <TableRow key={evaluation.id} hover>
                          <TableCell>{evaluation.employee.name}</TableCell>
                          <TableCell>{evaluation.period}</TableCell>
                          <TableCell>
                            {formatDate(evaluation.evaluatedAt)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={formatEvaluationStatus(evaluation.status)}
                              color={
                                evaluation.status === 'COMPLETED'
                                  ? 'success'
                                  : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={
                                evaluation.isAutoEvaluation
                                  ? 'Autoavaliação'
                                  : 'Gestão'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {evaluation.finalScore?.toFixed(2) ?? '—'}
                          </TableCell>
                          <TableCell>
                            {evaluation.classification ?? '—'}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" justifyContent="flex-end">
                              <Tooltip title="Visualizar">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(`/avaliacoes/${evaluation.id}`)
                                  }
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {canEditThisDraft && (
                                <Tooltip title="Continuar">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(editPath)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {canDelete && evaluation.status === 'DRAFT' && (
                                <Tooltip title="Excluir rascunho">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDeleteTarget(evaluation)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={meta?.total ?? 0}
              page={filters.page - 1}
              rowsPerPage={filters.limit}
              rowsPerPageOptions={[5, 10, 20]}
              labelRowsPerPage="Itens por página"
              onPageChange={(_event, newPage) =>
                setFilters((current) => ({ ...current, page: newPage + 1 }))
              }
              onRowsPerPageChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  limit: Number(event.target.value),
                  page: 1,
                }))
              }
            />
          </Paper>
        </>
      )}

      {canDelete && (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Excluir rascunho"
          description={`Deseja excluir o rascunho de ${deleteTarget?.employee.name ?? 'esta avaliação'}?`}
          confirmLabel="Excluir"
          loading={deleteMutation.isPending}
          onClose={() => {
            if (!deleteMutation.isPending) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
