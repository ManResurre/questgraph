import React from "react";
import {Autocomplete, Box, TextField} from "@mui/material";
import {Choice, Scene} from "@/lib/db";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";

export interface ScenesAutocompleteParams {
    scenes: Scene[];
    choice: Choice;
}

const ScenesAutocomplete = ({scenes, choice}: ScenesAutocompleteParams) => {
    const {service} = useSceneContext();
    const handleSceneChange = (scene: Scene | null) => {
        service?.setNextScene(choice.id!, scene?.id);
    }

    const defaultValue = scenes.find(scene => scene.id === choice.nextSceneId) || null;

    return <Autocomplete
        size={'small'}
        sx={{width: 300}}
        options={scenes}
        value={defaultValue}
        autoHighlight
        getOptionLabel={(option: Scene) => option.name}
        onChange={(event, scene) => {
            handleSceneChange(scene);
        }}
        renderOption={(props, option) => {
            const {key, ...optionProps} = props;
            return (
                <Box
                    key={key}
                    component="li"
                    sx={{'& > img': {mr: 2, flexShrink: 0}}}
                    {...optionProps}
                >
                    {option.name}
                </Box>
            );
        }}
        renderInput={(params) => (
            <TextField
                {...params}
                label="Choose a Scene"
                slotProps={{
                    htmlInput: {
                        ...params.inputProps,
                        autoComplete: 'new-password',
                    },
                }}
            />
        )}
    />
};

export default React.memo(ScenesAutocomplete);
