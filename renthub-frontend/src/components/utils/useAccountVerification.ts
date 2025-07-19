import { useEffect, useState } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

const tokenRegex = /^[a-zA-Z0-9]+\-[a-zA-Z0-9]+\-[a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12}$/;

export type VerificationStatus = "loading" | "success" | "error" | "invalid";

export const useAccountVerification = (token: string | undefined) => {
  const [status, setStatus] = useState<VerificationStatus>("loading");

  useEffect(() => {
    const verify = async () => {
      if (!token || !tokenRegex.test(token)) {
        setStatus("invalid");
        return;
      }

      try {
        await api.get(endpoints.auth.verifyAccount(token));
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return { status };
};
