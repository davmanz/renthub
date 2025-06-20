import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton, Tooltip, CircularProgress,
  Typography, Box, Paper, FormControl, InputLabel, Select, MenuItem, TablePagination
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import ViewVoucherModal from "../../../../components/shared/ViewVoucherModal";

interface Payment {
  id: string;
  month_paid: string;
  payment_date: string | null;
  status: "approved" | "pending_review" | "overdue" | "upcoming";
  receipt_image_url: string | null;
  user_comment: string | null;
}

interface Props {
  contractId: string;
  open: boolean;
  onClose: () => void;
}

const ContractPaymentHistoryModal = ({ contractId, open, onClose }: Props) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [voucherToShow, setVoucherToShow] = useState<string | null>(null);
  const [userComment, setUserComment] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Payment["status"] | "all">("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Payment; direction: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (!open || !contractId) return;
    setLoading(true);
    api
      .get(endpoints.contractManagement.paymentsByContract(contractId))
      .then((res) => setPayments(res.data.rent_payments))
      .catch((err) => console.error("Error al cargar pagos:", err))
      .finally(() => setLoading(false));
  }, [contractId, open]);

  const getStatusProps = (status: Payment["status"]) => {
    switch (status) {
      case "approved": return { label: "Aprobado", color: "success" };
      case "pending_review": return { label: "En Revisión", color: "warning" };
      case "overdue": return { label: "Vencido", color: "error" };
      case "upcoming": return { label: "Próximo", color: "default" };
      default: return { label: "Desconocido", color: "default" };
    }
  };

  const filteredPayments = payments.filter(p => statusFilter === "all" || p.status === statusFilter);
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const valueA = String(a[sortConfig.key]);
    const valueB = String(b[sortConfig.key]);
    
    if (sortConfig.key === 'payment_date' || sortConfig.key === 'month_paid') {
      // Si payment_date es null, lo tratamos como la fecha más antigua posible
      const dateA = valueA ? new Date(valueA) : new Date(0);
      const dateB = valueB ? new Date(valueB) : new Date(0);
      return sortConfig.direction === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    
    return sortConfig.direction === 'asc'
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });

  const paginatedPayments = sortedPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Historial de Pagos</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Cargando historial de pagos...</Typography>
            </Box>
          ) : payments.length === 0 ? (
            <Typography>No hay pagos registrados para este contrato.</Typography>
          ) : (
            <>
              {/* Filtros y resumen */}
              <Box sx={{ mb: 2 }}>
                <FormControl size="small">
                  <InputLabel>Filtrar por estado</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    label="Filtrar por estado"
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="approved">Aprobados</MenuItem>
                    <MenuItem value="pending_review">En Revisión</MenuItem>
                    <MenuItem value="overdue">Vencidos</MenuItem>
                    <MenuItem value="upcoming">Próximos</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Total de pagos</Typography>
                  <Typography variant="h6">{payments.length}</Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Aprobados</Typography>
                  <Typography variant="h6" color="success.main">
                    {payments.filter(p => p.status === 'approved').length}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Pendientes</Typography>
                  <Typography variant="h6" color="warning.main">
                    {payments.filter(p => p.status === 'pending_review').length}
                  </Typography>
                </Paper>
              </Box>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell onClick={() => setSortConfig({ key: 'month_paid', direction: sortConfig?.direction === 'asc' ? 'desc' : 'asc' })} sx={{ cursor: "pointer" }}>
                      Mes Pagado
                    </TableCell>
                    <TableCell>Carga de Voucher</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Comprobante</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPayments.map((p) => {
                    const { label, color } = getStatusProps(p.status);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{p.month_paid}</TableCell>
                        <TableCell>{p.payment_date ? 
        new Date(p.payment_date).toLocaleDateString() : 
        "Sin Pago"
    }</TableCell>
                        <TableCell>
                          <Chip label={label} color={color as any} />
                        </TableCell>
                        <TableCell>
                          {p.receipt_image_url ? (
                            <Tooltip title="Ver comprobante">
                              <IconButton 
                                onClick={() => {
                                  setVoucherToShow(p.receipt_image_url);
                                  setUserComment(p.user_comment);
                                }}
                                sx={{ '&:hover': { backgroundColor: 'action.selected' } }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={sortedPayments.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Filas por página"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {voucherToShow && (
        <ViewVoucherModal
          open={Boolean(voucherToShow)}
          onClose={() => setVoucherToShow(null)}
          voucherImage={voucherToShow}
          userComment={userComment || undefined}
        />
      )}
    </>
  );
};

export default ContractPaymentHistoryModal;
