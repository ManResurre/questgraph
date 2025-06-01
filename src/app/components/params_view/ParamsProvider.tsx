import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState} from "react";
import {ParamsService} from "./ParamsService";

interface ParamsProviderProps {
    children: ReactNode;
}

interface ParamsContextType {
    params: ParamsService | undefined;
    update: string | undefined;
    setUpdate: Dispatch<SetStateAction<string>>;
}

const ParamsContext = createContext<ParamsContextType>({
    params: undefined,
    update: undefined,
    setUpdate: (() => {
    }) as Dispatch<SetStateAction<string>>,
});

function ParamsProvider(props: ParamsProviderProps) {
    const [update, setUpdate] = useState("");
    const [params, setParams] = useState<ParamsService | undefined>();

    useEffect(() => {
        const initializeService = async () => {
            const service = await ParamsService.create(setUpdate);
            setParams(service);
        };

        initializeService();
    }, []);

    const contextValue = useMemo((): ParamsContextType => ({
        params,
        update,
        setUpdate
    }), [params, update]);

    return <ParamsContext.Provider value={contextValue}>
        {props.children}
    </ParamsContext.Provider>
}

export const useParams = () => {
    return useContext(ParamsContext)
}

export default ParamsProvider;
