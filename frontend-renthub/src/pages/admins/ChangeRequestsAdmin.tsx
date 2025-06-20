import {
  Container, Typography, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import {STATUS_LABELS} from "../../constants/status";
import { FIELD_LABELS } from "../../constants/fieldLabels";
import AdminLayout from "./AdminLayout";

// Primero, definimos las interfaces necesarias
interface DocumentType {
  id: string;
  name: string;
}

interface Changes {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  document_type?: DocumentType;
  document_number?: string;
}

interface ChangeRequest {
  id: string;
  user: {
    id: string;
    name: string;
  };
  changes: Changes;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by: string | null;
  review_comment: string | null;
}

interface SnackbarState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ChangeRequestsAdmin = () => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: "", 
    type: "success" 
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get(endpoints.changeRequests.list);
      setRequests(res.data);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: "Error al cargar solicitudes: " + (error instanceof Error ? error.message : 'Error desconocido'), 
        type: "error" 
      });
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedStatus(newValue);
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(endpoints.changeRequests.approve(id));
      setSnackbar({ open: true, message: "Solicitud aprobada", type: "success" });
      fetchRequests();
    } catch {
      setSnackbar({ open: true, message: "Error al aprobar", type: "error" });
    }
  };

  const handleOpenReject = (id: string) => {
    setSelectedRequestId(id);
    setReviewComment("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRequestId) {
      setSnackbar({ open: true, message: "ID de solicitud no válido", type: "error" });
      return;
    }
    if (!reviewComment.trim()) {
      setSnackbar({ open: true, message: "Debe ingresar un comentario", type: "warning" });
      return;
    }
    try {
      await api.patch(endpoints.changeRequests.reject(selectedRequestId!), { review_comment: reviewComment });
      setSnackbar({ open: true, message: "Solicitud rechazada", type: "success" });
      setRejectDialogOpen(false);
      fetchRequests();
    } catch {
      setSnackbar({ open: true, message: "Error al rechazar", type: "error" });
    }
  };

  const filtered = useMemo(() => 
    requests.filter((r) => r.status === selectedStatus),
    [requests, selectedStatus]
  );

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ my: 3, color: "primary.main" }}>
          Solicitudes de Cambio de Usuario
        </Typography>

        <Tabs value={selectedStatus} onChange={handleTabChange} sx={{ mb: 2 }}>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <Tab key={key} label={label} value={key} />
          ))}
        </Tabs>

        <Paper>
          <Table>
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Usuario</TableCell>
                <TableCell sx={{ color: "white" }}>Cambios</TableCell>
                <TableCell sx={{ color: "white" }}>Estado</TableCell>
                <TableCell sx={{ color: "white" }}>Fecha</TableCell>
                <TableCell sx={{ color: "white" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((req: ChangeRequest) => (
                <TableRow key={req.user.id}>
                  <TableCell>{req.user.name}</TableCell>
                  <TableCell>
                    <ul>
                      {Object.entries(req.changes).map(([field, value]) => (
                        <li key={field}>
                          <strong>{FIELD_LABELS[field] || field}</strong>: {
                            field === 'document_type' 
                              ? (value as DocumentType).name 
                              : value as string
                          }
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Chip label={STATUS_LABELS[req.status]} color={
                      req.status === "pending" ? "warning" :
                      req.status === "approved" ? "success" : "error"
                    } />
                  </TableCell>
                  <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {req.status === "pending" && (
                      <>
                        <Button variant="contained" size="small" color="success" onClick={() => handleApprove(req.id)} sx={{ mr: 1 }}>
                          Aprobar
                        </Button>
                        <Button variant="outlined" size="small" color="error" onClick={() => handleOpenReject(req.id)}>
                          Rechazar
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No hay solicitudes</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>Rechazar solicitud</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Comentario del revisor"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={handleReject}>Rechazar</Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={5000} 
          onClose={handleSnackbarClose}
        >
          <Alert severity={snackbar.type}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default ChangeRequestsAdmin;