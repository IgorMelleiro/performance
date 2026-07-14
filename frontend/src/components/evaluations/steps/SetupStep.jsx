import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export default function SetupStep({
  employees,
  templates,
  formData,
  selectedEmployee,
  onChange,
  mode = 'manager',
}) {
  const isSelf = mode === 'self';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isSelf ? 'Dados da autoavaliação' : 'Dados do colaborador'}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {isSelf
          ? 'Confirme o período e o template para iniciar sua autoavaliação.'
          : 'Selecione o colaborador e defina o período da avaliação.'}
      </Typography>

      <Stack spacing={2}>
        {isSelf ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Colaborador
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {selectedEmployee?.name || 'Seu perfil'}
            </Typography>
            {selectedEmployee && (
              <>
                <Typography variant="body2">
                  <strong>Cargo:</strong> {selectedEmployee.position}
                </Typography>
                <Typography variant="body2">
                  <strong>Área:</strong> {selectedEmployee.department}
                </Typography>
              </>
            )}
          </Paper>
        ) : (
          <>
            <Autocomplete
              options={employees}
              value={selectedEmployee}
              onChange={(_event, employee) =>
                onChange({ employeeId: employee?.id || '' })
              }
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Colaborador" required />
              )}
            />

            {selectedEmployee && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  <strong>Cargo:</strong> {selectedEmployee.position}
                </Typography>
                <Typography variant="body2">
                  <strong>Área:</strong> {selectedEmployee.department}
                </Typography>
              </Paper>
            )}
          </>
        )}

        <FormControl fullWidth required>
          <InputLabel>Template de avaliação</InputLabel>
          <Select
            label="Template de avaliação"
            value={formData.templateId}
            onChange={(event) => onChange({ templateId: event.target.value })}
          >
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Período avaliado"
          placeholder="Ex.: 2026 - 1º Semestre"
          value={formData.period}
          onChange={(event) => onChange({ period: event.target.value })}
          required
          fullWidth
        />

        <TextField
          label="Data"
          type="date"
          value={formData.evaluatedAt}
          onChange={(event) => onChange({ evaluatedAt: event.target.value })}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />
      </Stack>
    </Paper>
  );
}
