// export function parseLocations(text: string) {
//     const result = new Map();
//     const blocks = text.split(/(?=Loc\d+-\d+\s)/);
//
//     for (const block of blocks) {
//         if (!block.trim()) continue;
//
//         const [header, ...lines] = block.trim().split('\n');
//         const locMatch = header.match(/^(Loc\d+-\d+)\s/);
//         if (!locMatch) continue;
//
//         const locKey = locMatch[1];
//         const mainText = header.substring(locMatch[0].length).trim();
//         const descriptionLines = [mainText];
//
//         for (const line of lines) {
//             const trimmedLine = line.trim();
//             if (trimmedLine.startsWith('*')) {
//                 const content = trimmedLine.substring(1).trim();
//                 if (content) descriptionLines.push(content);
//             }
//         }
//
//         result.set(locKey, descriptionLines);
//     }
//
//     return result;
// }
export function parseLocations(text: string) {
    const result = new Map();
    const blocks = text.split(/(?=Loc\d+-\d+\s)/);

    for (const block of blocks) {
        if (!block.trim()) continue;

        const [header, ...lines] = block.trim().split("\n");
        const locMatch = header.match(/^(Loc\d+)-\d+\s/); // теперь берём только LocXX
        if (!locMatch) continue;

        const locKey = locMatch[1]; // например "Loc15"
        const mainText = header.substring(locMatch[0].length).trim();

        // собираем весь текст блока (основной + строки со звёздочками)
        const descriptionParts = [mainText];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("*")) {
                descriptionParts.push(trimmedLine); // сохраняем со звёздочкой
            }
        }

        const fullText = descriptionParts.join("\n");

        const arr: string[] = result.get(locKey) ?? [];
        arr.push(fullText);
        result.set(locKey, arr);
    }

    return result;
}

export function parsePaths(text: string) {
    const lines = text.split('\n');
    const map = new Map();
    let currentKey = null;
    let currentText = '';

    for (const line of lines) {
        if (line.startsWith('Path')) {
            // Сохраняем предыдущий путь при обнаружении нового
            if (currentKey !== null) {
                map.set(currentKey, currentText);
            }
            const tabIndex = line.indexOf('\t');
            currentKey = line.substring(0, tabIndex);
            currentText = line.substring(tabIndex + 1);
        } else if (line.startsWith('*')) {
            if (currentKey === null) continue; // Пропуск, если нет активного пути
            const tabIndex = line.indexOf('\t');
            if (tabIndex !== -1) {
                const textPart = line.substring(tabIndex + 1);
                currentText += (currentText ? '\n' : '') + textPart;
            }
        }
    }
    // Сохранение последнего обработанного пути
    if (currentKey !== null) {
        map.set(currentKey, currentText);
    }
    return map;
}

export function cleanUndefined<T extends Record<string, any>>(obj: T): T {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
    ) as T;
}

export type DiffValue<T> =
    | { old: T; new: T }
    | DiffObject<T>;

export type DiffObject<T> = {
    [K in keyof T]?: DiffValue<T[K]>;
};

export function diff<T extends object>(a: T, b: Partial<T>): DiffObject<T> {
    const result: DiffObject<T> = {};

    const keys = new Set<keyof T>([
        ...Object.keys(a),
        ...Object.keys(b),
    ] as (keyof T)[]);

    for (const key of keys) {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal === bVal) continue;

        const bothObjects =
            typeof aVal === "object" &&
            typeof bVal === "object" &&
            aVal !== null &&
            bVal !== null;

        if (bothObjects) {
            const nested = diff(aVal as any, bVal as any);
            if (Object.keys(nested).length > 0) {
                result[key] = nested as DiffValue<T[typeof key]>;
            }
        } else {
            result[key] = bVal as T[typeof key];
        }
    }

    return result;
}
