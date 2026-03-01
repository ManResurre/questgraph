import React from "react";
import EditParameter from "@/components/parameters/EditParameter";
import SceneParameterList from "@/components/scene_list/SceneParametrList";
import {Stack} from "@mui/material";
import ParametersSelector from "@/components/parameters/ParametersSelector.tsx";
import ParametersList from "@/components/parameters/ParametersList.tsx";

const SceneParametersManagement = () => {
    return <Stack spacing={1}>
        <ParametersList renderItem={ParametersSelector}/>
        <EditParameter/>
        <SceneParameterList/>
    </Stack>
}

export default React.memo(SceneParametersManagement);
