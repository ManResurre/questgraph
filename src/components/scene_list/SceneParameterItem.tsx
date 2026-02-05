import React, {useMemo} from "react";
import {Box, IconButton, ListItem, ListItemText} from "@mui/material";
import {Edit as EditIcon} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import {useSidebar} from "@/components/sidebar/graphSidebarProvider";
import {useParameters} from "@/components/parameters/ParametersProvider";
import {ParameterScene} from "@/lib/ParametersRepository";
import {diff} from "@/lib/RepositoryHelper";

interface SceneParameterItemProps {
    parameterScene: ParameterScene
}

const SceneParameterItem = ({parameterScene}: SceneParameterItemProps) => {
    const {setEditingParameter, parameters, setEditingParameterScene} = useParameters();
    const {setLoading} = useSidebar();

    const handleDelete = async () => {
        setLoading(true);
        // await deleteSceneParameter(Number(parameter.id));
        // await queryClient.invalidateQueries({queryKey: ["getSceneParameters", parameterScene.scene_id]});
        setLoading(false);
    };

    const parameter = useMemo(() => parameters.find(p => p.id == parameterScene.param_id), [parameters])

    const handleEditParameterScene = () => {
        setEditingParameter(parameter ?? null)
        setEditingParameterScene(parameterScene ?? null)
    }

    const getValue = () => {
        if (!parameterScene.value || !parameter)
            return "";

        return JSON.stringify(diff(parameter, JSON.parse(parameterScene.value)))
    }

    return (
        <ListItem
            secondaryAction={
                <Box>
                    <IconButton
                        onClick={handleEditParameterScene}
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
                primary={`${parameter?.label} := ${getValue()}`}
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
