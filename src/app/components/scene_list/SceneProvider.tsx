import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState} from "react";
import {SceneService} from "@/app/components/scene_list/SceneService";

interface SceneProviderProps {
    children: ReactNode;
}

interface SceneContextType {
    service: SceneService | undefined;
    update: string | undefined;
    setUpdate: Dispatch<SetStateAction<string>>;
}

const ParamsContext = createContext<SceneContextType>({
    service: undefined,
    update: undefined,
    setUpdate: (() => {
    }) as Dispatch<SetStateAction<string>>,
});

function SceneProvider(props: SceneProviderProps) {
    const [update, setUpdate] = useState("");
    const [service, setService] = useState<SceneService | undefined>();

    useEffect(() => {
        const initializeService = async () => {
            const service = SceneService.getInstance(setUpdate);
            // await service.load();
            setService(service);
        };

        initializeService();
    }, []);

    const contextValue = useMemo((): SceneContextType => ({
        service,
        update,
        setUpdate
    }), [service, update]);

    return <ParamsContext.Provider value={contextValue}>
        {props.children}
    </ParamsContext.Provider>
}

export const useSceneContext = () => {
    return useContext(ParamsContext)
}

export default SceneProvider;
