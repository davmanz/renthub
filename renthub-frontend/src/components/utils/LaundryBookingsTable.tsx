import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Paper,
  } from "@mui/material";
  import { Close, Schedule, Visibility, Check, Info } from "@mui/icons-material";
  import { LaundryBooking } from "../../types/types";
  
  interface LaundryBookingsTableProps {
    bookings: LaundryBooking[];
    onAcceptProposal: (booking: LaundryBooking) => void;
    onReject: (booking: LaundryBooking) => void;
    onReschedule: (booking: LaundryBooking) => void;
    onViewVoucher: (booking: LaundryBooking) => void;
  }
  
  const statusLabelColor = {
    approved: { label: "Aprobado", color: "success" },
    rejected: { label: "Rechazado", color: "error" },
    user: { label: "Pendiente Usr", color: "info" },
    admin: { label: "Pendiente Adm", color: "warning" },
  } as const;
  
  const LaundryBookingsTable = ({
    bookings,
    onAcceptProposal,
    onReject,
    onReschedule,
    onViewVoucher,
  }: LaundryBookingsTableProps) => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Fecha</TableCell>
              <TableCell sx={{ color: "white" }}>Horario</TableCell>
              <TableCell sx={{ color: "white" }}>Estado</TableCell>
              <TableCell sx={{ color: "white" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {booking.status === "counter_proposal"
                    ? booking.counter_proposal_date
                    : booking.status === "proposed"
                    ? booking.proposed_date
                    : booking.date}
                </TableCell>
                <TableCell>
                  {booking.status === "counter_proposal"
                    ? booking.counter_proposal_time_slot
                    : booking.status === "proposed"
                    ? booking.proposed_time_slot
                    : booking.time_slot}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      booking.status === "approved"
                        ? statusLabelColor.approved.label
                        : booking.status === "rejected"
                        ? statusLabelColor.rejected.label
                        : booking.pending_action === "admin"
                        ? statusLabelColor.admin.label
                        : statusLabelColor.user.label
                    }
                    color={
                      booking.status === "approved"
                        ? statusLabelColor.approved.color
                        : booking.status === "rejected"
                        ? statusLabelColor.rejected.color
                        : booking.pending_action === "admin"
                        ? statusLabelColor.admin.color
                        : statusLabelColor.user.color
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {booking.pending_action === "user" && (
                    <>
                      <Tooltip title="Cancelar reserva">
                        <IconButton color="error" onClick={() => onReject(booking)}>
                          <Close />
                        </IconButton>
                      </Tooltip>
                      {(booking.status === "counter_proposal" || booking.status === "proposed") && (
                        <Tooltip title="Aceptar propuesta del administrador">
                          <IconButton color="success" onClick={() => onAcceptProposal(booking)}>
                            <Check />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Proponer nueva fecha">
                        <IconButton color="warning" onClick={() => onReschedule(booking)}>
                          <Schedule />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {booking.status === "approved" && (
                    <Tooltip title="Ver comprobante">
                      <IconButton color="primary" onClick={() => onViewVoucher(booking)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  )}
                  {booking.status === "rejected" && booking.admin_comment && (
                    <Tooltip title="Ver motivo de rechazo">
                      <IconButton color="info" onClick={() => onReject(booking)}>
                        <Info />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  export default LaundryBookingsTable;
  