import React, {useEffect} from "react";
import EditParameter from "@/app/components/parameters/EditParameter";
import SceneParameterList from "@/app/components/scene_list/SceneParametrList";
import {ParameterInsert, ParameterScene} from "@/lib/ParametersRepository";
import {Box, Stack} from "@mui/material";
import {useParameters} from "@/app/components/parameters/ParametersProvider";
import ParametersList from "@/app/components/parameters/ParametersList";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";

const SceneParametersManagement = () => {
    const {selectedElementData: {data: scene}} = useSidebar();
    const {upsertSceneParameter, editingParameterScene, setEditingParameterScene} = useParameters();
    // console.log(editingParameterScene);

    const handleSubmit = async (p: ParameterInsert, ps: ParameterScene | null) => {
        await upsertSceneParameter({
            param_id: p.id,
            scene_id: scene.id,
            ...ps,
            value: JSON.stringify(p)
        })
        setEditingParameterScene(null)
    }
    return <Stack spacing={1}>
        <ParametersList/>
        <EditParameter patch={editingParameterScene} onSubmit={handleSubmit}/>
        <SceneParameterList/>
    </Stack>
}

export default React.memo(SceneParametersManagement);
