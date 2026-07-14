import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { teamSchema } from '@/schemas/teamSchema';

const defaultValues = {
  name: '',
  description: '',
};

export default function TeamFormDialog({ open, team, loading, onClose, onSubmit }) {
  const isEditing = Boolean(team);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        team
          ? {
              name: team.name,
              description: team.description || '',
            }
          : defaultValues,
      );
    }
  }, [open, team, reset]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar time' : 'Novo time'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Nome"
          margin="normal"
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          {...register('name')}
        />
        <TextField
          fullWidth
          label="Descrição"
          margin="normal"
          multiline
          minRows={2}
          {...register('description')}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
