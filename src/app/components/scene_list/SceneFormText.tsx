import React, {useState, useEffect} from "react";
import {Controller, useFieldArray} from "react-hook-form";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import {darcula} from "@uiw/codemirror-theme-darcula";
import {langs} from "@uiw/codemirror-extensions-langs";
import {abbreviationTracker, expandAbbreviation} from "@emmetio/codemirror6-plugin";
import {Prec} from "@codemirror/state";
import {keymap} from "@codemirror/view";
import {Button, Box, Select, MenuItem, IconButton, Typography, FormControl, InputLabel} from "@mui/material";
import {Add, Delete, NavigateBefore, NavigateNext} from "@mui/icons-material";

const customTheme = EditorView.theme({
    '&': {
        fontSize: '18px'
    }
})

export default function SceneFormText({methods}: any) {
    const {fields, append, remove} = useFieldArray({
        control: methods.control,
        name: 'texts'
    });

    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(prev => {
            if (fields.length === 0) return 0;
            if (prev >= fields.length) return fields.length - 1;
            return prev;
        });
    }, [fields.length]);

    const addText = () => {
        append({text: "div>p"});
        setCurrentPage(fields.length)
    };

    const removeCurrent = () => {
        if (fields.length > 1) {
            remove(currentPage);
        }
    };

    const nextPage = () => {
        if (currentPage < fields.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const getFieldName = (index: number, name: string) => {
        return `texts.${index}.${name}`;
    }

    if (fields.length === 0) {
        return (
            <Box sx={{textAlign: 'center', py: 1}}>
                <Button
                    variant="contained"
                    startIcon={<Add/>}
                    onClick={addText}
                >
                    Add First Text Field
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                p: 1,
                backgroundColor: 'background.default',
                borderRadius: 1
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <IconButton
                        size="small"
                        onClick={addText}
                    >
                        <Add/>
                    </IconButton>

                    <IconButton
                        onClick={removeCurrent}
                        disabled={fields.length <= 1}
                    >
                        <Delete/>
                    </IconButton>
                </Box>

                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <IconButton onClick={prevPage} disabled={currentPage === 0}>
                        <NavigateBefore/>
                    </IconButton>

                    <FormControl variant="outlined" size="small" sx={{minWidth: 120}}>
                        <InputLabel>Page</InputLabel>
                        <Select
                            value={currentPage}
                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                            label="Page"
                        >
                            {fields.map((_, index) => (
                                <MenuItem key={index} value={index}>
                                    Text {index + 1}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="body2">
                        of {fields.length}
                    </Typography>

                    <IconButton onClick={nextPage} disabled={currentPage === fields.length - 1}>
                        <NavigateNext/>
                    </IconButton>
                </Box>
            </Box>

            {fields.map((item, index) => (
                <Box key={item.id} sx={{display: index === currentPage ? 'block' : 'none'}}>
                    <Controller
                        name={getFieldName(index, 'text')}
                        control={methods.control}
                        render={({field: {value, onChange}}) => (
                            <CodeMirror
                                value={value}
                                theme={darcula}
                                minHeight="100px"
                                extensions={[
                                    langs.html(),
                                    abbreviationTracker(),
                                    customTheme,
                                    EditorView.lineWrapping,
                                    Prec.highest(
                                        keymap.of([
                                            {
                                                key: "Tab", run: expandAbbreviation
                                            }
                                        ])
                                    )
                                ]}
                                onChange={onChange}
                            />
                        )}
                    />
                </Box>
            ))}
        </Box>
    );
}