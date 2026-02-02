'use client';
import React, {ReactNode, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {ReactFlowProvider} from "@xyflow/react";
import {GraphSidebarProvider} from "@/app/components/sidebar/graphSidebarProvider";
import "../globals.css";
import {CircularProgress} from "@mui/material";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useCurrentUser} from "@/app/hooks/useCurrentUser";
import {QuestProvider} from "@/app/components/quest/QuestContext";

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
    const router = useRouter();
    const {user, loading} = useCurrentUser();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [router, user, loading]);

    if (loading) {
        return <CircularProgress size={24} color="inherit"/>;
    }

    return <ReactQueryProvider>
        <ReactFlowProvider>
            <GraphSidebarProvider>
                <QuestProvider>
                    {children}
                </QuestProvider>
            </GraphSidebarProvider>
        </ReactFlowProvider>
    </ReactQueryProvider>
}
