import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    Checkbox,
    FormControl,
    FormControlLabel,
    List,
    ListItem,
    MenuItem,
    Stack,
    TextField
} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import {useParams} from "next/navigation";
import {getSceneParameters} from "@/lib/ParametersRepository";
import supabase from "@/supabaseClient";

interface SceneParamsProps {
    sceneId: number;
}

interface ISceneParamsFormData {
    paramId: string;
    value: string;
    hide: boolean;
}

const SceneParams = ({sceneId}: SceneParamsProps) => {
    const {questId} = useParams();
    const {handleSubmit, control, reset} = useForm<ISceneParamsFormData>({
        defaultValues: {
            paramId: "",
            value: "",
            hide: false
        }
    });

    const [sceneParams, setSceneParams] = useState<any[]>([]);
    const [allParams, setAllParams] = useState<any[]>([]);

    // загрузка параметров сцены
    useEffect(() => {
        (async () => {
            const data = await getSceneParameters(sceneId);
            setSceneParams(data ?? []);
        })();
    }, [sceneId]);

    // загрузка всех параметров для квеста
    useEffect(() => {
        (async () => {
            const {data, error} = await supabase
                .from("parameters")
                .select("*")
                .eq("quest_id", questId);

            if (error) throw error;
            setAllParams(data ?? []);
        })();
    }, [questId]);

    const onSubmit = async (formData: ISceneParamsFormData) => {
        const {error} = await supabase.from("parameter_scene").insert({
            scene_id: sceneId,
            param_id: Number(formData.paramId),
            value: formData.value
            // поле hide можно хранить отдельно, если оно есть в схеме
        });

        if (error) {
            console.error(error);
            return;
        }

        reset();
        const data = await getSceneParameters(sceneId);
        setSceneParams(data ?? []);
    };

    return (
        <Card variant="outlined">
            <Stack
                p={1}
                spacing={1}
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
            >
                <Controller
                    name="paramId"
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            required
                            select
                            id="paramId"
                            value={value}
                            onChange={onChange}
                            label="Parameter"
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
                        name="value"
                        control={control}
                        render={({field: {value, onChange}}) => (
                            <TextField
                                variant="outlined"
                                value={value}
                                onChange={onChange}
                                placeholder="Value"
                                label="Value"
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

                <Button size="small" variant="contained" type="submit" fullWidth>
                    Save
                </Button>
            </Stack>

            <List>
                {sceneParams.map((param) => (
                    <ListItem key={param.id}>
                        param_id: {param.param_id} | value: {param.value}
                    </ListItem>
                ))}
            </List>
        </Card>
    );
};

export default React.memo(SceneParams);
