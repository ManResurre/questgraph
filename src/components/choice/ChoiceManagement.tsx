import React from "react";
import {Divider, Stack} from "@mui/material";
import EditChoice from "@/components/choice/EditChoice";
import ChoiceList from "@/components/choice/ChoiceList";
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
