import parse, {domToReact} from "html-react-parser";
import DOMPurify from "dompurify";
import Img from "./components/Img";
import {Box, Card, List, ListItem, Paper} from "@mui/material";
import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {createRoot} from "react-dom/client";
import createCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";
import {ThemeProvider} from "@mui/material/styles";
import {playerTheme, theme} from "@/theme";
import CssBaseline from "@mui/material/CssBaseline";

export interface TextProps {
    text: string;
}

const DOMPurifyOptions = {
    USE_PROFILES: {html: true},
    ALLOWED_TAGS: ['div', 'FromPlanet', 'Ranger'],
    ALLOWED_ATTR: ['style', 'content', 'data-*'],
    ADD_ATTR: ['data-entity'],
    ADD_TAGS: ['FromPlanet', 'Ranger'],
    CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: /^[a-zA-Z-]+/,
        attributeNameCheck: /^[a-z-:]+$/i,
        allowCustomizedBuiltInElements: true
    },
    ALLOW_UNKNOWN_PROTOCOLS: true,
    KEEP_CONTENT: true,
    FORBID_CONTENTS: [],
};

function extractNumber(str: string) {
    const match = str.match(/^\{\s*(-?\d+(?:\.\d+)?)\s*\}$/);
    return match ? parseFloat(match[1]) : null;
}

interface StyleProps {
    [key: string]: string | number | Object;
}

const parseStyleString = (str: string): Record<string, string> | null => {
    if (!str.startsWith('{') || !str.endsWith('}')) return null;

    try {
        return str
            .slice(1, -1)
            .split(',')
            .map(prop => prop.split(':').map(s => s.trim()))
            .filter(([key, value]) => key && value)
            .reduce((acc, [key, value]) => {
                const camelKey = key.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
                const cleanValue = value.replace(/^['"`]|['"`]$/g, '');
                acc[camelKey] = cleanValue;
                return acc;
            }, {} as Record<string, string>);
    } catch {
        return null;
    }
};

function parseStyleValues(styleProps: StyleProps): StyleProps {
    const parsedStyles: StyleProps = {};

    for (const key in styleProps) {
        const value = styleProps[key];

        // Если значение - строка в фигурных скобках, парсим число
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            const numericValue = extractNumber(value);

            if (numericValue) {
                parsedStyles[key] = numericValue
            } else {
                const obj = parseStyleString(value);
                if (obj)
                    parsedStyles[key] = obj;
            }


        } else {
            // Иначе оставляем как есть
            parsedStyles[key] = value;
        }
    }

    return parsedStyles;
}


function PlayerText({text}: TextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);
    const rootRef = useRef<any>(null);

    const clearText = useCallback((text: string) => {
        const customTags = ['FromPlanet', 'Ranger'];
        const regex = new RegExp(
            `<(${customTags.join('|')})(\\s+[^>]*)?>(?![^<]*<\\/\\1>)`,
            'gi'
        );

        const preprocessedContent = text.replace(regex, '<$1$2></$1>');

        return preprocessedContent;

        // return DOMPurify.sanitize(preprocessedContent, DOMPurifyOptions);
    }, [text]);

    const Span = () => (<span>ranges</span>);
    const replaceOptions = useMemo(() => {
        const components = new Map<string, string | React.ComponentType>([
            ['img', Img],
            ['ul', List],
            // ['ranger', Span],
            ['paper', Paper],
            ['box', Box],
            ['card', Card],
            ['li', ListItem],

            // ['li', ListItem],
        ]);

        return {
            replace: (node: any) => {
                if (node.type === 'tag' && components.has(node.name)) {
                    const Component = components.get(node.name)!;
                    const props = {...node.attribs};

                    const p = parseStyleValues(props);
                    // console.log(p);
                    // console.log(test);
                    // const children = node.children ? node.children?.map((child: any) => {
                    //         console.log('child', child);
                    //         return domToReact(child, replaceOptions)
                    //     }
                    // ) : null;
                    //
                    // console.log(node.children);

                    const children = node.children ? domToReact(node.children, replaceOptions) : null;

                    return React.createElement(Component, {...p, key: props.id || Math.random()}, children);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (containerRef.current && text) {
            // Если Shadow DOM и корень еще не созданы, создаем их
            if (!shadowRootRef.current) {
                const shadowRoot = containerRef.current.attachShadow({mode: 'open'});
                shadowRootRef.current = shadowRoot;

                const reactContainer = document.createElement('div');
                shadowRoot.appendChild(reactContainer);

                rootRef.current = createRoot(reactContainer);

                // Инжектируем Tailwind CSS в Shadow DOM
                // const styleLink = document.createElement('link');
                // styleLink.rel = 'stylesheet';
                // styleLink.href = 'https://cdn.tailwindcss.com'; // или путь к вашему Tailwind
                // shadowRoot.appendChild(styleLink);
            }

            // Рендерим контент
            const cleanedHtml = clearText(text ?? '');
            const parsedContent = parse(cleanedHtml, replaceOptions);

            // const sheet = cssom(new CSSStyleSheet());
            // const tw = twind(config, sheet);

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

        return () => {
            if (rootRef.current) {
                // rootRef.current.unmount();
                // rootRef.current = null;
                // containerRef.current = null;
                // shadowRootRef.current = null;
            }
        };
    }, [text]);

    return <div ref={containerRef}/>;
}

export default React.memo(PlayerText);
