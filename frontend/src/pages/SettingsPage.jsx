import {
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PageHeader from '@/components/PageHeader';
import { ROLE_LABELS } from '@/auth/roles';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Dados da sua conta neste ambiente."
      />

      <Paper sx={{ p: 3, maxWidth: 560 }}>
        <Typography variant="h6" gutterBottom>
          Perfil de acesso
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Nome
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {user?.name || '—'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            E-mail
          </Typography>
          <Typography variant="body1">{user?.email || '—'}</Typography>

          <Typography variant="body2" color="text.secondary">
            Papel
          </Typography>
          <Chip
            label={ROLE_LABELS[user?.role] || user?.role || '—'}
            color="primary"
            sx={{ width: 'fit-content' }}
          />

          {user?.employeeId && (
            <>
              <Typography variant="body2" color="text.secondary">
                ID do colaborador vinculado
              </Typography>
              <Typography variant="body2">{user.employeeId}</Typography>
            </>
          )}
        </Stack>
      </Paper>
    </>
  );
}
