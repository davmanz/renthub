// src/components/LaundryRequestsTable.tsx

import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { Check, Close, Schedule, Visibility, Info } from "@mui/icons-material";
import { LaundryBooking } from "../../types/types";
import { LAUNDRY_STATUS } from "../../constants/laundryStatus";
interface Props {
  requests: LaundryBooking[];
  onViewVoucher: (req: LaundryBooking) => void;
  onAccept: (id: string) => void;
  onReject: (req: LaundryBooking) => void;
  onReschedule: (req: LaundryBooking) => void;
  onViewRejectionReason: (req: LaundryBooking) => void;
}

const LaundryRequestsTable: FC<Props> = ({
  requests,
  onViewVoucher,
  onAccept,
  onReject,
  onReschedule,
  onViewRejectionReason,
}) => {
  return (
    <Table>
      <TableHead sx={{ bgcolor: "#1976d2" }}>
        <TableRow>
          <TableCell sx={{ color: "white" }}>Usuario</TableCell>
          <TableCell sx={{ color: "white" }}>Fecha</TableCell>
          <TableCell sx={{ color: "white" }}>Hora</TableCell>
          <TableCell sx={{ color: "white" }}>Estado</TableCell>
          <TableCell sx={{ color: "white" }}>Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {requests.map((request) => {
          const statusConfig =
            request.status === "approved"
              ? LAUNDRY_STATUS.approved
              : request.status === "rejected"
              ? LAUNDRY_STATUS.rejected
              : request.pending_action === "admin"
              ? LAUNDRY_STATUS.pending_admin
              : LAUNDRY_STATUS.pending_user;

          const showDate =
            request.status === "counter_proposal"
              ? request.counter_proposal_date
              : request.status === "proposed"
              ? request.proposed_date
              : request.date;

          const showTime =
            request.status === "counter_proposal"
              ? request.counter_proposal_time_slot
              : request.status === "proposed"
              ? request.proposed_time_slot
              : request.time_slot;

          return (
            <TableRow key={request.id}>
              <TableCell>{request.user_full_name}</TableCell>
              <TableCell>{showDate}</TableCell>
              <TableCell>{showTime}</TableCell>
              <TableCell>
                <Chip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Tooltip title="Ver comprobante">
                  <IconButton onClick={() => onViewVoucher(request)} color="primary">
                    <Visibility />
                  </IconButton>
                </Tooltip>
                {request.pending_action === "admin" && (
                  <>
                    <Tooltip title="Aprobar">
                      <IconButton onClick={() => onAccept(request.id)} color="success">
                        <Check />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rechazar">
                      <IconButton onClick={() => onReject(request)} color="error">
                        <Close />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reprogramar">
                      <IconButton onClick={() => onReschedule(request)} color="warning">
                        <Schedule />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {request.status === "rejected" && request.admin_comment && (
                  <Tooltip title="Motivo rechazo">
                    <IconButton onClick={() => onViewRejectionReason(request)} color="info">
                      <Info />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default LaundryRequestsTable;
