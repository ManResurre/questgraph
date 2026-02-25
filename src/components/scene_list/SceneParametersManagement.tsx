import React from "react";
import EditParameter from "@/components/parameters/EditParameter";
import SceneParameterList from "@/components/scene_list/SceneParametrList";
import {ParameterInsert, ParameterScene} from "@/lib/ParametersRepository";
import {Stack} from "@mui/material";
import {useParameters} from "@/components/parameters/ParametersProvider";
import {useSidebar} from "@/components/sidebar/graphSidebarProvider";
import {useParametersSceneMutations} from "@/hooks/parameters.ts";
import ParametersSelector from "@/components/parameters/ParametersSelector.tsx";
import ParametersList from "@/components/parameters/ParametersList.tsx";

const SceneParametersManagement = () => {
    const {selectedElementData: {scene}} = useSidebar();
    const {
        editingParameterScene,
        setEditingParameterScene,
        setEditingParameter
    } = useParameters();
    const {upsertSceneParameter} = useParametersSceneMutations();

    const handleSubmit = async (p: ParameterInsert, ps: ParameterScene | null) => {
        await upsertSceneParameter({
            param_id: p.id,
            scene_id: scene.id,
            ...ps,
            value: JSON.stringify(p)
        })
        setEditingParameterScene(null)
        setEditingParameter(null)
    }

    return <Stack spacing={1}>
        <ParametersList renderItem={ParametersSelector}/>
        <EditParameter patch={editingParameterScene} onSubmit={handleSubmit}/>
        <SceneParameterList/>
    </Stack>
}

export default React.memo(SceneParametersManagement);
