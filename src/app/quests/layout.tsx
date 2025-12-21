'use client';
import React, {ReactNode, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {ReactFlowProvider} from "@xyflow/react";
import {GraphSidebarProvider} from "@/app/components/sidebar/graphSidebarProvider";
import supabase from "@/supabaseClient";
import "../globals.css";
import {CircularProgress} from "@mui/material";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

function ReactQueryProvider({children}: { children: ReactNode }) {
    // создаём QueryClient один раз
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export default function QuestsLayout(
    {
        children,
    }: {
        children: ReactNode;
    }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const {data: {user}} = await supabase.auth.getUser();
            if (!user) {
                router.replace("/");
            }
            setLoading(false);
        };

        checkUser();

        const {data: subscription} = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session?.user) {
                router.replace("/");
            }
        });

        return () => {
            subscription.subscription.unsubscribe();
        };
    }, [router]);

    if (loading) {
        return <CircularProgress size={24} color="inherit"/>;
    }

    return <ReactQueryProvider>
        <ReactFlowProvider>
            <GraphSidebarProvider>
                {children}
            </GraphSidebarProvider>
        </ReactFlowProvider>
    </ReactQueryProvider>
}
