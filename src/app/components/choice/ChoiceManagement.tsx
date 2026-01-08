import React from "react";
import EditChoice from "@/app/components/choice/EditChoice";
import {Divider, Stack} from "@mui/material";
import ChoiceList from "@/app/components/choice/ChoiceList";
import "./style.scss";

const ChoiceManagement = () => {

    return <Stack p={1}
                  spacing={1}
    >
        <EditChoice/>
        <Divider/>
        <ChoiceList/>
    </Stack>

}

export default React.memo(ChoiceManagement);
