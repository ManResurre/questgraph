import React, {useCallback, useState} from "react";
import {Autocomplete, Box, TextField} from "@mui/material";
import {Scene} from "@/lib/SceneRepository.ts";

export interface ScenesAutocompleteParams {
    scenes?: Scene[],
    onChange?: (...event: any[]) => void,
    value?: Scene | null
}

const SceneAutocomplete = ({scenes, onChange, value}: ScenesAutocompleteParams) => {
    const [open, setOpen] = useState(false);

    const handleClose = useCallback((event: React.SyntheticEvent, reason: string) => {
        // if (reason === 'blur') {
        //     setTimeout(() => setOpen(false), 300);
        // } else {
        //     setOpen(false);
        // }

        setOpen(false);
    }, []);

    const handleChange = useCallback((event: React.SyntheticEvent, scene: Scene | null) => {
        if (onChange) {
            onChange(scene);
        }
        setOpen(false);
    }, []);

    return <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={handleClose}
        size={'small'}
        fullWidth
        sx={{width: '100%'}}
        options={scenes ?? []}
        value={value}
        autoHighlight
        // disablePortal
        getOptionLabel={(option: Scene) => `${option.name}`}
        onChange={handleChange}
        renderOption={(props, option) => {
            const {key, id, ...optionProps} = props;
            return (
                <Box
                    className=""
                    key={id}
                    component="li"
                    sx={{'& > img': {mr: 2, flexShrink: 0}}}
                    {...optionProps}
                >
                    {`${option.name}`}
                </Box>
            );
        }}
        renderInput={(params) => (
            <TextField
                {...params}
                fullWidth
                label="Choose a Next Scene"
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

export default React.memo(SceneAutocomplete);
