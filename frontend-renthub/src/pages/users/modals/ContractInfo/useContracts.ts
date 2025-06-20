import { useEffect, useState } from "react";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import { Contract } from "../../../../types/types";

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContracts = async () => {
    try {
      const response = await api.get(endpoints.contractManagement.contracts);
      setContracts(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar los datos del contrato."
      );
      console.error("Error fetching contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return { contracts, loading, error, refetchContracts: fetchContracts };
};
