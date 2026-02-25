import React, {createContext, useContext, useMemo, useState} from "react";
import {
    Parameter,
    ParameterInsert, ParameterScene, ParameterSceneInsert,
} from "@/lib/ParametersRepository";
import {useParametersMutations, useParametersQuery} from "@/hooks/parameters";
import {useParams} from "@tanstack/react-router";
import {questIdRoute} from "@/routes/quests";

interface ParametersContextValue {
    parameters: Parameter[],
    editingParameter: Parameter | null;
    editingParameterScene: ParameterScene | null;
    setEditingParameter: React.Dispatch<React.SetStateAction<Parameter | null>>;
    setEditingParameterScene: React.Dispatch<React.SetStateAction<ParameterScene | null>>;
    isLoading: boolean;
    upsertParameter: (param: Parameter | ParameterInsert) => Promise<void>;
    deleteParameter: (id: number) => Promise<null>;
    refetchParameter: () => void;
}

const ParametersContext = createContext<ParametersContextValue | undefined>(undefined);

export function ParametersProvider({children}: { children: React.ReactNode }) {
    const {id: questId} = useParams({from: questIdRoute.id});
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [editingParameterScene, setEditingParameterScene] = useState<ParameterScene | null>(null);

    const {upsertP, deleteP} = useParametersMutations();
    const {
        data: parameters = [],
        isLoading,
        refetch
    } = useParametersQuery(Number(questId));


    const value = {
        parameters,
        isLoading,
        editingParameter,
        setEditingParameter,
        editingParameterScene,
        setEditingParameterScene,
        upsertParameter: upsertP.mutateAsync,
        deleteParameter: deleteP.mutateAsync,
        refetchParameter: refetch,
    }

    return (
        <ParametersContext.Provider value={value}>
            {children}
        </ParametersContext.Provider>
    );
}

export function useParameters() {
    const ctx = useContext(ParametersContext);
    if (!ctx) throw new Error("useParameterContext must be used within ParameterProvider");
    return ctx;
}
