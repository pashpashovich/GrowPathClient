import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Avatar,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1)',
  
  '&:hover': {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#F6F7F9',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: 'Source Sans Pro, sans-serif',
  fontWeight: 600,
  color: '#212121',
  borderBottom: '1px solid #E0E0E0',
}));

const StyledTableBodyCell = styled(TableCell)(({ theme }) => ({
  fontFamily: 'Source Sans Pro, sans-serif',
  color: '#212121',
  borderBottom: '1px solid #F0F0F0',
}));

const RatingChip = styled(Chip)(({ rating }) => {
  let backgroundColor, color;
  
  if (rating >= 8) {
    backgroundColor = '#31F0A4';
    color = '#212121';
  } else if (rating >= 6) {
    backgroundColor = '#FFC107';
    color = '#212121';
  } else {
    backgroundColor = '#FF5252';
    color = '#FFFFFF';
  }
  
  return {
    backgroundColor,
    color,
    fontWeight: 600,
    borderRadius: 6,
  };
});

const ExperienceChip = styled(Chip)(({ experience }) => {
  let backgroundColor, color;
  
  if (experience <= 2) {
    backgroundColor = '#92C0FA';
    color = '#212121';
  } else if (experience <= 5) {
    backgroundColor = '#FF9800';
    color = '#FFFFFF';
  } else {
    backgroundColor = '#31F0A4';
    color = '#212121';
  }
  
  return {
    backgroundColor,
    color,
    fontWeight: 600,
    borderRadius: 6,
  };
});

const DataTable = ({
  columns = [],
  data = [],
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  loading = false,
  ...props
}) => {
  const handleChangePage = (event, newPage) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  const renderCellContent = (column, row) => {
    const value = row[column.field];
    
    switch (column.type) {
      case 'rating':
        return <RatingChip label={value} rating={value} size="small" />;
      
      case 'experience':
        return <ExperienceChip label={`${value} мес`} experience={value} size="small" />;
      
      case 'avatar':
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={row.avatar} alt={row.name} />
            <Typography variant="body2">{row.name}</Typography>
          </Box>
        );
      
      case 'actions':
        return (
          <Box display="flex" gap={1}>
            {onView && (
              <Tooltip title="Просмотр">
                <IconButton size="small" onClick={() => onView(row)}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Редактировать">
                <IconButton size="small" onClick={() => onEdit(row)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Удалить">
                <IconButton size="small" onClick={() => onDelete(row)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      
      default:
        return value;
    }
  };

  return (
    <Paper elevation={0}>
      <StyledTableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell key={column.field}>
                  {column.headerName}
                </StyledTableCell>
              ))}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id || index} hover>
                {columns.map((column) => (
                  <StyledTableBodyCell key={column.field}>
                    {renderCellContent(column, row)}
                  </StyledTableBodyCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} из ${count !== -1 ? count : `более ${to}`}`
        }
      />
    </Paper>
  );
};

export default DataTable;


