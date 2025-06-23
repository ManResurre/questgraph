import {Dispatch, SetStateAction} from "react";
import {Choice, db, Scene} from "@/lib/db";
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

        await db.transaction('rw', db.scenes, db.choices, async () => {
            let sceneId = scene.id;
            if (sceneId) {
                await db.scenes.put(scene as Scene);
            } else {
                sceneId = await db.scenes.add(scene as Scene);
            }

            const choices = data.choices.map((choice) => ({
                ...choice,
                sceneId
            }));

            const existingIds = choices
                .filter(c => c.id !== undefined)
                .map(c => c.id!);

            await db.choices
                .where('sceneId').equals(sceneId)
                .and(c => !existingIds.includes(c.id!))
                .delete();

            await db.choices.bulkPut(choices as Choice[]);
        })
    }
}
