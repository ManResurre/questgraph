import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    SetStateAction,
    Dispatch,
    useEffect,
    useCallback
} from 'react';
import {useLiveQuery} from "dexie-react-hooks";
import {getScenesWithChoices, SceneFullData} from "@/lib/SceneRepository";
import {useParams} from "next/navigation";
import {useReactFlow} from "@xyflow/react";

interface PlayerContextType {
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
    scenes?: SceneFullData[];
    currentScene?: SceneFullData;
    setCurrentScene: Dispatch<SetStateAction<SceneFullData | undefined>>;
    setScene: (sceneId: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};

interface PlayerProviderProps {
    children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({children}) => {
    const {fitView} = useReactFlow();
    const {questId} = useParams();
    const [openModal, setOpenModal] = React.useState(false);
    const scenes = useLiveQuery(async () => getScenesWithChoices(Number(questId)), [questId]);
    const [currentScene, setCurrentScene] = useState<SceneFullData>();

    useEffect(() => {
        if (!scenes?.length)
            return;
        setCurrentScene(scenes[0].data)
        // if (setViewport)
        //     setViewport({...scenes[0].position, zoom: 0.7}, {duration: 800})

    }, [scenes])

    const setScene = useCallback((sceneId: number) => {
        const foundScene = scenes?.find((scene) => scene.data.id === sceneId)
        if (foundScene) {
            setCurrentScene(foundScene.data)
            fitView({
                nodes: [{id: foundScene.id!.toString()}],
                duration: 800,
                padding: 0.5,
                interpolate: 'smooth',
                maxZoom: 0.7 // если хотите ограничить zoom
            });
        }
    }, [scenes])

    return (
        <PlayerContext.Provider
            value={{
                openModal,
                setOpenModal,
                scenes: scenes && scenes.map((scene) => scene.data),
                currentScene,
                setCurrentScene,
                setScene
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};
