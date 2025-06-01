import {CRUDService} from "@/app/components/CRUDService";
import {Dispatch, SetStateAction} from "react";

export interface IQuest {
    id?: number;
    name: string;
}

export class QuestService extends CRUDService {
    protected override apiUrl: string = '/api/quests';

    quests: IQuest[] = [];
    update: Dispatch<SetStateAction<string>> | undefined;
    edited: IQuest | undefined;

    loading: boolean = false;

    public static getInstance(setUpdate: Dispatch<SetStateAction<string>>): QuestService {
        const instance = CRUDService.init(QuestService) as QuestService;
        instance.update = setUpdate;
        return CRUDService.init(QuestService) as QuestService;
    }

    override async load<T = IQuest>(): Promise<T> {
        this.loading = true;
        this.quests = await super.load();
        this.loading = false;
        if (this.update)
            this.update('load');
        return this.quests as T;
    }

    setEdit(quest: IQuest | undefined) {
        this.edited = quest;
        if (this.update)
            this.update(quest?.name || '');
    }

    override async create<T = IQuest>(body: T): Promise<T> {
        const data = await super.create(body) as IQuest;

        if (this.edited) {
            const found = this.quests.find(el => el.id === this.edited!.id)
            if (found) {
                Object.assign(found, data);
                this.edited = undefined
            }
        } else {
            this.quests.push(data)
        }

        if (this.update)
            this.update('create');
        return this.edited as T;
    }

    getQuestById(id: number) {
        return this.quests.find(quest => quest.id === id);
    }
}
