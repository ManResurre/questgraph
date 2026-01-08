import React from "react";
import {Box, IconButton, ListItem, ListItemText} from "@mui/material";
import {Edit as EditIcon} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import {Database} from "@/supabase";
import {useQueryClient} from "@tanstack/react-query";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";

type ParameterScene = Database["public"]["Tables"]["parameter_scene"]["Row"];

const useSceneParametersContext = () => {
    return {
        setEditingSceneParameter: (a:any) => {
            console.log(a);
        }
    }
}

const SceneParameterItem = ({parameter}: { parameter: ParameterScene }) => {
    const {setEditingSceneParameter} = useSceneParametersContext();
    const queryClient = useQueryClient();
    const {setLoading} = useSidebar();

    const handleDelete = async () => {
        setLoading(true);
        // await deleteSceneParameter(Number(parameter.id));
        await queryClient.invalidateQueries({queryKey: ["getSceneParameters", parameter.scene_id]});
        setLoading(false);
    };

    return (
        <ListItem
            secondaryAction={
                <Box>
                    <IconButton
                        onClick={() => setEditingSceneParameter(parameter)}
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
                primary={`param_id: ${parameter.param_id} := ${parameter.value ?? ""}`}
                slotProps={{
                    secondary: {
                        component: "div"
                    }
                }}
                sx={{
                    pr: 8,
                    minWidth: 0,
                    "& .MuiTypography-root": {
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "normal"
                    }
                }}
            />
        </ListItem>
    );
};

export default SceneParameterItem;
