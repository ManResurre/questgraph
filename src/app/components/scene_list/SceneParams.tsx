import {db, Param, Scene, SceneParam} from "@/lib/db";
import React from "react";
import {
    Button,
    Card, Checkbox,
    FormControl,
    FormControlLabel,
    List,
    ListItem,
    MenuItem,
    Stack,
    TextField
} from "@mui/material";
import {useLiveQuery} from "dexie-react-hooks";
import {Controller, useForm} from "react-hook-form";
import {useParams} from "next/navigation";

interface SceneParamsProps {
    scene?: Scene
}

interface ISceneParamsFormData {
    paramId: string;
    value: "";
    hide: boolean;
}

const SceneParams = ({scene}: SceneParamsProps) => {
    const {questId} = useParams();

    const {handleSubmit, control} = useForm<ISceneParamsFormData>({
        defaultValues: {
            paramId: "",
            value: "",
            hide: false
        }
    });

    const {sceneParams, allParams} = useLiveQuery(async () => {
        const paramsIds = (await db.scene_param.where('sceneId').equals(scene?.id!).toArray())
            .map((sp: SceneParam) => sp.paramId);

        const allParams = await db.params
            .where('questId')
            .equals(Number(questId))
            .toArray();

        const sceneParams = await db.params
            .where('id')
            .anyOf(paramsIds!)
            .toArray();

        return {sceneParams, allParams}
    }) ?? {sceneParams: [], allParams: []};

    const onSubmit = (data: ISceneParamsFormData) => {
    }

    return <Card variant="outlined">
        <Stack p={1} spacing={1}
               component="form"
               noValidate
               autoComplete="off"
               onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="paramId"
                control={control}
                render={({field: {value, onChange}}) => (
                    <TextField
                        required
                        select
                        id={'scene'}
                        key={'scene'}
                        value={value}
                        onChange={onChange}
                        placeholder={'Scene'}
                        label={'Scene'}
                        size="small"
                    >
                        {allParams.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.key} {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            />

            <FormControl fullWidth>
                <Controller
                    name={`value`}
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            variant="outlined"
                            value={value}
                            onChange={onChange}
                            placeholder={'Value'}
                            label={'Value'}
                            size="small"
                        />
                    )}
                />
            </FormControl>

            <FormControl>
                <Controller
                    name="hide"
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={value}
                                    onChange={(e) => onChange(e.target.checked)}
                                />
                            }
                            label="Скрыть"
                        />
                    )}
                />
            </FormControl>

            <Button size="small"
                    variant="contained"
                    type="submit"
                    fullWidth
            >Save</Button>
        </Stack>
        <List>
            {sceneParams && sceneParams.map((param: Param) =>
                <ListItem key={param.id}>{param.key} | {param.label} | {param.value}</ListItem>
            )}
        </List>
    </Card>
}

export default React.memo(SceneParams);
