import {useLiveQuery} from "dexie-react-hooks";
import {Choice, db, Scene} from "@/lib/db";
import {useParams} from "next/navigation";
import React, {useCallback, useMemo} from "react";
import {
    ListItem,
    List,
    ListItemText,
    IconButton,
    Chip,
    Typography,
    Autocomplete,
    Box,
    TextField,
    Stack
} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";
import LocationList from "@/app/components/choice/LocationList";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList as VirtualizedList} from "react-window";

export interface AvailableChoiceListParams {
    scenes: Scene[];
    choices: Choice[];
}

const OptimizedAutocomplete = React.memo(({scenes}: any) => {
    return <Autocomplete
        size={'small'}
        sx={{width: 300}}
        options={scenes}
        autoHighlight
        getOptionLabel={(option: Scene) => option.name}
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
})

const ChoiceItem = React.memo(({choice, scenes}: any) => {
    const {service} = useSceneContext();
    const locationList = useMemo(() => (
        <LocationList choiceId={choice.id}/>
    ), [choice.id]);

    const handleSelectClick = useCallback((choice: Choice) => {
        service?.addChoice(choice);
    }, [service]);

    return (
        <ListItem
            secondaryAction={
                <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelectClick(choice);
                    }}
                    sx={{mr: 0.5}}
                >
                    <CheckIcon color={false ? "success" : "primary"} fontSize="small"/>
                </IconButton>
            }
        >
            <ListItemText
                primary={choice.label}
                secondary={<Stack alignItems="flex-start" spacing={1}>
                    <Typography component={'div'}>{choice.text}</Typography>
                    {locationList}
                    <OptimizedAutocomplete scenes={scenes}/>
                </Stack>}
                slotProps={
                    {
                        secondary: {
                            component: "div"
                        }
                    }
                }
            />
        </ListItem>
    )
});

export default function AvailableChoiceList({scenes, choices}: AvailableChoiceListParams) {
    return <Box height="80vh" width="100%">
        <AutoSizer>
            {({height, width}) => (
                <VirtualizedList
                    height={height}
                    width={width}
                    itemCount={choices.length}
                    itemSize={200}
                    overscanCount={5}
                    itemData={choices}
                >
                    {({index, style, data}) => (
                        <Box style={style} key={`choice_${data[index].id}`}>
                            <ChoiceItem
                                choice={data[index]}
                                scenes={scenes}
                            />
                        </Box>
                    )}
                </VirtualizedList>
            )}
        </AutoSizer>
    </Box>
}
