import { Paper, Stack, TextField, Typography } from '@mui/material';

export default function FeedbackStep({
  finalFeedback,
  onChange,
  error,
  mode = 'manager',
}) {
  const isSelf = mode === 'self';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isSelf ? 'Seu feedback' : 'Feedback final'}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {isSelf
          ? 'Reflita sobre seu desempenho neste ciclo.'
          : 'Registre os principais pontos da avaliação para o colaborador.'}
      </Typography>

      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Stack spacing={2}>
        <TextField
          label={isSelf ? 'Meus pontos fortes' : 'Pontos fortes'}
          multiline
          minRows={4}
          value={finalFeedback.strengths}
          onChange={(event) => onChange('strengths', event.target.value)}
          required
          fullWidth
        />
        <TextField
          label={
            isSelf
              ? 'Onde posso melhorar'
              : 'Oportunidades de melhoria'
          }
          multiline
          minRows={4}
          value={finalFeedback.improvements}
          onChange={(event) => onChange('improvements', event.target.value)}
          required
          fullWidth
        />
        <TextField
          label={
            isSelf
              ? 'Meus planos para o próximo ciclo'
              : 'Recomendações para o próximo ciclo'
          }
          multiline
          minRows={4}
          value={finalFeedback.recommendations}
          onChange={(event) => onChange('recommendations', event.target.value)}
          required
          fullWidth
        />
      </Stack>
    </Paper>
  );
}
