import AddIcon from '@mui/icons-material/Add';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupsIcon from '@mui/icons-material/Groups';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
import { PERMISSIONS } from '@/auth/permissions';
import { useDashboardStats } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';
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

function ClassificationPanel({ loading, items }) {
  return (
    <Paper sx={{ p: 3, height: '100%', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Distribuição por classificação
      </Typography>

      {loading && (
        <Stack spacing={1}>
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} variant="rounded" height={40} />
          ))}
        </Stack>
      )}

      {!loading && (!items || items.length === 0) && (
        <Typography variant="body2" color="text.secondary">
          Conclua avaliações para visualizar a distribuição.
        </Typography>
      )}

      {!loading && items?.length > 0 && (
        <Stack spacing={1.5}>
          {items.map((item) => (
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
  );
}

function RecentEvaluationsPanel({
  loading,
  evaluations,
  emptyDescription,
  navigate,
}) {
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Avaliações recentes
      </Typography>

      {loading && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {!loading && evaluations?.length === 0 && (
        <EmptyState
          title="Nenhuma avaliação registrada"
          description={emptyDescription}
        />
      )}

      {!loading && evaluations?.length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Colaborador</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Nota</TableCell>
                <TableCell align="right">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow key={evaluation.id} hover>
                  <TableCell>{evaluation.employeeName}</TableCell>
                  <TableCell>{evaluation.period}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={
                        evaluation.isAutoEvaluation ? 'Autoavaliação' : 'Gestão'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={formatEvaluationStatus(evaluation.status)}
                      color={
                        evaluation.status === 'COMPLETED' ? 'success' : 'warning'
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
                      onClick={() => navigate(`/avaliacoes/${evaluation.id}`)}
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
  );
}

function RhDashboard({ data, loading, navigate, canCreate }) {
  const cards = [
    {
      title: 'Colaboradores ativos',
      value: data?.activeEmployees ?? 0,
      subtitle: data
        ? `${data.totalEmployees} cadastrados no total`
        : undefined,
    },
    {
      title: 'Times',
      value: data?.totalTeams ?? 0,
      subtitle: 'Times cadastrados',
    },
    {
      title: 'Avaliações pendentes',
      value: data?.pendingEvaluations ?? 0,
      subtitle: 'Rascunhos em andamento',
    },
    {
      title: 'Média geral',
      value:
        data?.averageScore !== null && data?.averageScore !== undefined
          ? data.averageScore.toFixed(2)
          : '—',
      subtitle: `${data?.completedEvaluations ?? 0} concluídas`,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral administrativa do ciclo de avaliações."
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/colaboradores')}
            >
              Colaboradores
            </Button>
            <Button
              variant="outlined"
              startIcon={<GroupsIcon />}
              onClick={() => navigate('/times')}
            >
              Times
            </Button>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/avaliacoes/nova')}
              >
                Nova avaliação
              </Button>
            )}
          </Stack>
        }
      />

      <Grid container spacing={2} mb={3}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RecentEvaluationsPanel
            loading={loading}
            evaluations={data?.recentEvaluations}
            emptyDescription="Crie a primeira avaliação para acompanhar os resultados aqui."
            navigate={navigate}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ClassificationPanel
            loading={loading}
            items={data?.classificationBreakdown}
          />
        </Grid>
      </Grid>
    </>
  );
}

function GerenteDashboard({ data, loading, navigate }) {
  const cards = [
    {
      title: 'Colaboradores sob gestão',
      value: data?.activeEmployees ?? 0,
      subtitle: data
        ? `${data.totalEmployees} no total dos seus times`
        : undefined,
    },
    {
      title: 'Avaliações pendentes',
      value: data?.pendingEvaluations ?? 0,
      subtitle: 'Rascunhos da equipe',
    },
    {
      title: 'Avaliações concluídas',
      value: data?.completedEvaluations ?? 0,
      subtitle: 'Ciclos finalizados da equipe',
    },
    {
      title: 'Média da equipe',
      value:
        data?.averageScore !== null && data?.averageScore !== undefined
          ? data.averageScore.toFixed(2)
          : '—',
      subtitle: 'Média das concluídas',
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Indicadores dos times sob sua gestão."
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/colaboradores')}
            >
              Minha equipe
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

      <Grid container spacing={2} mb={3}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Meus times
            </Typography>
            {loading && <Skeleton variant="rounded" height={80} />}
            {!loading && data?.managedTeams?.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Você ainda não está vinculado a um time.
              </Typography>
            )}
            {!loading &&
              data?.managedTeams?.map((team) => (
                <Box
                  key={team.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2">{team.name}</Typography>
                  <Chip size="small" label={`${team.membersCount} membros`} />
                </Box>
              ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <ClassificationPanel
            loading={loading}
            items={data?.classificationBreakdown}
          />
        </Grid>
      </Grid>

      <RecentEvaluationsPanel
        loading={loading}
        evaluations={data?.recentEvaluations}
        emptyDescription="Ainda não há avaliações nos seus times."
        navigate={navigate}
      />
    </>
  );
}

function FuncionarioDashboard({ data, loading, navigate }) {
  if (!loading && data && data.linked === false) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          subtitle="Acompanhe suas avaliações e feedbacks."
        />
        <Alert severity="warning">
          Sua conta ainda não está vinculada a um colaborador. Solicite ao RH
          para liberar o dashboard pessoal.
        </Alert>
      </>
    );
  }

  const cards = [
    {
      title: 'Última avaliação',
      value: data?.lastEvaluation?.finalScore?.toFixed(2) ?? '—',
      subtitle: data?.lastEvaluation
        ? `${data.lastEvaluation.period} · ${
            data.lastEvaluation.isAutoEvaluation ? 'Autoavaliação' : 'Gestão'
          }`
        : 'Nenhuma avaliação ainda',
    },
    {
      title: 'Nota média',
      value:
        data?.averageScore !== null && data?.averageScore !== undefined
          ? data.averageScore.toFixed(2)
          : '—',
      subtitle: `${data?.completedEvaluations ?? 0} avaliações concluídas`,
    },
    {
      title: 'Autoavaliações',
      value: data?.completedAutoEvaluations ?? 0,
      subtitle: `${data?.pendingAutoEvaluations ?? 0} em rascunho`,
    },
    {
      title: 'Feedback recebido',
      value: data?.lastFeedback ? 'Sim' : '—',
      subtitle: data?.lastFeedback
        ? `Último: ${data.lastFeedback.period}`
        : 'Aguardando avaliação do gestor',
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Seu desempenho, histórico e autoavaliações."
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/avaliacoes')}
            >
              Histórico
            </Button>
            <Button
              variant="contained"
              startIcon={<AssignmentIndIcon />}
              onClick={() => navigate('/autoavaliacao')}
            >
              Autoavaliação
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2} mb={3}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Feedback recebido
            </Typography>
            {loading && <Skeleton variant="rounded" height={120} />}
            {!loading && !data?.lastFeedback && (
              <Typography variant="body2" color="text.secondary">
                Ainda não há feedback de gestão disponível.
              </Typography>
            )}
            {!loading && data?.lastFeedback && (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {data.lastFeedback.period}
                  {data.lastFeedback.evaluatorName
                    ? ` · ${data.lastFeedback.evaluatorName}`
                    : ''}
                  {' · '}
                  {formatDate(data.lastFeedback.evaluatedAt)}
                </Typography>
                <Divider />
                <Box>
                  <Typography variant="subtitle2">Pontos fortes</Typography>
                  <Typography variant="body2">
                    {data.lastFeedback.strengths}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Melhorias</Typography>
                  <Typography variant="body2">
                    {data.lastFeedback.improvements}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Recomendações</Typography>
                  <Typography variant="body2">
                    {data.lastFeedback.recommendations}
                  </Typography>
                </Box>
                {data.lastManagerEvaluation && (
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() =>
                      navigate(
                        `/avaliacoes/${data.lastManagerEvaluation.id}`,
                      )
                    }
                  >
                    Ver avaliação completa
                  </Button>
                )}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <RecentEvaluationsPanel
            loading={loading}
            evaluations={data?.recentEvaluations}
            emptyDescription="Inicie uma autoavaliação ou aguarde a avaliação do gestor."
            navigate={navigate}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { can, isRh, isGerente } = usePermissions();
  const { data, isLoading, isError } = useDashboardStats();
  const canCreate =
    can(PERMISSIONS.EVALUATIONS_CREATE) ||
    can(PERMISSIONS.EVALUATIONS_CREATE_TEAM);

  const role = data?.role || (isRh ? 'RH' : isGerente ? 'GERENTE' : 'FUNCIONARIO');

  return (
    <>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar os dados do dashboard.
        </Alert>
      )}

      {role === 'RH' && (
        <RhDashboard
          data={data}
          loading={isLoading}
          navigate={navigate}
          canCreate={canCreate}
        />
      )}

      {role === 'GERENTE' && (
        <GerenteDashboard data={data} loading={isLoading} navigate={navigate} />
      )}

      {role === 'FUNCIONARIO' && (
        <FuncionarioDashboard
          data={data}
          loading={isLoading}
          navigate={navigate}
        />
      )}
    </>
  );
}
