import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  useTeam,
  useTeamEmployeeSearch,
  useTeamManagerSearch,
} from '@/hooks/useTeams';

export default function TeamManageDialog({
  open,
  teamId,
  loading,
  onClose,
  onAddMember,
  onRemoveMember,
  onAddManager,
  onRemoveManager,
}) {
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [managerSearch, setManagerSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);

  const { data: team, isLoading, isError, refetch } = useTeam(teamId, open);

  const { data: employeeOptions } = useTeamEmployeeSearch(
    employeeSearch,
    teamId,
    open,
  );

  const { data: managerOptions } = useTeamManagerSearch(
    managerSearch,
    teamId,
    open,
  );

  useEffect(() => {
    if (!open) {
      setEmployeeSearch('');
      setManagerSearch('');
      setSelectedEmployee(null);
      setSelectedManager(null);
    }
  }, [open]);

  const handleAddMember = async () => {
    if (!selectedEmployee) {
      return;
    }

    await onAddMember(selectedEmployee.id);
    setSelectedEmployee(null);
    setEmployeeSearch('');
    refetch();
  };

  const handleAddManager = async () => {
    if (!selectedManager) {
      return;
    }

    await onAddManager(selectedManager.id);
    setSelectedManager(null);
    setManagerSearch('');
    refetch();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gerenciar time — {team?.name || '...'}</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Alert severity="error">Não foi possível carregar o time.</Alert>
        )}

        {team && (
          <Box sx={{ display: 'grid', gap: 3, mt: 1 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Gerentes
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={managerOptions?.data ?? []}
                  value={selectedManager}
                  inputValue={managerSearch}
                  onInputChange={(_event, value) => setManagerSearch(value)}
                  onChange={(_event, value) => setSelectedManager(value)}
                  getOptionLabel={(option) =>
                    option?.name ? `${option.name} (${option.email})` : ''
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Pesquisar gerente"
                      placeholder="Nome ou e-mail"
                    />
                  )}
                  noOptionsText="Nenhum gerente encontrado"
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!selectedManager || loading}
                  onClick={handleAddManager}
                >
                  Adicionar
                </Button>
              </Box>

              {team.managers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum gerente definido.
                </Typography>
              ) : (
                <List dense>
                  {team.managers.map((manager) => (
                    <ListItem
                      key={manager.managerId}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          color="error"
                          disabled={loading}
                          onClick={() => onRemoveManager(manager.managerId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={manager.name}
                        secondary={manager.email}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Colaboradores
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={employeeOptions?.data ?? []}
                  value={selectedEmployee}
                  inputValue={employeeSearch}
                  onInputChange={(_event, value) => setEmployeeSearch(value)}
                  onChange={(_event, value) => setSelectedEmployee(value)}
                  getOptionLabel={(option) =>
                    option?.name
                      ? `${option.name} — ${option.position} (${option.department})`
                      : ''
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Pesquisar colaborador"
                      placeholder="Nome, cargo ou área"
                    />
                  )}
                  noOptionsText="Nenhum colaborador encontrado"
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!selectedEmployee || loading}
                  onClick={handleAddMember}
                >
                  Adicionar
                </Button>
              </Box>

              {team.members.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum colaborador no time.
                </Typography>
              ) : (
                <List dense>
                  {team.members.map((member) => (
                    <ListItem
                      key={member.employeeId}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          color="error"
                          disabled={loading}
                          onClick={() => onRemoveMember(member.employeeId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={member.name}
                        secondary={`${member.position} · ${member.department}`}
                      />
                      {!member.active && (
                        <Chip size="small" label="Inativo" sx={{ mr: 6 }} />
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
