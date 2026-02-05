import React from "react";
import {domToReact} from "html-react-parser";

// ---------------------------
// STYLE PARSING
// ---------------------------

export function extractNumber(str: string) {
    const match = str.match(/^\{\s*(-?\d+(?:\.\d+)?)\s*\}$/);
    return match ? parseFloat(match[1]) : null;
}

export function parseStyleString(str: string): Record<string, string> | null {
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
}

export function parseStyleValues(styleProps: Record<string, any>) {
    const parsed: Record<string, any> = {};

    for (const key in styleProps) {
        const value = styleProps[key];

        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            const numeric = extractNumber(value);
            if (numeric !== null) {
                parsed[key] = numeric;
            } else {
                const obj = parseStyleString(value);
                if (obj) parsed[key] = obj;
            }
        } else {
            parsed[key] = value;
        }
    }

    return parsed;
}

const allowedHtmlTags = new Set([
    "div", "span", "p", "b", "i", "u", "strong", "em", "br",
    "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "img", "a",
    "code", "pre",
    "blockquote",
    "hr",
    "style"
]);

// ---------------------------
// ESCAPE UNKNOWN TAGS
// ---------------------------

export function escapeUnknownTags(input: string, components: Map<string, any>): string {

    return input.replace(/<([A-Za-z][A-Za-z0-9-]*)\b([^>]*)>/g, (match, tagName, attrs) => {
        const lower = tagName.toLowerCase();

        // 1) Разрешённый HTML-тег → оставить
        if (allowedHtmlTags.has(lower)) return match;

        // 2) Компонент из Map → оставить
        if (components.has(lower)) return match;

        // 3) Всё остальное → экранировать
        return `&lt;${tagName}${attrs}&gt;`;
    });
}


// ---------------------------
// REPLACE OPTIONS FACTORY
// ---------------------------
export function createReplaceOptions(components: Map<string, any>) {

    return {
        replace: (node: any) => {
            if (node.type !== "tag") return;

            const name = node.name.toLowerCase();

            // 1) Кастомный компонент
            if (components.has(name)) {
                const Component = components.get(name)!;
                const props = { ...node.attribs };
                const children = node.children ? domToReact(node.children, createReplaceOptions(components)) : null;

                return (
                    <Component {...props} key={props.id || Math.random()}>
                        {children}
                    </Component>
                );
            }

            // 2) Разрешённый HTML-тег → рендерим как есть
            if (allowedHtmlTags.has(name)) {
                const props = { ...node.attribs };
                const children = node.children ? domToReact(node.children, createReplaceOptions(components)) : null;

                return React.createElement(name, { ...props, key: Math.random() }, children);
            }

            // 3) Неизвестный тег → экранируем
            const openTag = `&lt;${node.name}&gt;`;
            const closeTag = node.children?.length ? `&lt;/${node.name}&gt;` : "";

            return <span key={Math.random()}>{openTag + closeTag}</span>;
        }
    };
}

