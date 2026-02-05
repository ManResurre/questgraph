import {ReactNode, useState} from "react";
import * as React from "react";
import {Collapse, ListItemButton, MenuItem} from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import List from "@mui/material/List";

interface SubmenuProps {
    icon: ReactNode;
    label: string;
    open: boolean;
    items: {
        name: string;
        icon?: React.JSX.Element
    }[];
    component?: React.ElementType;
    itemProps?: {
        // Статические пропсы (применяются ко всем элементам)
        static?: any;
        // Динамические обработчики (получают index)
        handlers?: {
            [key: string]: (event: React.SyntheticEvent, index: number) => void;
        };
    };
}

const Submenu = ({icon, label, open, items, component = ListItemButton, itemProps}: SubmenuProps) => {
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
                    {items.map((item, index) => {
                        // замыкаю index
                        const dynamicHandlers =
                            Object.keys(itemProps?.handlers || {})
                                .reduce((acc, handlerName) => {
                                    acc[handlerName] = (event: any) => itemProps!.handlers![handlerName](event, index);
                                    return acc;
                                }, {} as any);

                        return <Component
                            key={index}
                            sx={{pl: 4}}
                            {...itemProps?.static}
                            {...dynamicHandlers}
                        >
                            {item.icon && <ListItemIcon sx={{minWidth: 36, color: 'grey.400'}}>
                                {item.icon}
                            </ListItemIcon>}
                            <ListItemText primary={item.name}/>
                        </Component>
                    })}
                </List>
            </Collapse>
        </>
    );
}

export default React.memo(Submenu);
