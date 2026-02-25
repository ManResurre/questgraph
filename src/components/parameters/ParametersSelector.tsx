import {memo} from "react";
import {Box, IconButton, ListItem} from "@mui/material";
import {Parameter} from "@/lib/ParametersRepository.ts";
import CheckIcon from "@mui/icons-material/Check";

const ParametersSelector = ({parameter}: { parameter: Parameter }) => {
    const handleSelect = () => {
        console.log(parameter);
    }

    const getColor = () => {
        // success
        return "primary" as const
    }

    return <ListItem
        secondaryAction={
            <Box>
                <IconButton
                    onClick={handleSelect}
                    sx={{mr: 0.5}}
                >
                    <CheckIcon color={getColor()} fontSize="small"/>
                </IconButton>
            </Box>
        }
    >
        {parameter.label}
    </ListItem>;
};

export default memo(ParametersSelector);
