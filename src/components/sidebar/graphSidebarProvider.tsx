import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useIsFetching } from "@tanstack/react-query";
import {
  CustomEdgeType,
  SceneNodeType,
} from "@/pages/quests/id/constants/graph";
import { SceneFullData } from "@/lib/SceneRepository";

interface OpenSidebarProps {
  elementData?: any;
  flags?: Partial<
    Record<
      | "newChoice"
      | "parameters"
      | "editSceneParams"
      | "editScene"
      | "editChoice",
      boolean
    >
  >;
}

interface GraphSidebarContextType {
  isSidebarOpen: boolean;
  selectedElementData: any;
  openSidebar: (props: OpenSidebarProps) => void;
  closeSidebar: () => void;
  typeDraggable: string | null;
  setTypeDraggable: (type: string | null) => void;
  flags: Record<string, boolean>;
  setFlag: (key: string, value: boolean) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GraphSidebarContext = createContext<GraphSidebarContextType | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(GraphSidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface GraphSidebarProviderProps {
  children: ReactNode;
}

type SelectedElementData = null | Partial<{
  scene: SceneFullData;
  edge: CustomEdgeType;
  data: SceneFullData;
}>;

export const GraphSidebarProvider: React.FC<GraphSidebarProviderProps> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedElementData, setSelectedElementData] =
    useState<SelectedElementData>(null);
  const [typeDraggable, setTypeDraggable] = useState<string | null>(null);

  const [flags, setFlags] = useState<Record<string, boolean>>({
    newChoice: false,
    parameters: false,
    editSceneParams: false,
    editScene: false,
  });

  const setFlag = (key: string, value: boolean) =>
    setFlags((prev) => ({ ...prev, [key]: value }));

  const [loading, setLoading] = useState<boolean>(false);
  const fetching = useIsFetching({
    queryKey: ["getChoices", "scenesWithChoices"],
  });

  useEffect(() => {
    setLoading(fetching > 0);
  }, [fetching]);

  const openSidebar = ({ elementData, flags: newFlags }: OpenSidebarProps) => {
    if (newFlags) {
      setFlags((prev) => ({ ...prev, ...newFlags }));
    }
    setSelectedElementData(elementData);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedElementData(null);
    setFlags({
      newChoice: false,
      parameters: false,
      editSceneParams: false,
      editScene: false,
    });
  };

  return (
    <GraphSidebarContext.Provider
      value={{
        isSidebarOpen,
        selectedElementData,
        openSidebar,
        closeSidebar,
        typeDraggable,
        setTypeDraggable,
        flags,
        setFlag,
        loading,
        setLoading,
      }}
    >
      {children}
    </GraphSidebarContext.Provider>
  );
};
