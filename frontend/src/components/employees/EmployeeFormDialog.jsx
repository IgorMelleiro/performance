import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { employeeSchema } from '@/schemas/employeeSchema';

const defaultValues = {
  name: '',
  position: '',
  department: '',
  active: true,
};

export default function EmployeeFormDialog({
  open,
  employee,
  loading,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(employee);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        employee
          ? {
              name: employee.name,
              position: employee.position,
              department: employee.department,
              active: employee.active,
            }
          : defaultValues,
      );
    }
  }, [open, employee, reset]);

  const active = watch('active');

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar colaborador' : 'Novo colaborador'}
      </DialogTitle>
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
          label="Cargo"
          margin="normal"
          error={Boolean(errors.position)}
          helperText={errors.position?.message}
          {...register('position')}
        />
        <TextField
          fullWidth
          label="Área"
          margin="normal"
          error={Boolean(errors.department)}
          helperText={errors.department?.message}
          {...register('department')}
        />
        <FormControlLabel
          sx={{ mt: 1 }}
          control={
            <Switch
              checked={active}
              onChange={(event) => setValue('active', event.target.checked)}
            />
          }
          label={active ? 'Ativo' : 'Inativo'}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {isEditing ? 'Salvar' : 'Cadastrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
