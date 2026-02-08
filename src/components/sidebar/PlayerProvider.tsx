import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
  useEffect,
  useCallback,
} from "react";
import { SceneFullData } from "@/lib/SceneRepository";
import { useReactFlow } from "@xyflow/react";
import { questIdRoute } from "@/routes/quests";
import { useParams } from "@tanstack/react-router";
import { useScenesWithChoices } from "@/hooks/scene";

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
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const { id: questId } = useParams({ from: questIdRoute.id });
  const { fitView } = useReactFlow();
  const [openModal, setOpenModal] = React.useState(false);
  const { data: scenes } = useScenesWithChoices(Number(questId));
  const [currentScene, setCurrentScene] = useState<SceneFullData>();

  useEffect(() => {
    if (!scenes?.length) return;

    const selectedNodeId = localStorage.getItem("selectedNode");
    const selectedScene = scenes.find((scene) => scene.id == selectedNodeId);

    setCurrentScene(selectedScene ? selectedScene.data : scenes[0].data);
    // if (setViewport)
    //     setViewport({...scenes[0].position, zoom: 0.7}, {duration: 800})
  }, [scenes]);

  const setScene = useCallback(
    (sceneId: number) => {
      const foundScene = scenes?.find((scene) => scene.data.id === sceneId);
      if (foundScene) {
        setCurrentScene(foundScene.data);
        fitView({
          nodes: [{ id: foundScene.id }],
          duration: 800,
          padding: 0.5,
          interpolate: "smooth",
          maxZoom: 0.7, // если хотите ограничить zoom
        });
      }
    },
    [scenes],
  );

  return (
    <PlayerContext.Provider
      value={{
        openModal,
        setOpenModal,
        scenes: scenes && scenes.map((scene) => scene.data),
        currentScene,
        setCurrentScene,
        setScene,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
