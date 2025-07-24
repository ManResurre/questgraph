import {Dispatch, SetStateAction} from "react";
import {Choice, ChoiceText, db, Scene, SceneChoice, SceneText} from "@/lib/db";
import {ISceneFormData} from "@/app/components/scene_list/SceneForm";

export interface IChoice {
    id?: number;
    label: string;
    text: string;
}

export interface IScene {
    id?: number;
    name: string;
    text: string;
    choices: IChoice[]
}

export class SceneService {
    update: Dispatch<SetStateAction<string>> | undefined;
    editing: Scene | undefined;

    selectedSceneId: number;

    edit(scene: Scene) {
        this.editing = scene;
        if (this.update)
            this.update(`edit_scene_${scene.id!}`);
    }

    async create(data: ISceneFormData) {
        const scene = {
            ...data,
        } as Partial<typeof data>;
        delete scene.choices;

        await db.transaction('rw', db.scenes, db.choices, db.scene_texts, async () => {
            let sceneId = scene.id;
            if (sceneId) {
                await db.scenes.put(scene as Scene);
            } else {
                sceneId = await db.scenes.add(scene as Scene);
            }

            // const choices = data.choices.map((choice) => ({
            //     ...choice,
            //     questId: scene.questId
            // }));
            //
            // const existingChoicesIds = choices
            //     .filter(c => c.id !== undefined)
            //     .map(c => c.id!);
            //
            // await db.choices
            //     .where('sceneId').equals(sceneId)
            //     .and(c => !existingChoicesIds.includes(c.id!))
            //     .delete();
            //
            // await db.choices.bulkPut(choices as Choice[]);

            const texts = data.texts.map((text) => ({
                ...text,
                sceneId
            }));

            const existingTextsIds = texts
                .filter(c => c.id !== undefined)
                .map(c => c.id!);

            await db.scene_texts
                .where('sceneId').equals(sceneId)
                .and(c => !existingTextsIds.includes(c.id!))
                .delete();

            await db.scene_texts.bulkPut(texts as SceneText[]);
        })
    }

    parseLocations(text: string) {
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

    parsePaths(text: any) {
        const result = new Map();
        const lines = text.split(/\r?\n/);
        let currentKey = null;
        let currentLines = [];
        let inStarredSection = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Проверка на начало новой локации
            const pathMatch = trimmedLine.match(/^(Path\d+[\w-]*)(?:\s+|$)/);

            if (pathMatch) {
                // Сохраняем предыдущую локацию
                if (currentKey && currentLines.length > 0) {
                    result.set(currentKey, currentLines)
                }

                // Начинаем новую локацию
                currentKey = pathMatch[1];
                currentLines = [];
                inStarredSection = false;

                // Извлекаем основной текст после идентификатора
                const mainText = trimmedLine.slice(pathMatch[0].length).trim();
                if (mainText) {
                    currentLines.push(mainText);
                }
            }
            // Обработка строк со звёздочкой
            else if (trimmedLine.startsWith('*')) {
                inStarredSection = true;
                const content = trimmedLine.slice(1).trim();
                if (content) {
                    currentLines.push(content);
                }
            }
            // Обработка пустых строк внутри звездочного блока
            else if (inStarredSection && trimmedLine === '') {
                continue; // Пропускаем пустые строки внутри блока
            }
            // Обработка продолжения текста
            else if (currentKey && trimmedLine) {
                if (currentLines.length === 0) {
                    currentLines.push(trimmedLine);
                } else {
                    // Объединяем с последней строкой
                    currentLines[currentLines.length - 1] += "\n" + trimmedLine;
                }
            }
        }

        // Сохраняем последнюю локацию
        if (currentKey && currentLines.length > 0) {
            result.set(currentKey, currentLines)
        }

        return result;
    }

    async createFromFile(fileContent: string, questId: number) {
        const locations = this.parseLocations(fileContent);
        const paths = this.parsePaths(fileContent);

        await db.transaction('rw',
            db.scenes,
            db.choices,
            db.scene_texts,
            db.choice_texts,
            async () => {

                for (const loc of locations.keys()) {
                    const sceneId = await db.scenes.put({name: loc, questId} as Scene);

                    const texts = locations.get(loc).map((text: string) => {
                        return {
                            text,
                            sceneId
                        }
                    })
                    await db.scene_texts.bulkPut(texts as SceneText[]);
                }

                for (const path of paths.keys()) {
                    const choiceId = await db.choices.put({label: path, questId} as Choice);

                    const texts = paths.get(path).map((text: string) => {
                        return {
                            text,
                            choiceId
                        }
                    })
                    await db.choice_texts.bulkPut(texts as ChoiceText[]);
                }
            })
    }

    setSelectedScene(id: number) {
        this.selectedSceneId = id;
    }

    async addChoice(choice: Choice) {
        const sceneChoice: SceneChoice = {choiceId: choice.id!, sceneId: this.selectedSceneId};
        await db.scene_choice.put(sceneChoice);
    }
}
