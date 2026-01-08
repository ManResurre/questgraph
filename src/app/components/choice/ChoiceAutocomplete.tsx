import React, { useMemo } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import {Database} from "@/supabase";

type Choice = Database["public"]["Tables"]["choice"]["Row"];

export interface ScenesAutocompleteParams {
    choices: Choice[];
    onChange?: (...event: any[]) => void;
    value: any;
}

const ChoiceAutocomplete = ({ choices, onChange, value }: ScenesAutocompleteParams) => {
    const [searchTerm, setSearchTerm] = React.useState("");

    // сортировка с приоритетом полного совпадения
    const sortedChoices = useMemo(() => {
        if (!choices) return [];
        if (!searchTerm) return choices;

        const term = searchTerm.toLowerCase();

        return [...choices].sort((a: Choice, b: Choice) => {
            const aLabel = a.label?.toLowerCase();
            const aText = a.text?.toLowerCase();
            const bLabel = b.label?.toLowerCase();
            const bText = b.text?.toLowerCase();

            const aExact = aLabel === term || aText === term ? 1 : 0;
            const bExact = bLabel === term || bText === term ? 1 : 0;

            return bExact - aExact; // сначала полные совпадения
        });
    }, [choices, searchTerm]);

    return (
        <Autocomplete
            size="small"
            options={sortedChoices}
            value={value}
            autoHighlight
            multiple
            getOptionLabel={(option: Choice) => `${option.label}-${option.text}`}
            onChange={(event, choice) => {
                if (onChange) {
                    onChange(choice);
                }
            }}
            onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue);
            }}
            renderOption={(props, option) => {
                const { key, id, ...optionProps } = props;
                return (
                    <Box
                        key={id}
                        component="li"
                        sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
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
                            autoComplete: "some text",
                        },
                    }}
                />
            )}
        />
    );
};

export default React.memo(ChoiceAutocomplete);
