import React from "react";
import { Snackbar, Alert as MuiAlert, AlertColor } from "@mui/material";
import { useAlert } from "@/contexts/AlertContext";

const AlertContainer = () => {
  const { alerts, dismissAlert } = useAlert();

  return (
    <>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={5000}
          onClose={() => dismissAlert(alert.id)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: 8 }}
        >
          <MuiAlert
            onClose={() => dismissAlert(alert.id)}
            severity={alert.severity as AlertColor}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alert.message}
          </MuiAlert>
        </Snackbar>
      ))}
    </>
  );
};

export default AlertContainer;
