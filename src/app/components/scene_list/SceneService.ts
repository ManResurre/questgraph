import {Dispatch, SetStateAction} from "react";
import {Choice, db, Scene, SceneChoice, SceneText} from "@/lib/db";
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

    parsePaths(text: string) {
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

    async createFromFile(fileContent: string, questId: number) {
        const locations = this.parseLocations(fileContent);
        const paths = this.parsePaths(fileContent);

        await db.transaction('rw',
            db.scenes,
            db.choices,
            db.scene_texts,
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
                const pathsForDb: Choice[] = [];
                for (const path of paths.keys()) {
                    pathsForDb.push({label: path, text: paths.get(path), questId});
                }
                await db.choices.bulkPut(pathsForDb);
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
