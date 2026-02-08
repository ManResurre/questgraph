import React, {ReactNode, useEffect} from "react";
import {useNavigate} from "@tanstack/react-router";
import {ReactFlowProvider} from "@xyflow/react";
import {CircularProgress} from "@mui/material";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {GraphSidebarProvider} from "@/components/sidebar/graphSidebarProvider";
import {QuestProvider} from "@/components/quest/QuestContext";
import {useCurrentUser} from "@/hooks/useCurrentUser";

const queryClient = new QueryClient();

const QuestsLayout = ({children}: { children: ReactNode }) => {
    const navigate = useNavigate();
    const {user, loading} = useCurrentUser();

    useEffect(() => {
        if (!loading && !user) {
            navigate({to: "/"});
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div style={{padding: 20}}>
                <CircularProgress size={24} color="inherit"/>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <ReactFlowProvider>
                <GraphSidebarProvider>
                    <QuestProvider>{children}</QuestProvider>
                </GraphSidebarProvider>
            </ReactFlowProvider>
        </QueryClientProvider>
    );
}

export default React.memo(QuestsLayout);
