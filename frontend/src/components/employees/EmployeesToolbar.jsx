import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from '@mui/material';

export default function EmployeesToolbar({
  filters,
  departments,
  onChange,
}) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="Pesquisar"
          placeholder="Nome, cargo ou área"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value, page: 1 })}
        />
        <FormControl fullWidth>
          <InputLabel>Área</InputLabel>
          <Select
            label="Área"
            value={filters.department}
            onChange={(event) =>
              onChange({ department: event.target.value, page: 1 })
            }
          >
            <MenuItem value="">Todas</MenuItem>
            {departments.map((department) => (
              <MenuItem key={department} value={department}>
                {department}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={filters.active}
            onChange={(event) =>
              onChange({ active: event.target.value, page: 1 })
            }
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="true">Ativos</MenuItem>
            <MenuItem value="false">Inativos</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
}
