import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader, { EmptyState } from '@/components/PageHeader';
import { useDashboardStats } from '@/hooks/useDashboard';
import {
  formatDate,
  formatEvaluationStatus,
} from '@/utils/formatters';

function StatCard({ title, value, subtitle, loading }) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={80} height={48} sx={{ mt: 1 }} />
      ) : (
        <Typography variant="h4" fontWeight={700} mt={1}>
          {value}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboardStats();

  const cards = [
    {
      title: 'Colaboradores',
      value: data?.activeEmployees ?? 0,
      subtitle: data
        ? `${data.totalEmployees} cadastrados no total`
        : undefined,
    },
    {
      title: 'Avaliações pendentes',
      value: data?.pendingEvaluations ?? 0,
      subtitle: 'Rascunhos em andamento',
    },
    {
      title: 'Avaliações concluídas',
      value: data?.completedEvaluations ?? 0,
      subtitle: 'Ciclo finalizado',
    },
    {
      title: 'Média geral',
      value:
        data?.averageScore !== null && data?.averageScore !== undefined
          ? data.averageScore.toFixed(2)
          : '—',
      subtitle: 'Média das avaliações concluídas',
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do ciclo de avaliações."
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/colaboradores')}
            >
              Novo colaborador
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate('/avaliacoes')}
            >
              Ver avaliações
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/avaliacoes/nova')}
            >
              Nova avaliação
            </Button>
          </Stack>
        }
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar os dados do dashboard.
        </Alert>
      )}

      <Grid container spacing={2} mb={3}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              loading={isLoading}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Avaliações recentes
            </Typography>

            {isLoading && (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            )}

            {!isLoading && data?.recentEvaluations.length === 0 && (
              <EmptyState
                title="Nenhuma avaliação registrada"
                description="Crie a primeira avaliação para acompanhar os resultados aqui."
              />
            )}

            {!isLoading && data?.recentEvaluations.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Colaborador</TableCell>
                      <TableCell>Período</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Nota</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentEvaluations.map((evaluation) => (
                      <TableRow key={evaluation.id} hover>
                        <TableCell>{evaluation.employeeName}</TableCell>
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
                          {evaluation.finalScore?.toFixed(2) ?? '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() =>
                              navigate(`/avaliacoes/${evaluation.id}`)
                            }
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Distribuição por classificação
            </Typography>

            {isLoading && (
              <Stack spacing={1}>
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} variant="rounded" height={40} />
                ))}
              </Stack>
            )}

            {!isLoading && data?.classificationBreakdown.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Conclua avaliações para visualizar a distribuição.
              </Typography>
            )}

            {!isLoading && data?.classificationBreakdown.length > 0 && (
              <Stack spacing={1.5}>
                {data.classificationBreakdown.map((item) => (
                  <Box
                    key={item.classification}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2">{item.classification}</Typography>
                    <Chip size="small" label={item.count} color="primary" />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
