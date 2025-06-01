'use client';

import {useState, useEffect} from 'react';
import {theme} from "@/theme";
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from "@/app/components/Navbar";

export default function ClientLayout({children}: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return <>
        {isMounted ? (
            <AppRouterCacheProvider options={{enableCssLayer: true}}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Navbar/>
                    {children}
                </ThemeProvider>
            </AppRouterCacheProvider>
        ) : (
            <div>Loading...</div>
        )}
    </>
}
