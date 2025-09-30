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
    Menu,
    MenuItem,
    MenuList,
    Stack,
    TextField
} from "@mui/material";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {
    AccountTree as NodeIcon, ExpandLess, ExpandMore, Help as HelpIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
    ViewQuilt as LayoutIcon
} from "@mui/icons-material";
import {useRef, useState} from "react";
import {useReactFlow} from "@xyflow/react";
import {SceneNodeData} from "@/app/components/rf/SceneNode";
import {useDebounce} from "@uidotdev/usehooks";

interface MiniDrawerProps {
    onLayout?: (direction?: string) => void
}

function Submenu({icon, label, open, items}:any) {
    const [submenuOpen, setSubmenuOpen] = useState(false);

    const handleClick = () => {
        setSubmenuOpen(!submenuOpen);
    };

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
                    {items.map((item:any, index:any) => (
                        <ListItemButton key={index} sx={{pl: 4}}>
                            <ListItemText primary={item}/>
                        </ListItemButton>
                    ))}
                </List>
            </Collapse>
        </>
    );
}

export default function MiniDrawer({onLayout}: MiniDrawerProps) {
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
                    {/*<MenuItem sx={{*/}
                    {/*    borderRadius: 1,*/}
                    {/*    mb: 0.5,*/}
                    {/*    '&:hover': {*/}
                    {/*        backgroundColor: 'rgba(100, 100, 120, 0.2)'*/}
                    {/*    }*/}
                    {/*}}>*/}
                    {/*    <ListItemIcon sx={{minWidth: 36, color: 'grey.400'}}>*/}
                    {/*        <SettingsIcon fontSize="small"/>*/}
                    {/*    </ListItemIcon>*/}
                    {/*    {open && <ListItemText*/}
                    {/*        primary="Настройки"*/}
                    {/*        sx={{*/}
                    {/*            '& .MuiTypography-root': {*/}
                    {/*                fontSize: '0.9rem',*/}
                    {/*                color: 'grey.300'*/}
                    {/*            }*/}
                    {/*        }}*/}
                    {/*    />}*/}
                    {/*</MenuItem>*/}
                    <Submenu
                        icon={<SettingsIcon fontSize="small"/>}
                        label="Настройки"
                        open={open}
                        items={["Subsetting 1", "Subsetting 2", "Subsetting 3"]}
                    />

                    <Submenu
                        icon={<NodeIcon fontSize="small"/>}
                        label="Ноды"
                        open={open}
                        items={["Subnode 1", "Subnode 2", "Subnode 3"]}
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
