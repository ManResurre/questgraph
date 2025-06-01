
export type ParamType = "regular" | "failed" | "successful" | "fatal";

export interface ParamValue {
    min: number;
    max: number;
    str: string;
}

export interface ParamOptions {
    type: ParamType;
    show: boolean;
    borderMax: boolean;
    startValue: string;
    description: string;
}

export interface Param {
    id?:number;
    key?: string;
    label: string;
    values?: ParamValue[];
    options?: ParamOptions;
}

export interface OptionsFormData extends ParamOptions {
}
