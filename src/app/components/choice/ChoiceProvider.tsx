import React, {createContext, useContext, useState} from "react";
import {Database} from "@/supabase";

type Choice = Database["public"]["Tables"]["choice"]["Row"];

interface ChoiceContextValue {
    editingChoice?: Choice;
    setEditingChoice: React.Dispatch<React.SetStateAction<Choice | undefined>>;
}

const ChoiceContext = createContext<ChoiceContextValue | undefined>(undefined);

export const ChoiceProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [editingChoice, setEditingChoice] = useState<Choice>();

    return (
        <ChoiceContext.Provider value={{editingChoice, setEditingChoice}}>
            {children}
        </ChoiceContext.Provider>
    );
};

export const useChoiceContext = () => {
    const ctx = useContext(ChoiceContext);
    if (!ctx) throw new Error("useChoiceContext must be used within ChoiceProvider");
    return ctx;
};
