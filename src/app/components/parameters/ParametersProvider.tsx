import React, {createContext, useContext, useState} from "react";
import {Database} from "@/supabase";

// Тип строки из таблицы parameters
type Parameter = Database["public"]["Tables"]["parameters"]["Row"];

interface ParametersContextValue {
    editingParameter?: Parameter;
    setEditingParameter: React.Dispatch<React.SetStateAction<Parameter | undefined>>;
}

const ParametersContext = createContext<ParametersContextValue | undefined>(undefined);

export function ParametersProvider({children}: {children: React.ReactNode}) {
    const [editingParameter, setEditingParameter] = useState<Parameter>();

    return (
        <ParametersContext.Provider value={{editingParameter, setEditingParameter}}>
            {children}
        </ParametersContext.Provider>
    );
}

export function useParametersContext() {
    const ctx = useContext(ParametersContext);
    if (!ctx) throw new Error("useParameterContext must be used within ParameterProvider");
    return ctx;
}
