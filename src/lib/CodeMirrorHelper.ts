import prettier from "prettier/standalone";
import htmlPlugin from "prettier/plugins/html";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import { EditorView } from "@uiw/react-codemirror";

const PARSER_MAP: Record<string, { parser: string; plugins: any[] }> = {
    html: { parser: "html", plugins: [htmlPlugin] },
    json: { parser: "json", plugins: [babelPlugin, estreePlugin] },
    js: { parser: "babel", plugins: [babelPlugin, estreePlugin] },
    ts: { parser: "babel", plugins: [babelPlugin, estreePlugin] },
};

export async function formatCode(view: EditorView, lang = "json") {
    const code = view.state.doc.toString();
    const key = lang.toLowerCase();
    const { parser, plugins } = PARSER_MAP[key] ?? PARSER_MAP.json;

    try {
        const formatted = await prettier.format(code, {
            parser,
            plugins,
            printWidth: 80,
            tabWidth: 2,
            useTabs: false,
        });

        view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: formatted },
        });
    } catch (err) {
        console.error("Prettier formatting failed:", err);

        // Фолбэк только для JSON
        if (parser === "json") {
            try {
                const parsed = JSON.parse(code);
                const formattedFallback = JSON.stringify(parsed, null, 2);
                view.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: formattedFallback },
                });
            } catch (jsonErr) {
                console.error("JSON fallback failed:", jsonErr);
            }
        }
    }
}
