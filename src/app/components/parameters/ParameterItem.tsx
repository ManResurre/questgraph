import {Box, IconButton, ListItem, ListItemText} from "@mui/material";
import {Edit as EditIcon} from "@mui/icons-material";
import {Database} from "@/supabase";
import {useParameters} from "@/app/components/parameters/ParametersProvider";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";

type Parameter = Database["public"]["Tables"]["parameters"]["Row"];

const ParameterItem = ({parameter}: { parameter: Parameter }) => {
    const {setEditingParameter, deleteParameter} = useParameters();
    const {setLoading} = useSidebar()

    const handleDelete = async () => {
        setLoading(true);
        await deleteParameter(Number(parameter.id));
        setLoading(false);
    }

    return <ListItem
        secondaryAction={
            <Box>
                <IconButton
                    onClick={() => setEditingParameter(parameter)}
                    sx={{mr: 0.5}}
                >
                    <EditIcon fontSize="small"/>
                </IconButton>
                <IconButton
                    onClick={handleDelete}
                    sx={{mr: 0.5}}
                >
                    <DeleteIcon fontSize="small"/>
                </IconButton>
            </Box>
        }
    >
        <ListItemText
            primary={`[${parameter.key}] (${parameter.label}) := ${parameter.value}`}
            slotProps={
                {
                    secondary: {
                        component: "div"
                    }
                }
            }
            sx={{
                pr: 8,
                minWidth: 0,
                '& .MuiTypography-root': {
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                }
            }}
        />
    </ListItem>
};

export default ParameterItem;
