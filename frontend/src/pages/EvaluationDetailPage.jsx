import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { usePermissions } from '@/hooks/usePermissions';
import { useEvaluation } from '@/hooks/useEvaluations';
import {
  formatDate,
  formatEvaluationStatus,
} from '@/utils/formatters';
import { calculateEvaluationSummary } from '@/utils/evaluationCalculator';

export default function EvaluationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isFuncionario } = usePermissions();
  const { data: evaluation, isLoading, isError } = useEvaluation(id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !evaluation) {
    return <Alert severity="error">Avaliação não encontrada.</Alert>;
  }

  const summary = calculateEvaluationSummary(
    evaluation.template,
    evaluation.answers,
  );

  const canContinue =
    evaluation.status === 'DRAFT' &&
    (!isFuncionario || evaluation.isAutoEvaluation);

  const editPath = evaluation.isAutoEvaluation
    ? `/autoavaliacao/${evaluation.id}/edit`
    : `/avaliacoes/${evaluation.id}/edit`;

  return (
    <>
      <PageHeader
        title={
          evaluation.isAutoEvaluation
            ? 'Detalhes da autoavaliação'
            : 'Detalhes da avaliação'
        }
        subtitle={`${evaluation.employee.name} · ${evaluation.period}`}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/avaliacoes')}
            >
              Voltar
            </Button>
            {canContinue && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(editPath)}
              >
                Continuar
              </Button>
            )}
          </Stack>
        }
      />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 2.4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={formatEvaluationStatus(evaluation.status)}
              color={evaluation.status === 'COMPLETED' ? 'success' : 'warning'}
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tipo
            </Typography>
            <Chip
              label={
                evaluation.isAutoEvaluation ? 'Autoavaliação' : 'Gestão'
              }
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Data
            </Typography>
            <Typography variant="h6">
              {formatDate(evaluation.evaluatedAt)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Nota final
            </Typography>
            <Typography variant="h6">
              {evaluation.finalScore?.toFixed(2) ?? summary.finalScore.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Classificação
            </Typography>
            <Typography variant="h6">
              {evaluation.classification ?? summary.classification}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumo por categoria
        </Typography>
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
                <TableCell>{category.average?.toFixed(2) ?? '—'}</TableCell>
                <TableCell>{category.weightedScore?.toFixed(2) ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {evaluation.template.categories.map((category) => (
        <Paper key={category.id} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {category.name}
          </Typography>

          <Stack spacing={2}>
            {category.questions.map((question) => {
              const answer = evaluation.answers.find(
                (item) => item.questionId === question.id,
              );

              return (
                <Box key={question.id}>
                  <Typography fontWeight={600}>{question.text}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nota: {answer?.score ?? '—'}
                  </Typography>
                  {answer?.comment && (
                    <Typography variant="body2" mt={0.5}>
                      {answer.comment}
                    </Typography>
                  )}
                </Box>
              );
            })}

            {evaluation.categoryComments
              .filter((comment) => comment.categoryId === category.id)
              .map((comment) => (
                <Box key={comment.id}>
                  <Typography variant="subtitle2">
                    Comentário geral do gestor
                  </Typography>
                  <Typography variant="body2">{comment.comment}</Typography>
                </Box>
              ))}
          </Stack>
        </Paper>
      ))}

      {evaluation.finalFeedback && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Feedback final
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2">Pontos fortes</Typography>
              <Typography variant="body2">
                {evaluation.finalFeedback.strengths}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">
                Oportunidades de melhoria
              </Typography>
              <Typography variant="body2">
                {evaluation.finalFeedback.improvements}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">
                Recomendações para o próximo ciclo
              </Typography>
              <Typography variant="body2">
                {evaluation.finalFeedback.recommendations}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}
    </>
  );
}
