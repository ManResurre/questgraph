import React from "react";
import {Autocomplete, Box, TextField} from "@mui/material";
import {Choice} from "@/lib/db";

export interface ScenesAutocompleteParams {
    choices: Choice[],
    onChange?: (...event: any[]) => void,
    value: any
}

const ChoiceAutocomplete = ({choices, onChange, value}: ScenesAutocompleteParams) => {
    return <Autocomplete
        size={'small'}
        options={choices}
        value={value}
        autoHighlight
        multiple
        getOptionLabel={(option: Choice) => `${option.label}-${option.text}`}
        onChange={(event, choice) => {
            if (onChange) {
                onChange(choice);
            }
        }}
        renderOption={(props, option) => {
            const {key, id, ...optionProps} = props;
            // console.log(optionProps);
            return (
                <Box
                    key={id}
                    component="li"
                    sx={{'& > img': {mr: 2, flexShrink: 0}}}
                    {...optionProps}
                >
                    {`${option.label}-${option.text}`}
                </Box>
            );
        }}
        renderInput={(params) => (
            <TextField
                {...params}
                label="Choose a Choice"
                size="small"
                slotProps={{
                    htmlInput: {
                        ...params.inputProps,
                        autoComplete: 'some text',
                    },
                }}
            />
        )}
    />
};

export default React.memo(ChoiceAutocomplete);
