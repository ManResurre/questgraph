import {Dispatch, SetStateAction} from "react";
import {Param, ParamOptions, ParamValue} from "./IParamsView";

export class ParamsService extends Map<string, Param> {
    static #instance: ParamsService;
    #selectedParam: Param | undefined;
    #selectedKey: string | undefined;
    update: Dispatch<SetStateAction<string>> | undefined;

    constructor() {
        if (ParamsService.#instance) {
            return ParamsService.#instance;
        }
        super();
        ParamsService.#instance = this;
    }

    public static async create(update: Dispatch<SetStateAction<string>>): Promise<ParamsService> {
        if (!ParamsService.#instance) {
            ParamsService.#instance = new ParamsService();
            ParamsService.#instance.setUpdate(update);
            await ParamsService.#instance.load();
        }
        return ParamsService.#instance;
    }

    async sync(params: Param[]) {
        const response = await fetch(`/api/params`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(params)
        });

        const data: Param[] = await response.json();
        this.fromObjects(data);
        if (this.update) {
            this.update('update');
        }

        if (!response.ok) {
            throw new Error('API create failed');
        }
    }

    setUpdate(update: Dispatch<SetStateAction<string>>) {
        this.update = update;
    }

    loadDataFromStorage() {
        const raw = localStorage.getItem('params');
        if (!raw)
            return;
        this.fromObjects(JSON.parse(raw));
    }

    async load() {
        const response = await fetch(`/api/params`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Authorization: `Bearer ${localStorage.getItem('token')}`
            },
        });

        const data: Param[] = await response.json();
        this.fromObjects(data);
        if (this.update) {
            this.update('update');
        }

        if (!response.ok) {
            throw new Error('API load failed');
        }
    }

    async saveDataToStorage() {
        const data = this.toObjects();
        if (!data.length)
            return;

        await this.saveObjects(data);
    }

    async saveObjects(data: Param[]) {
        // localStorage.setItem('params', JSON.stringify(data));
        await this.sync(data);
    }

    set(key: string, value: Param): this {
        super.set(key, value);
        return this;
    }

    selectParam(paramKey: string) {
        if (!this.has(paramKey))
            return;
        this.#selectedParam = this.get(paramKey);
        this.#selectedKey = paramKey;
        if (this.update)
            this.update(`select ${paramKey}`);
    }

    getSelected() {
        return this.#selectedParam;
    }

    getSelectedKey() {
        return this.#selectedKey;
    }

    fromObjects(params: Param[]) {
        if (!params) {
            throw new Error("Params is undefined")
        }

        console.log(params);

        params.forEach((param) => {
            const {key, ...other} = param;
            this.set(key!, other)
        })
    }

    toObjects() {
        const values = [...this.values()];
        const keys = [...this.keys()];
        return values.reduce((prev: Param[], curr: Param, index: number) => {
            return [
                ...prev,
                {
                    ...curr,
                    key: keys[index]
                }
            ]
        }, []).sort(function(a, b) {
            return a.id! - b.id!;
        });
    }

    async setOptions(options: ParamOptions) {
        if (!this.#selectedParam)
            return;
        this.#selectedParam.options = options;
        await this.saveDataToStorage();
    }

    async setValues(values: ParamValue[]) {
        if (!this.#selectedParam)
            return;
        this.#selectedParam.values = values;
        await this.saveDataToStorage();
    }
}
