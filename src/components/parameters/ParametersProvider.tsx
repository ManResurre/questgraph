import React, {createContext, useContext, useMemo, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
    deleteParameter,
    Parameter,
    ParameterInsert, ParameterScene, ParameterSceneInsert,
    upsertParameter,
    upsertSceneParameter
} from "@/lib/ParametersRepository";
import {useParametersQuery} from "@/hooks/parameters";
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
    upsertSceneParameter: (param: ParameterScene | ParameterSceneInsert) => Promise<void>;
    refetchParameter: () => void;
}

const ParametersContext = createContext<ParametersContextValue | undefined>(undefined);

export function useParametersMutations() {
    const queryClient = useQueryClient();
    const upsertPM = useMutation({
        mutationFn: upsertParameter,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['parameters']})
        },
    })

    const deletePM = useMutation({
        mutationFn: deleteParameter,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['parameters']})
        },
    })

    const upsertSP = useMutation({
        mutationFn: upsertSceneParameter,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['parameter_scene']})
        },
    })

    return useMemo(() => ({
        upsertP: upsertPM,
        deleteP: deletePM,
        upsertSP: upsertSP
    }), [])
}

export function ParametersProvider({children}: { children: React.ReactNode }) {
    const {id: questId} = useParams({from: questIdRoute.id});
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [editingParameterScene, setEditingParameterScene] = useState<ParameterScene | null>(null);

    const {upsertP, deleteP, upsertSP} = useParametersMutations();
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
        upsertSceneParameter: upsertSP.mutateAsync,
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
