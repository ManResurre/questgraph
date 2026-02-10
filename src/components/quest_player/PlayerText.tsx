import parse from "html-react-parser";
import Img from "./components/Img";
import {Box, Card, List, ListItem, Paper} from "@mui/material";
import React, {useEffect, useMemo, useRef} from "react";
import {createRoot} from "react-dom/client";
import createCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";
import {ThemeProvider} from "@mui/material/styles";
import {playerTheme} from "@/theme";
import CssBaseline from "@mui/material/CssBaseline";
import {createReplaceOptions, escapeUnknownTags, extractNumber, parseStyleString} from "@/utils/playerTextHelper";

export interface TextProps {
    text: string;
}

interface StyleProps {
    [key: string]: string | number | Object;
}


function parseStyleValues(styleProps: StyleProps): StyleProps {
    const parsedStyles: StyleProps = {};

    for (const key in styleProps) {
        const value = styleProps[key];

        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            const numericValue = extractNumber(value);

            if (numericValue !== null) {
                parsedStyles[key] = numericValue;
            } else {
                const obj = parseStyleString(value);
                if (obj) parsedStyles[key] = obj;
            }
        } else {
            parsedStyles[key] = value;
        }
    }

    return parsedStyles;
}

function PlayerText({text}: TextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);
    const rootRef = useRef<any>(null);

    const components = useMemo(() => new Map<string, any>([
        ['img', Img],
        ['ul', List],
        ['paper', Paper],
        ['box', Box],
        ['card', Card],
        ['li', ListItem],
    ]), []);

    const replaceOptions = useMemo(() => createReplaceOptions(components), [components]);

    useEffect(() => {
        if (containerRef.current && text) {
            if (!shadowRootRef.current) {
                const shadowRoot = containerRef.current.attachShadow({mode: 'open'});
                shadowRootRef.current = shadowRoot;

                const reactContainer = document.createElement('div');
                shadowRoot.appendChild(reactContainer);

                rootRef.current = createRoot(reactContainer);
            }

            const cleanedHtml = escapeUnknownTags(text, components);
            const parsedContent = parse(cleanedHtml, replaceOptions);

            const cache = createCache({
                key: 'css',
                container: shadowRootRef.current,
                prepend: true,
            });

            rootRef.current.render(
                <CacheProvider value={cache}>
                    <ThemeProvider theme={playerTheme}>
                        <CssBaseline/>
                        <Box>
                            {parsedContent}
                        </Box>
                    </ThemeProvider>
                </CacheProvider>
            );
        }
    }, [text, replaceOptions]);

    return <div ref={containerRef}/>;
}

export default React.memo(PlayerText);
