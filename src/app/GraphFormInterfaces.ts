import {Param} from "./IParamsView";
import {Choice, Scene} from "@/app/GraphInterfaces";

export interface ChoiceFormProps {
    index?: number,
    prefix?: string;
}

export interface ParamRaw {
    key: string;
    label: string;
}

export interface PramsFormData {
    params: Param[];
}

export interface ParamsFormProps {
    params: Map<string, Param>;
    onParams?: (value: Map<string, Param>) => void
}

export interface SceneFormProps {
    scene?: Scene;
}

export interface SceneFormData extends Scene{
    name: string;
    text: string;
    choices: Choice[]
}

export type PramItem = Param & ParamRaw;

