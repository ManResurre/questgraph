import React, {SyntheticEvent, useState} from "react";
import {Box} from "@mui/material";
import TabList from "@mui/lab/TabList";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import MainOptions from "./MainOptions";
import RangeValues from "./RangeValues";

function ValuesView() {
    const [tabValue, setTabValue] = useState('1');
    const handleChange = (event: SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

    return <TabContext value={tabValue}>
        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
                <Tab label="Main options" value="1"/>
                <Tab label="Values" value="2"/>
            </TabList>
        </Box>
        <TabPanel value="1">
            <MainOptions/>
        </TabPanel>
        <TabPanel value="2">
            <RangeValues/>
        </TabPanel>
    </TabContext>
}

export default ValuesView;
