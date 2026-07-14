import { Paper, TextField } from '@mui/material';

export default function TeamsToolbar({ filters, onChange }) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <TextField
        fullWidth
        size="small"
        label="Pesquisar times"
        placeholder="Nome ou descrição"
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
      />
    </Paper>
  );
}
