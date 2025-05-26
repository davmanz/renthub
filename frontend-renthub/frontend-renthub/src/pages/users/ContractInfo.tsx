import { useState } from "react";
import { Typography, Paper, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useContracts } from "./modals/ContractInfo/useContracts";
import ContractDetails from "./modals/ContractInfo/ContractDetails";
import UploadPaymentModal from "./modals/ContractInfo/UploadPaymentModal";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import RejectReasonModal from "../../components/shared/RejectReasonModal";

const ContractInfo = () => {
  const { contracts, loading, error, refetchContracts } = useContracts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedContract = contracts.find((c) => c.id === selectedId) || contracts[0];

  const [modalStates, setModalStates] = useState({
    uploadPayment: false,
    viewVoucher: false,
    rejectReason: false,
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ padding: 4, bgcolor: "#2c2c2c", color: "white", borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center", color: "#90caf9" }}>
        Información del Contrato
      </Typography>

      {contracts.length > 1 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: "white" }}>Selecciona un contrato</InputLabel>
          <Select
            value={selectedContract?.id || ""}
            onChange={(e) => setSelectedId(e.target.value)}
            sx={{ bgcolor: "#424242", color: "white", borderRadius: 2 }}
          >
            {contracts.map((contract) => (
              <MenuItem key={contract.id} value={contract.id}>
                {contract.building_name} - Habitación {contract.room_number}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedContract && (
        <>
          <ContractDetails
            contract={selectedContract}
            modalStates={modalStates}
            setModalStates={setModalStates}
          />

          {/* Modales integrados directamente */}
          {modalStates.uploadPayment && selectedContract.next_month && (
            <UploadPaymentModal
              open={modalStates.uploadPayment}
              onClose={() => {
                setModalStates({ ...modalStates, uploadPayment: false });
                refetchContracts(); // 🔁 Recarga contratos al cerrar modal
              }}
              nextPaymentMonth={selectedContract.next_month.payment}
              paymentId={selectedContract.next_month.id}
            />
          )}

          {modalStates.viewVoucher && selectedContract.next_month?.voucher && (
            <ViewVoucherModal
              open={modalStates.viewVoucher}
              onClose={() => setModalStates({ ...modalStates, viewVoucher: false })}
              voucherImage={selectedContract.next_month.voucher}
            />
          )}

          {modalStates.rejectReason && selectedContract.next_month?.admin_comment && (
            <RejectReasonModal
              open={modalStates.rejectReason}
              handleClose={() => setModalStates({ ...modalStates, rejectReason: false })}
              booking={{
                admin_comment: selectedContract.next_month.admin_comment,
                voucher_image: selectedContract.next_month.voucher,
              }}
            />
          )}
        </>
      )}
    </Paper>
  );
};

export default ContractInfo;
