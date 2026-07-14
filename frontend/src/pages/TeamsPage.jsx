import AddIcon from '@mui/icons-material/Add';
import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import TeamFormDialog from '@/components/teams/TeamFormDialog';
import TeamManageDialog from '@/components/teams/TeamManageDialog';
import TeamsTable from '@/components/teams/TeamsTable';
import TeamsToolbar from '@/components/teams/TeamsToolbar';
import PageHeader, { EmptyState } from '@/components/PageHeader';
import { useTeamMutations } from '@/hooks/useTeamMutations';
import { useTeams } from '@/hooks/useTeams';

const initialFilters = {
  search: '',
  page: 1,
  limit: 10,
};

export default function TeamsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useTeams(filters);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((current) => {
        if (current.search === searchInput) {
          return current;
        }

        return { ...current, search: searchInput, page: 1 };
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMutationError = (error) => {
    const message =
      error?.response?.data?.message || 'Não foi possível concluir a operação.';
    showSnackbar(message, 'error');
  };

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    addMemberMutation,
    removeMemberMutation,
    addManagerMutation,
    removeManagerMutation,
  } = useTeamMutations({
    onSuccess: (message) => {
      setFormOpen(false);
      setDeleteOpen(false);
      if (!manageOpen) {
        setSelectedTeam(null);
      }
      showSnackbar(message);
    },
    onError: handleMutationError,
  });

  const teams = data?.data ?? [];
  const meta = data?.meta;

  const openCreateDialog = () => {
    setSelectedTeam(null);
    setFormOpen(true);
  };

  const openEditDialog = (team) => {
    setSelectedTeam(team);
    setFormOpen(true);
  };

  const openManageDialog = (team) => {
    setSelectedTeam(team);
    setManageOpen(true);
  };

  const openDeleteDialog = (team) => {
    setSelectedTeam(team);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (values) => {
    if (selectedTeam && formOpen && !manageOpen) {
      updateMutation.mutate({ id: selectedTeam.id, ...values });
      return;
    }

    createMutation.mutate(values);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isManaging =
    addMemberMutation.isPending ||
    removeMemberMutation.isPending ||
    addManagerMutation.isPending ||
    removeManagerMutation.isPending;

  const showEmptyState =
    !isLoading && !isError && teams.length === 0 && filters.search === '';

  return (
    <>
      <PageHeader
        title="Times"
        subtitle="Organize colaboradores e defina gerentes responsáveis."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Novo time
          </Button>
        }
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar os times.
        </Alert>
      )}

      {showEmptyState ? (
        <EmptyState
          title="Nenhum time cadastrado"
          description="Crie o primeiro time para organizar colaboradores e gerentes."
        />
      ) : (
        <>
          <TeamsToolbar
            filters={{ ...filters, search: searchInput }}
            onChange={(changes) => {
              if ('search' in changes) {
                setSearchInput(changes.search);
                return;
              }

              setFilters((current) => ({ ...current, ...changes }));
            }}
          />

          <TeamsTable
            teams={teams}
            page={filters.page}
            limit={filters.limit}
            total={meta?.total ?? 0}
            loading={isLoading}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            onRowsPerPageChange={(limit) =>
              setFilters((current) => ({ ...current, limit, page: 1 }))
            }
            onEdit={openEditDialog}
            onManage={openManageDialog}
            onDelete={openDeleteDialog}
          />
        </>
      )}

      <TeamFormDialog
        open={formOpen}
        team={selectedTeam}
        loading={isSaving}
        onClose={() => {
          if (!isSaving) {
            setFormOpen(false);
            setSelectedTeam(null);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <TeamManageDialog
        open={manageOpen}
        teamId={selectedTeam?.id}
        loading={isManaging}
        onClose={() => {
          if (!isManaging) {
            setManageOpen(false);
            setSelectedTeam(null);
          }
        }}
        onAddMember={(employeeId) =>
          addMemberMutation.mutateAsync({
            teamId: selectedTeam.id,
            employeeId,
          })
        }
        onRemoveMember={(employeeId) =>
          removeMemberMutation.mutateAsync({
            teamId: selectedTeam.id,
            employeeId,
          })
        }
        onAddManager={(managerId) =>
          addManagerMutation.mutateAsync({
            teamId: selectedTeam.id,
            managerId,
          })
        }
        onRemoveManager={(managerId) =>
          removeManagerMutation.mutateAsync({
            teamId: selectedTeam.id,
            managerId,
          })
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Excluir time"
        description={`Deseja excluir ${selectedTeam?.name ?? 'este time'}? Os vínculos com membros e gerentes serão removidos.`}
        confirmLabel="Excluir"
        loading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeleteOpen(false);
            setSelectedTeam(null);
          }
        }}
        onConfirm={() => {
          if (selectedTeam) {
            deleteMutation.mutate(selectedTeam.id);
          }
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
