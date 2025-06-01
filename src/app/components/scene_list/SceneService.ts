import {CRUDService} from "@/app/components/CRUDService";
import {Dispatch, SetStateAction} from "react";
import {Scene} from "@/entity";

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

export class SceneService extends CRUDService {
    protected override apiUrl: string = '/api/scenes';

    scenes: IScene[] = [];
    update: Dispatch<SetStateAction<string>> | undefined;
    edited: IScene | undefined;

    loading: boolean = false;

    public static getInstance(setUpdate?: Dispatch<SetStateAction<string>>): SceneService {
        const instance = CRUDService.init(SceneService) as SceneService;
        instance.update = instance.update ?? setUpdate;
        return CRUDService.init(SceneService) as SceneService;
    }

    override async load<T = IScene>(): Promise<T> {
        this.scenes = await super.load();
        if (this.update)
            this.update('load');
        return this.scenes as T;
    }

    setEdit(quest: IScene | undefined) {
        this.edited = quest;
        if (this.update)
            this.update(quest?.name || '');
    }

    override async create<T = Scene>(body: T): Promise<T> {
        const data = await super.create(body);

        console.log(data);

        // if (this.edited) {
        //     const found = this.scenes.find(el => el.id === this.edited!.id)
        //     if (found) {
        //         Object.assign(found, data);
        //         this.edited = undefined
        //     }
        // } else {
        //     this.scenes.push(data)
        // }

        // if (this.update)
        //     this.update('create');
        return data;
    }

    override async getById(id: number): Promise<unknown> {
        return super.getById(id);
    }

    getSceneById(id: number) {
        return this.scenes.find(quest => quest.id === id);
    }
}
