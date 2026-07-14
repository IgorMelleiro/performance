import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryIcon from '@mui/icons-material/History';
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatDate, formatStatus } from '@/utils/formatters';

export default function EmployeesTable({
  employees,
  page,
  limit,
  total,
  loading,
  canEdit = true,
  canDelete = true,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onHistory,
}) {
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Última avaliação</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">
                    Carregando colaboradores...
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">
                    Nenhum colaborador encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    {formatDate(employee.lastEvaluation?.date)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={formatStatus(employee.active)}
                      color={employee.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end">
                      <Tooltip title="Visualizar histórico">
                        <IconButton
                          size="small"
                          onClick={() => onHistory(employee)}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canEdit && (
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(employee)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(employee)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 20]}
        labelRowsPerPage="Itens por página"
        onPageChange={(_event, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(Number(event.target.value))
        }
      />
    </Paper>
  );
}
