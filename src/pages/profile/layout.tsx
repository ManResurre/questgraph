import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CircularProgress } from "@mui/material";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const ProfileLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/" });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <CircularProgress size={24} color="inherit" />
      </div>
    );
  }

  return <>{children}</>;
};

export default React.memo(ProfileLayout);
