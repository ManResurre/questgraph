import React, { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CryptHelper } from "@/lib/CryptHelper";
import { db, User } from "@/lib/db";
import supabase from "@/supabaseClient";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import { useAlert } from "@/contexts/AlertContext";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface LoginProps {
  user: SupabaseUser | null;
}

const Login = ({ user }: LoginProps) => {
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const localUser = useLiveQuery(() => db.user.orderBy("id").first());

  const handleLogin = useCallback(
    async (local: User) => {
      try {
        setLoading(true);

        const challengeRes = await supabase.functions.invoke("get-challenge", {
          body: { user_id: local.auth_id },
        });
        const { challenge } = challengeRes.data;

        const privateKey = await CryptHelper.importPrivateKey(local.privateKey);
        const encoder = new TextEncoder();
        const signatureBuffer = await window.crypto.subtle.sign(
          { name: "RSA-PSS", saltLength: 32 },
          privateKey,
          encoder.encode(challenge),
        );
        const signatureB64 = btoa(
          String.fromCharCode(...new Uint8Array(signatureBuffer)),
        );

        let verifyRes = await supabase.functions.invoke("verify-signature", {
          body: { user_id: local.auth_id, signature: signatureB64 },
        });

        //first-time authorization feature
        if (verifyRes.error) {
          verifyRes = await supabase.functions.invoke("verify-signature", {
            body: { user_id: local.auth_id, signature: signatureB64 },
          });
        }

        const { access_token, refresh_token } = verifyRes.data;

        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          showAlert("error", "Failed to set session");
        }
      } catch (err) {
        showAlert("error", "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [showAlert],
  );

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      showAlert("error", "Logout failed");
    }
  }, [showAlert]);

  if (loading || !localUser) {
    return (
      <IconButton color="inherit" disabled>
        <CircularProgress className="loader" size={24} color="inherit" />
      </IconButton>
    );
  }

  if (user) {
    return (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Профиль">
          <IconButton
            component={Link}
            to="/profile"
            color="success"
            size="small"
          >
            <PersonIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Выйти">
          <IconButton onClick={handleLogout} color="inherit" size="small">
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Tooltip title="Войти">
      <IconButton color="inherit" onClick={() => handleLogin(localUser)}>
        <LoginIcon />
      </IconButton>
    </Tooltip>
  );
};

export default Login;
