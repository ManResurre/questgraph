import React, {useEffect, useState} from 'react';
import {
    Card,
    TextField,
    InputAdornment,
    MenuList,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    IconButton,
    Stack
} from '@mui/material';
import {
    Search as SearchIcon,
    AccountTree as NodeIcon,
    Settings as SettingsIcon,
    Help as HelpIcon,
    ViewQuilt as LayoutIcon
} from '@mui/icons-material';
import {Panel, useReactFlow} from "@xyflow/react";
import {useDebounce} from "@uidotdev/usehooks";
import {SceneNodeData} from "@/app/components/rf/SceneNode";

const NodeMenu = ({onLayout}:any) => {
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchTerm = useDebounce(searchValue, 300);
    const {setCenter, getNodes} = useReactFlow();


    React.useEffect(() => {
        const nodes = getNodes() as unknown as SceneNodeData[];
        const filteredNodes = nodes.filter(({data}) => {
            return data.name.toLocaleUpperCase().indexOf(searchValue.toLocaleUpperCase()) !== -1;
        })

        if (!filteredNodes.length)
            return;

        const focusNone = filteredNodes[0];
        const zoom = 0.7;
        setCenter(focusNone.position.x, focusNone.position.y, {zoom, duration: 1000});
    }, [debouncedSearchTerm]);

    return (
        <Panel position="top-right">
            <Card sx={{
                width: 280,
                p: 1.5,
                background: 'rgba(35, 35, 45, 0.95)',
                border: '1px solid rgba(100, 100, 120, 0.3)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Поле поиска */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Поиск ноды..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    slotProps={{
                        input:{
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

                <Divider sx={{my: 1, borderColor: 'rgba(100, 100, 120, 0.3)'}}/>

                {/* Меню */}
                <MenuList sx={{p: 0}}>
                    <MenuItem sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                            backgroundColor: 'rgba(100, 100, 120, 0.2)'
                        }
                    }}>
                        <ListItemIcon sx={{minWidth: 36, color: 'grey.400'}}>
                            <NodeIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary="Ноды"
                            sx={{
                                '& .MuiTypography-root': {
                                    fontSize: '0.9rem',
                                    color: 'grey.300'
                                }
                            }}
                        />
                    </MenuItem>

                    <MenuItem sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                            backgroundColor: 'rgba(100, 100, 120, 0.2)'
                        }
                    }}>
                        <ListItemIcon sx={{minWidth: 36, color: 'grey.400'}}>
                            <SettingsIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary="Настройки"
                            sx={{
                                '& .MuiTypography-root': {
                                    fontSize: '0.9rem',
                                    color: 'grey.300'
                                }
                            }}
                        />
                    </MenuItem>

                    <MenuItem sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                            backgroundColor: 'rgba(100, 100, 120, 0.2)'
                        }
                    }}>
                        <ListItemIcon sx={{minWidth: 36, color: 'grey.400'}}>
                            <HelpIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary="Помощь"
                            sx={{
                                '& .MuiTypography-root': {
                                    fontSize: '0.9rem',
                                    color: 'grey.300'
                                }
                            }}
                        />
                    </MenuItem>
                </MenuList>

                <Divider sx={{my: 1, borderColor: 'rgba(100, 100, 120, 0.3)'}}/>

                {/* Кнопка переключения лэйаута */}
                <Stack direction="row" justifyContent="center">
                    <IconButton
                        onClick={() => onLayout('LR')}
                        size="small"
                        sx={{
                            color: 'grey.400',
                            '&:hover': {
                                color: 'primary.main',
                                backgroundColor: 'rgba(100, 100, 120, 0.2)'
                            }
                        }}
                        title="Горизонтальный layout"
                    >
                        <LayoutIcon/>
                    </IconButton>
                </Stack>
            </Card>
        </Panel>
    );
};

export default React.memo(NodeMenu);
