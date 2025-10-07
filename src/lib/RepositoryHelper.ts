export function parseLocations(text: string) {
    const result = new Map();
    const blocks = text.split(/(?=Loc\d+-\d+\s)/);

    for (const block of blocks) {
        if (!block.trim()) continue;

        const [header, ...lines] = block.trim().split('\n');
        const locMatch = header.match(/^(Loc\d+-\d+)\s/);
        if (!locMatch) continue;

        const locKey = locMatch[1];
        const mainText = header.substring(locMatch[0].length).trim();
        const descriptionLines = [mainText];

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('*')) {
                const content = trimmedLine.substring(1).trim();
                if (content) descriptionLines.push(content);
            }
        }

        result.set(locKey, descriptionLines);
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
