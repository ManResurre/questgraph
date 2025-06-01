'use client';
import {Controller, useFormContext} from "react-hook-form";
import {Stack, TextField} from "@mui/material";
import React from "react";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import {darcula} from "@uiw/codemirror-theme-darcula";
import {langs} from "@uiw/codemirror-extensions-langs";
import {abbreviationTracker, expandAbbreviation} from "@emmetio/codemirror6-plugin";
import {Prec} from "@codemirror/state";
import {keymap} from "@codemirror/view";

const customTheme = EditorView.theme({
    '&': {
        fontSize: '18px'
    }
})

export interface ChoiceFormProps {
    index: number;
    prefix: string;
}

function ChoiceForm({index, prefix}: ChoiceFormProps) {
    const {control} = useFormContext<any>();
    const getFieldName = (name: string) => {
        return `${prefix}.${index}.${name}`;
    }

    return <Stack spacing={1}>
        <Controller
            name={getFieldName('label')}
            control={control}
            render={({field: {value, onChange}}) => (
                <TextField
                    id={'label'}
                    key={'label'}
                    value={value}
                    onChange={onChange}
                    placeholder={'Label'}
                    label={'Label'}
                    size="small"
                />
            )}
        />

        <Controller
            name={getFieldName('text')}
            control={control}
            render={({field: {value, onChange}}) => (
                <CodeMirror
                    value={value}
                    theme={darcula}
                    extensions={[
                        langs.html(),
                        abbreviationTracker(),
                        customTheme,
                        Prec.highest(
                            keymap.of([
                                {
                                    key: "Tab", run: expandAbbreviation
                                }
                            ])
                        )
                    ]}
                    onChange={onChange}
                />)}
        />

        {/*<Controller*/}
        {/*    name={getFieldName('nextSceneId')}*/}
        {/*    control={control}*/}
        {/*    render={({field: {value, onChange}}) => (*/}
        {/*        <TextField*/}
        {/*            id={'nextSceneId'}*/}
        {/*            key={'nextSceneId'}*/}
        {/*            value={value}*/}
        {/*            onChange={onChange}*/}
        {/*            placeholder={'NextSceneId'}*/}
        {/*            label={'NextSceneId'}*/}
        {/*            size="small"*/}
        {/*        />*/}
        {/*    )}*/}
        {/*/>*/}

        {/*<Controller*/}
        {/*    name={getFieldName('requiredItem')}*/}
        {/*    control={control}*/}
        {/*    render={({field: {value, onChange}}) => (*/}
        {/*        <TextField*/}
        {/*            id={'requiredItem'}*/}
        {/*            key={'requiredItem'}*/}
        {/*            value={value}*/}
        {/*            onChange={onChange}*/}
        {/*            placeholder={'RequiredItem'}*/}
        {/*            label={'RequiredItem'}*/}
        {/*            size="small"*/}
        {/*        />*/}
        {/*    )}*/}
        {/*/>*/}

        {/*<Controller*/}
        {/*    name={getFieldName('weight')}*/}
        {/*    control={control}*/}
        {/*    render={({field: {value, onChange}}) => (*/}
        {/*        <TextField*/}
        {/*            type="number"*/}
        {/*            id={'weight'}*/}
        {/*            key={'weight'}*/}
        {/*            value={value}*/}
        {/*            onChange={onChange}*/}
        {/*            placeholder={'Weight'}*/}
        {/*            label={'Weight'}*/}
        {/*            size="small"*/}
        {/*        />*/}
        {/*    )}*/}
        {/*/>*/}

        {/*<Controller*/}
        {/*    name={getFieldName('moralEffect')}*/}
        {/*    control={control}*/}
        {/*    render={({field: {value, onChange}}) => (*/}
        {/*        <TextField*/}
        {/*            type="number"*/}
        {/*            id={'moralEffect'}*/}
        {/*            key={'moralEffect'}*/}
        {/*            value={value}*/}
        {/*            onChange={onChange}*/}
        {/*            placeholder={'MoralEffect'}*/}
        {/*            label={'MoralEffect'}*/}
        {/*            size="small"*/}
        {/*        />*/}
        {/*    )}*/}
        {/*/>*/}
    </Stack>
}

export default ChoiceForm;
