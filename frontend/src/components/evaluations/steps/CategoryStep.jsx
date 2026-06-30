import {
  Box,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { scoreLabels } from '@/utils/evaluationCalculator';

export default function CategoryStep({
  category,
  answers,
  categoryComment,
  onAnswerChange,
  onCategoryCommentChange,
  error,
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {category.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Peso da categoria: {category.weight}%
      </Typography>

      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Stack spacing={3}>
        {category.questions.map((question) => {
          const answer = answers[question.id] || { score: null, comment: '' };

          return (
            <Paper key={question.id} variant="outlined" sx={{ p: 2 }}>
              <Typography fontWeight={600} mb={2}>
                {question.text}
              </Typography>

              <ToggleButtonGroup
                exclusive
                value={answer.score}
                onChange={(_event, value) => {
                  if (value !== null) {
                    onAnswerChange(question.id, { score: value });
                  }
                }}
                sx={{ mb: 1, flexWrap: 'wrap' }}
              >
                {[1, 2, 3, 4, 5].map((score) => (
                  <ToggleButton key={score} value={score} sx={{ minWidth: 48 }}>
                    {score}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {answer.score && (
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  {scoreLabels[answer.score]}
                </Typography>
              )}

              <TextField
                fullWidth
                label="Comentário (opcional)"
                multiline
                minRows={2}
                value={answer.comment}
                onChange={(event) =>
                  onAnswerChange(question.id, { comment: event.target.value })
                }
              />
            </Paper>
          );
        })}

        <Box>
          <TextField
            fullWidth
            label="Comentário geral do gestor"
            multiline
            minRows={3}
            value={categoryComment}
            onChange={(event) => onCategoryCommentChange(event.target.value)}
          />
        </Box>
      </Stack>
    </Paper>
  );
}
