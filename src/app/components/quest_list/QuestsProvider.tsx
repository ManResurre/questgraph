import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState} from "react";
import {QuestService} from "@/app/components/quest_list/QuestService";

interface QuestsProviderProps {
    children: ReactNode;
}

interface QuestsContextType {
    service: QuestService | undefined;
    update: string | undefined;
    setUpdate: Dispatch<SetStateAction<string>>;
}

const ParamsContext = createContext<QuestsContextType>({
    service: undefined,
    update: undefined,
    setUpdate: (() => {
    }) as Dispatch<SetStateAction<string>>,
});

function QuestsProvider(props: QuestsProviderProps) {
    const [update, setUpdate] = useState("");
    const [service, setService] = useState<QuestService | undefined>();

    useEffect(() => {
        const qs = new QuestService(setUpdate);
        setService(qs);
    }, []);

    const contextValue = useMemo((): QuestsContextType => ({
        service,
        update,
        setUpdate
    }), [service, update]);

    return <ParamsContext.Provider value={contextValue}>
        {props.children}
    </ParamsContext.Provider>
}

export const useQuestContext = () => {
    return useContext(ParamsContext)
}

export default QuestsProvider;
