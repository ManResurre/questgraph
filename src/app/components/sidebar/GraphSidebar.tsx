import {Box, Drawer} from "@mui/material";
import React from "react";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import SceneNodeEdit from "@/app/components/rf/SceneNodeEdit";

export default function GraphSidebar() {
    const {isSidebarOpen, closeSidebar, selectedElementData} = useSidebar();

    const DrawerContent = (
        <Box sx={{width: 350}}>
            {selectedElementData && <SceneNodeEdit data={selectedElementData.data}/>}
        </Box>
    );

    return <Drawer open={isSidebarOpen} onClose={() => closeSidebar()}>
        {DrawerContent}
    </Drawer>
}