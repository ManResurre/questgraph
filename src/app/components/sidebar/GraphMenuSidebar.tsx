import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
    Collapse,
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
    AccountTree as NodeIcon, ExpandLess, ExpandMore,
    Search as SearchIcon,
    Settings as SettingsIcon,
    ViewQuilt as LayoutIcon
} from "@mui/icons-material";
import {ReactNode, useState} from "react";
import {useReactFlow} from "@xyflow/react";
import {SceneNodeData} from "@/app/components/rf/SceneNode";
import {useDebounce} from "@uidotdev/usehooks";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";

interface MiniDrawerProps {
    onLayout?: (direction?: string) => void
}

interface SubmenuProps {
    icon: ReactNode;
    label: string;
    open: boolean;
    items: string[];
    component?: React.ElementType;
    slotProps?: any;
}

function Submenu({icon, label, open, items, component = ListItemButton, slotProps}: SubmenuProps) {
    const [submenuOpen, setSubmenuOpen] = useState(false);

    const handleClick = () => {
        setSubmenuOpen(!submenuOpen);
    };

    const Component = component;

    return (
        <>
            <MenuItem onClick={handleClick} sx={{borderRadius: 1, mb: 0.5}}>
                <ListItemIcon sx={{minWidth: 36, color: 'grey.400'}}>
                    {icon}
                </ListItemIcon>
                {open && <ListItemText primary={label}/>}
                {submenuOpen ? <ExpandLess/> : <ExpandMore/>}
            </MenuItem>

            <Collapse in={submenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {items.map((item, index) => (
                        <Component
                            key={index}
                            sx={{pl: 4}}
                            {...slotProps}
                            onDragStart={(event: React.DragEvent) => slotProps?.onDragStart(event, index)}
                        >
                            <ListItemText primary={item}/>
                        </Component>
                    ))}
                </List>
            </Collapse>
        </>
    );
}

export default function MiniDrawer({onLayout}: MiniDrawerProps) {
    const {setTypeDraggable} = useSidebar();
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchTerm = useDebounce(searchValue, 300);

    const toggleDrawer = () => {
        setOpen(!open);
    }

    const {setCenter, getNodes} = useReactFlow();

    React.useEffect(() => {
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
        {name:''}
    ]

    const onDragStart = ({
                             event,
                             index,
                         }: { event: React.DragEvent, index: number }) => {
        const nodeType = nodeTemplates[index].type;
        event.dataTransfer.setData('text/plain', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setTypeDraggable(nodeType);
    };

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
                    <Submenu
                        icon={<SettingsIcon fontSize="small"/>}
                        label="Settings"
                        open={open}
                        items={[" example1", "example 2", "example 3"]}
                    />
                    <Divider/>
                    <Submenu
                        icon={<NodeIcon fontSize="small"/>}
                        label="Nodes"
                        open={open}
                        items={nodeTemplates.map(node => node.name)}
                        component={ListItemButton}
                        slotProps={{
                            onDragStart: (event: React.DragEvent, index: number) => onDragStart({
                                event,
                                index
                            }),
                            draggable: true,
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
