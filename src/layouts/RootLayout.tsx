import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "@/components/Navbar";
import AlertContainer from "@/components/AlertContainer";
import { AlertProvider } from "@/contexts/AlertContext";
import { theme } from "@/theme";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AlertProvider>
        <Navbar />
        <AlertContainer />
        {children}
      </AlertProvider>
    </ThemeProvider>
  );
}
