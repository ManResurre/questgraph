import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
    Drawer,
    IconButton,
    InputAdornment,
    ListItemButton,
    MenuItem,
    MenuList,
    TextField
} from "@mui/material";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {
    AccountTree as NodeIcon, AltRoute,
    Search as SearchIcon,
    Settings as SettingsIcon,
    ViewQuilt as LayoutIcon
} from "@mui/icons-material";
import Submenu from "@/app/components/sidebar/Submenu";
import {useCallback, useEffect, useState} from "react";
import {useReactFlow} from "@xyflow/react";
import {SceneNodeData} from "@/app/components/rf/SceneNode";
import {useDebounce} from "@uidotdev/usehooks";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import useFileLoader from "@/app/components/sidebar/fileLoader";
import {useParams} from "next/navigation";
import {usePlayer} from "@/app/components/sidebar/PlayerProvider";
import {clearChoices} from "@/lib/ChoiceRepository";
import {clearScenes} from "@/lib/SceneRepository";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import UploadIcon from '@mui/icons-material/Upload';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import TuneIcon from "@mui/icons-material/Tune";
import BuildIcon from "@mui/icons-material/Build";

interface MiniDrawerProps {
    onLayout?: (direction?: string) => void
}

const GraphMenuSidebar = ({onLayout}: MiniDrawerProps) => {
    const {questId} = useParams();
    const {setTypeDraggable, openSidebar} = useSidebar();
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchTerm = useDebounce(searchValue, 300);
    const {setOpenModal} = usePlayer();

    const {loadFile, isLoading} = useFileLoader();
    const {setCenter, getNodes} = useReactFlow();

    const toggleDrawer = () => {
        setOpen(!open);
        localStorage.setItem('GraphMenuSidebarOpen', String(!open))
    }

    useEffect(() => {
        const open = JSON.parse(localStorage.getItem('GraphMenuSidebarOpen') ?? "false");
        setOpen(open);
    }, [])


    useEffect(() => {
        const nodes = getNodes() as SceneNodeData[];
        const filteredNodes = nodes.filter(({data}) => {
            return data.name.toLocaleUpperCase().indexOf(searchValue.toLocaleUpperCase()) !== -1;
        })

        if (!filteredNodes.length)
            return;

        const focusNone = filteredNodes[0];
        const zoom = 0.7;
        setCenter(focusNone.position.x, focusNone.position.y, {zoom, duration: 1000});
    }, [debouncedSearchTerm]);


    const nodeTemplates = [
        {name: 'Scene', type: 'sceneNode'},
        {name: 'Default', type: 'default'}
    ]

    const settings = [
        {
            name: 'load from file',
            click: () => loadFile(Number(questId)),
            icon: <UploadIcon/>
        },
        {
            name: 'clear scenes',
            click: () => clearScenes(Number(questId)),
            icon: <CleaningServicesIcon/>
        },
        {
            name: 'clear choices',
            click: () => clearChoices(Number(questId)),
            icon: <CleaningServicesIcon/>
        }
    ]

    const choices = [
        {
            name: 'manage',
            click: () => openSidebar({flags: {newChoice: true}}),
            icon: <ManageSearchIcon fontSize="small"/>
        },
    ]

    const parameters = [
        {
            name: 'manage',
            click: () => openSidebar({flags: {parameters: true}}),
            icon: <BuildIcon fontSize="small"/>
        },
    ]

    const handleSettingsClick = (index: number) => {
        settings[index].click()
    }
    const handleChoicesClick = (index: number) => {
        choices[index].click()
    }

    const handleParametersClick = (index: number) => {
        parameters[index].click()
    }

    const onDragStart = ({
                             event,
                             index,
                         }: { event: React.DragEvent, index: number }) => {
        const nodeType = nodeTemplates[index].type;
        event.dataTransfer.setData('text/plain', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setTypeDraggable(nodeType);
    };

    const handlePlay = useCallback(() => {
        setOpenModal(true);
    }, [setOpenModal])

    return <>
        <Drawer
            variant="permanent"
            anchor="right"
            open={open}
            sx={{
                '& .MuiDrawer-paper': {
                    background: 'rgba(35, 35, 45, 0.95)',
                    marginTop: '64px'
                },
            }}
        >
            <Box>
                {open && <Box p={1}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Поиск ноды..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{color: 'grey.500', fontSize: 20}}/>
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(50, 50, 60, 0.7)',
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(100, 100, 120, 0.3)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(100, 100, 120, 0.5)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(100, 150, 250, 0.8)',
                                        borderWidth: '1px',
                                    }
                                }
                            }
                        }}
                        sx={{mb: 1.5}}
                    />
                </Box>}

                <MenuList sx={{p: 0, justifyContent: 'center'}}>
                    <MenuItem onClick={handlePlay}>
                        <ListItemIcon sx={{minWidth: 36, color: 'grey.400'}}>
                            <PlayArrowIcon/>
                        </ListItemIcon>
                        {open && <ListItemText primary="Play"/>}
                    </MenuItem>
                    <Submenu
                        icon={<SettingsIcon fontSize="small"/>}
                        label="Settings"
                        open={open}
                        items={settings}
                        itemProps={{
                            handlers: {
                                onClick: (event: React.SyntheticEvent, index) => handleSettingsClick(index)
                            }
                        }}
                    />
                    <Divider/>
                    <Submenu
                        icon={<NodeIcon fontSize="small"/>}
                        label="Nodes"
                        open={open}
                        items={nodeTemplates.map(node => ({
                            name: node.name
                        }))}
                        component={ListItemButton}
                        itemProps={{
                            static: {
                                draggable: true,
                                className: "draggable-node"
                            },
                            handlers: {
                                onDragStart: (event: React.SyntheticEvent, index) => onDragStart({
                                    event: event as React.DragEvent,
                                    index
                                }),
                            }
                        }}
                    />
                    <Submenu
                        icon={<AltRoute fontSize="small"/>}
                        label="Choices"
                        open={open}
                        items={choices}
                        itemProps={{
                            handlers: {
                                onClick: (event: React.SyntheticEvent, index) => handleChoicesClick(index)
                            }
                        }}
                    />
                    <Submenu
                        icon={<TuneIcon fontSize="small"/>}
                        label="Parameters"
                        open={open}
                        items={parameters}
                        itemProps={{
                            handlers: {
                                onClick: (event: React.SyntheticEvent, index) => handleParametersClick(index)
                            }
                        }}
                    />
                </MenuList>
                <Divider/>
                {onLayout &&
                    <Box display='flex' justifyContent="center">
                        <IconButton
                            onClick={() => onLayout('LR')}
                            size="small"
                            title="Горизонтальный layout"
                        >
                            <LayoutIcon/>
                        </IconButton>

                        <IconButton onClick={toggleDrawer}>
                            {open ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                        </IconButton>
                    </Box>
                }
            </Box>
        </Drawer>
    </>
}

export default React.memo(GraphMenuSidebar);
