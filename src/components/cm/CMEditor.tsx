import React, {useEffect, useRef} from "react";
import {EditorView, highlightActiveLine, lineNumbers} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {json} from "@codemirror/lang-json";
import {oneDark} from "@codemirror/theme-one-dark";
import {EditorSelection} from "@codemirror/state";
import {html} from "@codemirror/lang-html";
import {history, historyKeymap} from "@codemirror/commands";
import {keymap} from "@codemirror/view";
import {abbreviationTracker, expandAbbreviation} from "@emmetio/codemirror6-plugin";
import prettier from "prettier/standalone";
import parserHtml from "prettier/plugins/html";

const formatJson = (text: string) => {
    try {
        return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
        return text;
    }
};

const formatHtml = async (text: string) => {
    try {
        return await prettier.format(text, {parser: "html", plugins: [parserHtml], tabWidth: 2, useTabs: false,});
    } catch {
        return text;
    }
};


const CMEditor = ({value, onChange, lang = "json"}: {
    value?: string;
    onChange: (s: string) => void;
    lang?: string;
}) => {
    const host = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (!host.current) return;
        if (viewRef.current) return;

        const langExt = lang === "json" ? json() : lang === "html" ? html() : [];

        const state = EditorState.create({
            doc: value ?? "",
            extensions: [
                oneDark,
                lineNumbers(),
                langExt,
                EditorView.updateListener.of((u) => {
                    if (u.docChanged) onChange(u.state.doc.toString());
                }),
                EditorView.lineWrapping,
                highlightActiveLine(),
                history(),
                abbreviationTracker(),
                keymap.of([
                    ...historyKeymap,
                    {key: "Tab", run: expandAbbreviation},
                    {
                        key: "Ctrl-Alt-l",
                        run: (view) => {
                            const doc = view.state.doc.toString();

                            if (lang === "json") {
                                const formatted = formatJson(doc);
                                view.dispatch({
                                    changes: {from: 0, to: doc.length, insert: formatted},
                                });
                                return true;
                            }

                            if (lang === "html") {
                                void (async () => {
                                    const formatted = await formatHtml(doc);
                                    view.dispatch({
                                        changes: {from: 0, to: doc.length, insert: formatted},
                                    });
                                })();

                                return true;
                            }

                            return false;
                        },
                    }


                ]),


            ],
        });

        const view = new EditorView({state, parent: host.current});
        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [host]);

    // sync external -> editor
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;
        const cur = view.state.doc.toString();
        const incoming = value ?? "";
        if (incoming !== cur) {
            view.dispatch({
                changes: {from: 0, to: cur.length, insert: incoming},
                selection: EditorSelection.cursor(0),
            });
        }
    }, [value]);

    return <div ref={host}/>;
}

export default CMEditor;