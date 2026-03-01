import {memo} from "react";
import {Box, IconButton, ListItem} from "@mui/material";
import {Parameter} from "@/lib/ParametersRepository.ts";
import CheckIcon from "@mui/icons-material/Check";
import {useParameters} from "@/components/parameters/ParametersProvider.tsx";

const ParametersSelector = ({parameter}: { parameter: Parameter }) => {
    const {setEditingParameter} = useParameters();
    const handleSelect = () => {
        setEditingParameter(parameter)
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
