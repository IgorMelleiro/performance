import {
  Chip,
  IconButton,
  Paper,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupsIcon from '@mui/icons-material/Groups';

export default function TeamsTable({
  teams,
  page,
  limit,
  total,
  loading,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onManage,
  onDelete,
}) {
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Gerentes</TableCell>
              <TableCell align="center">Membros</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary">Carregando...</Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary">
                    Nenhum time encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {teams.map((team) => (
              <TableRow key={team.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{team.name}</Typography>
                  {team.description && (
                    <Typography variant="body2" color="text.secondary">
                      {team.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {team.managers?.length > 0 ? (
                    team.managers.map((manager) => (
                      <Chip
                        key={manager.managerId}
                        label={manager.name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sem gerente
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">{team.membersCount}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Gerenciar membros e gerentes">
                    <IconButton onClick={() => onManage(team)}>
                      <GroupsIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => onEdit(team)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => onDelete(team)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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
        onPageChange={(_event, nextPage) => onPageChange(nextPage + 1)}
        rowsPerPage={limit}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(Number(event.target.value))
        }
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Por página"
      />
    </Paper>
  );
}
