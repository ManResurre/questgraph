import React from "react";
import {Controller, useFieldArray} from "react-hook-form";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import {darcula} from "@uiw/codemirror-theme-darcula";
import {langs} from "@uiw/codemirror-extensions-langs";
import {abbreviationTracker, expandAbbreviation} from "@emmetio/codemirror6-plugin";
import {Prec} from "@codemirror/state";
import {keymap} from "@codemirror/view";
import {Button} from "@mui/material";
import {db} from "@/lib/db";

const customTheme = EditorView.theme({
    '&': {
        fontSize: '18px'
    }
})

// db.scene_texts.put({text: 'test', sceneId: 1});

export default function SceneFormText({methods}: any) {
    const {fields, append, remove} = useFieldArray({
        control: methods.control,
        name: 'texts'
    });

    const prefix = 'texts';

    const addText = () => append({text: "div>p"});

    const getFieldName = (index: number, name: string) => {
        return `${prefix}.${index}.${name}`;
    }

    return <>
        <Button onClick={addText}>Add Text</Button>
        {fields.map((item, index) =>
            <Controller
                key={item.id}
                name={getFieldName(index, 'text')}
                control={methods.control}
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
        )}

    </>
}