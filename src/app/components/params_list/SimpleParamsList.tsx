import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import {useLiveQuery} from "dexie-react-hooks";
import {db, Param} from "@/lib/db";
import Stack from "@mui/material/Stack";
import {Box, Divider, IconButton, Typography} from "@mui/material";
import KeyIcon from '@mui/icons-material/Key';
import {Delete, Edit} from "@mui/icons-material";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";

export interface SimpleParamsListParams {
    questId: number;
}

const SimpleParamsList = ({questId}: SimpleParamsListParams) => {
    const {service} = useSceneContext();
    const params = useLiveQuery(() => {
        return db.params.where('questId').equals(questId).toArray();
    })

    const handleEditClick = (param: Param) => {
        if (service)
            service.setEditParam(param);
    }
    const handleDeleteClick = (param: Param) => {
        db.params.where('id').equals(param.id!).delete();
    }

    return <List>
        {params && params.map((param: Param) =>
            <ListItem
                key={param.id}
                secondaryAction={<>
                    <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(param);
                        }}
                        sx={{mr: 0.5}}
                    >
                        <Edit fontSize="small"/>
                    </IconButton>
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(param);
                        }}
                    >
                        <Delete fontSize="small" color="error"/>
                    </IconButton>
                </>
                }
            >
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    divider={<Divider orientation="vertical" flexItem/>}
                >
                    <Box display="flex" alignItems="center">
                        <KeyIcon fontSize="small" color="action"/>
                        <Typography variant="body2" ml={1}>{param.key}</Typography>
                    </Box>

                    <Typography variant="body1" sx={{flexGrow: 1}}>
                        {param.label}
                    </Typography>

                    <Typography variant="h6" color="primary">
                        {param.value}
                    </Typography>
                </Stack>
            </ListItem>
        )}
    </List>
}

export default React.memo(SimpleParamsList);
