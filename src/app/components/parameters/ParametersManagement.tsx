import React from "react";
import EditParameter from "@/app/components/parameters/EditParameter";
import {Box, Divider, Stack} from "@mui/material";
import ParametersList from "@/app/components/parameters/ParametersList";

const ParametersManagement = () => {
    return <Box p={1}>
        <Stack spacing={1}>
            <Divider/>
            <EditParameter/>
            <Divider/>
            <ParametersList/>
        </Stack>
    </Box>
}

export default React.memo(ParametersManagement);
