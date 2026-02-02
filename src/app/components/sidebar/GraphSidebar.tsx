import {Box, Drawer, useMediaQuery, useTheme} from "@mui/material";
import React, {useEffect, useRef} from "react";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import SceneNodeEdit from "@/app/components/rf/SceneNodeEdit";
import EdgeEdit from "@/app/components/rf/EdgeEdit";
import ChoiceManagement from "@/app/components/choice/ChoiceManagement";
import {ChoiceProvider} from "@/app/components/choice/ChoiceProvider";
import ParametersManagement from "@/app/components/parameters/ParametersManagement";
import {ParametersProvider} from "@/app/components/parameters/ParametersProvider";
import SceneParametersManagement from "@/app/components/scene_list/SceneParametersManagement";

const GraphSidebar = () => {
    const {
        isSidebarOpen,
        closeSidebar,
        selectedElementData,
        flags,
        loading,
    } = useSidebar();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [width, setWidth] = React.useState(400);
    const isResizing = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(300);

    const handleMouseDown = (e: React.MouseEvent) => {
        isResizing.current = true;
        startX.current = e.clientX;
        startWidth.current = width;

        // Блокируем выделение текста при резизе
        e.preventDefault();

        // Добавляем класс для изменения курсора на весь документ
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
        const updateWidth = () => {
            const diff = e.clientX - startX.current;
            const newWidth = Math.max(300, Math.min(800, startWidth.current + diff));
            setWidth(newWidth);
        };

        requestAnimationFrame(updateWidth);
    }, []);

    const handleMouseUp = React.useCallback(() => {
        if (!isResizing.current) return;

        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    if (isMobile) {
        return (
            <Drawer
                open={isSidebarOpen}
                onClose={() => closeSidebar()}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '100%',
                        maxWidth: '100vw',
                    }
                }}
            >
                <Box sx={{width: '100%'}}>
                    {selectedElementData && <SceneNodeEdit data={selectedElementData.data}/>}
                </Box>
            </Drawer>
        );
    }

    return (
        <Drawer
            anchor="left"
            open={isSidebarOpen}
            onClose={() => closeSidebar()}
            sx={{
                '& .MuiDrawer-paper': {
                    width: width,
                    overflow: 'visible',
                    position: 'relative',
                }
            }}
        >
            {/* Кастомная ручка для резиза */}
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    position: 'absolute',
                    right: '-4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '40px',
                    backgroundColor: '#ccc',
                    borderRadius: '2px',
                    cursor: 'col-resize',
                    zIndex: 1300,
                    '&:hover': {
                        backgroundColor: '#999',
                    },
                    '&:active': {
                        backgroundColor: '#666',
                    },
                }}
            />

            <Box
                p={1}
                sx={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                }}
                className={loading ? "noise-effect" : ""}
            >
                {flags.editScene && <SceneNodeEdit data={selectedElementData.data}/>}
                {flags.editChoice && <EdgeEdit data={selectedElementData.edge}/>}
                {flags.newChoice &&
                    <ChoiceProvider>
                        <ChoiceManagement/>
                    </ChoiceProvider>
                }
                {flags.parameters &&
                    <ParametersProvider>
                        <ParametersManagement/>
                    </ParametersProvider>
                }
                {flags.editSceneParams &&
                    <ParametersProvider>
                        <SceneParametersManagement/>
                    </ParametersProvider>
                }
            </Box>
        </Drawer>
    );
}

export default React.memo(GraphSidebar);
