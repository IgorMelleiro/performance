import AddIcon from '@mui/icons-material/Add';
import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmployeeFormDialog from '@/components/employees/EmployeeFormDialog';
import EmployeeHistoryDialog from '@/components/employees/EmployeeHistoryDialog';
import EmployeesTable from '@/components/employees/EmployeesTable';
import EmployeesToolbar from '@/components/employees/EmployeesToolbar';
import PageHeader, { EmptyState } from '@/components/PageHeader';
import { PERMISSIONS } from '@/auth/permissions';
import { useEmployeeMutations } from '@/hooks/useEmployeeMutations';
import { useEmployees } from '@/hooks/useEmployees';
import { usePermissions } from '@/hooks/usePermissions';

const initialFilters = {
  search: '',
  department: '',
  active: 'all',
  page: 1,
  limit: 10,
};

export default function EmployeesPage() {
  const { can, isGerente, isFuncionario } = usePermissions();
  const canCreate = can(PERMISSIONS.EMPLOYEES_CREATE);
  const canEdit = can(PERMISSIONS.EMPLOYEES_UPDATE);
  const canDelete = can(PERMISSIONS.EMPLOYEES_DELETE);

  const pageTitle = isFuncionario
    ? 'Meu Perfil'
    : isGerente
      ? 'Minha Equipe'
      : 'Colaboradores';
  const pageSubtitle = isFuncionario
    ? 'Visualize seus dados e histórico de avaliações.'
    : isGerente
      ? 'Colaboradores dos times sob sua gestão.'
      : 'Gerencie os colaboradores da empresa.';

  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formError, setFormError] = useState('');

  const { data, isLoading, isError } = useEmployees(filters);

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
      error?.response?.data?.message ||
      'Não foi possível concluir a operação.';
    setFormError(message);
    showSnackbar(message, 'error');
  };

  const { createMutation, updateMutation, deleteMutation } =
    useEmployeeMutations({
      onSuccess: (message) => {
        setFormError('');
        setFormOpen(false);
        setDeleteOpen(false);
        setSelectedEmployee(null);
        showSnackbar(message);
      },
      onError: handleMutationError,
    });

  const employees = data?.data ?? [];
  const meta = data?.meta;
  const departments = useMemo(
    () => meta?.departments ?? [],
    [meta?.departments],
  );

  const handleFilterChange = (changes) => {
    setFilters((current) => ({ ...current, ...changes }));
  };

  const openCreateDialog = () => {
    setFormError('');
    setSelectedEmployee(null);
    setFormOpen(true);
  };

  const openEditDialog = (employee) => {
    setFormError('');
    setSelectedEmployee(employee);
    setFormOpen(true);
  };

  const openHistoryDialog = (employee) => {
    setSelectedEmployee(employee);
    setHistoryOpen(true);
  };

  const openDeleteDialog = (employee) => {
    setSelectedEmployee(employee);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (values) => {
    setFormError('');

    if (selectedEmployee) {
      updateMutation.mutate({ id: selectedEmployee.id, ...values });
      return;
    }

    createMutation.mutate(values);
  };

  const handleDeleteConfirm = () => {
    if (selectedEmployee) {
      deleteMutation.mutate(selectedEmployee.id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const showEmptyState =
    !isLoading &&
    !isError &&
    employees.length === 0 &&
    filters.search === '' &&
    filters.department === '' &&
    filters.active === 'all';

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        action={
          canCreate ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Novo colaborador
            </Button>
          ) : null
        }
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar os colaboradores.
        </Alert>
      )}

      {showEmptyState ? (
        <EmptyState
          title={
            isGerente
              ? 'Nenhum colaborador nos seus times'
              : isFuncionario
                ? 'Perfil não vinculado'
                : 'Nenhum colaborador cadastrado'
          }
          description={
            isGerente
              ? 'Peça ao RH para adicionar colaboradores aos times sob sua gestão.'
              : isFuncionario
                ? 'Sua conta ainda não está vinculada a um colaborador.'
                : 'Cadastre o primeiro colaborador para iniciar as avaliações.'
          }
        />
      ) : (
        <>
          <EmployeesToolbar
            filters={{ ...filters, search: searchInput }}
            departments={departments}
            onChange={(changes) => {
              if ('search' in changes) {
                setSearchInput(changes.search);
                return;
              }

              handleFilterChange(changes);
            }}
          />

          <EmployeesTable
            employees={employees}
            page={filters.page}
            limit={filters.limit}
            total={meta?.total ?? 0}
            loading={isLoading}
            canEdit={canEdit}
            canDelete={canDelete}
            onPageChange={(page) => handleFilterChange({ page })}
            onRowsPerPageChange={(limit) =>
              handleFilterChange({ limit, page: 1 })
            }
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onHistory={openHistoryDialog}
          />
        </>
      )}

      {(canCreate || canEdit) && (
        <EmployeeFormDialog
          open={formOpen}
          employee={selectedEmployee}
          loading={isSaving}
          onClose={() => {
            if (!isSaving) {
              setFormOpen(false);
              setSelectedEmployee(null);
              setFormError('');
            }
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {formError && formOpen && (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => setFormError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setFormError('')}>
            {formError}
          </Alert>
        </Snackbar>
      )}

      <EmployeeHistoryDialog
        open={historyOpen}
        employee={selectedEmployee}
        onClose={() => {
          setHistoryOpen(false);
          setSelectedEmployee(null);
        }}
      />

      {canDelete && (
        <ConfirmDialog
          open={deleteOpen}
          title="Excluir colaborador"
          description={`Deseja excluir ${selectedEmployee?.name ?? 'este colaborador'}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          loading={isDeleting}
          onClose={() => {
            if (!isDeleting) {
              setDeleteOpen(false);
              setSelectedEmployee(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}

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
