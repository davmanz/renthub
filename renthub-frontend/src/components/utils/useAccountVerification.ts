import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { TIMING } from "../../constants/messages";

const tokenRegex = /^[a-zA-Z0-9]+\-[a-zA-Z0-9]+\-[a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12}$/;

export const useAccountVerification = (token: string | undefined) => {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading");
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      if (!token || !tokenRegex.test(token)) {
        setStatus("invalid");
        setFadeIn(true);
        return;
      }

      try {
        await api.get(endpoints.auth.verifyAccount(token));
        setStatus("success");
        setTimeout(() => navigate("/login"), TIMING.REDIRECT_DELAY);
      } catch {
        setStatus("error");
      } finally {
        setTimeout(() => setFadeIn(true), TIMING.FADE_DELAY);
      }
    };

    verify();
  }, [token, navigate]);

  return { status, fadeIn };
};
