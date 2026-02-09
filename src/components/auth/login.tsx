import React, { useCallback, useState } from "react";
import { CryptHelper } from "@/lib/CryptHelper";
import { db, User } from "@/lib/db";
import supabase from "@/supabaseClient";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { CircularProgress, IconButton } from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface LoginProps {
  user: SupabaseUser | null;
}

const Login = ({ user }: LoginProps) => {
  const [loading, setLoading] = useState(false);

  const localUser = useLiveQuery(() => db.user.orderBy("id").first());

  const handleLogin = useCallback(async (local: User) => {
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
        console.error("Ошибка установки сессии:", error.message);
      }
    } catch (err) {
      console.error("Ошибка входа:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Ошибка выхода:", err);
    }
  }, []);

  return (
    <IconButton
      color={user ? "success" : "inherit"}
      onClick={user ? handleLogout : () => handleLogin(localUser!)}
    >
      {loading || !localUser ? (
        <CircularProgress className="loader" size={24} color="inherit" />
      ) : user ? (
        <LogoutIcon />
      ) : (
        <LoginIcon />
      )}
    </IconButton>
  );
};

export default Login;
