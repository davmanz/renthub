import UploadPaymentModal from "../../modals/ContractInfo/UploadPaymentModal";
import ViewVoucherModal from "../../../../components/shared/ViewVoucherModal";
import RejectReasonModal from "../../../../components/shared/RejectReasonModal";
import { Contract } from "../../../../types/types";

interface Props {
  contract: Contract;
  modalStates: {
    uploadPayment: boolean;
    viewVoucher: boolean;
    rejectReason: boolean;
  };
  setModalStates: (value: any) => void;
}

const ContractModals = ({ contract, modalStates, setModalStates }: Props) => {
  const nextMonth = contract.next_month;

  if (!nextMonth) return null;

  return (
    <>
      {/* Modal: Subir nuevo comprobante */}
      {modalStates.uploadPayment && (
        <UploadPaymentModal
          open={modalStates.uploadPayment}
          onClose={() => setModalStates({ ...modalStates, uploadPayment: false })}
          nextPaymentMonth={nextMonth.payment}
          paymentId={nextMonth.id}
        />
      )}

      {/* Modal: Ver comprobante actual */}
      {modalStates.viewVoucher && nextMonth.voucher && (
        <ViewVoucherModal
          open={modalStates.viewVoucher}
          onClose={() => setModalStates({ ...modalStates, viewVoucher: false })}
          voucherImage={nextMonth.voucher}
          userComment={nextMonth.user_comment}
        />
      )}

      {/* Modal: Ver motivo de rechazo */}
      {modalStates.rejectReason && nextMonth.admin_comment && (
        <RejectReasonModal
          open={modalStates.rejectReason}
          handleClose={() => setModalStates({ ...modalStates, rejectReason: false })}
          booking={{
            admin_comment: nextMonth.admin_comment,
            voucher_image: nextMonth.voucher,
          }}
        />
      )}
    </>
  );
};

export default ContractModals;
