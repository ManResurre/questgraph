import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import {useIsFetching} from "@tanstack/react-query";

interface OpenSidebarProps {
    nodeId?: number;
    edgeId?: number;
    elementData?: any;
    flags?: Partial<Record<"newChoice" | "parameters", boolean>>;
}

interface GraphSidebarContextType {
    isSidebarOpen: boolean;
    selectedNodeId: number | null;
    selectedElementData: any;
    openSidebar: (props: OpenSidebarProps) => void;
    closeSidebar: () => void;
    typeDraggable: string | null;
    setTypeDraggable: (type: string | null) => void;
    selectedChoiceId: number | null;
    flags: Record<string, boolean>;
    setFlag: (key: string, value: boolean) => void;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GraphSidebarContext = createContext<GraphSidebarContextType | undefined>(
    undefined
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

export const GraphSidebarProvider: React.FC<GraphSidebarProviderProps> = (
    {
        children,
    }) => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
    const [selectedElementData, setSelectedElementData] = useState<any>(null);
    const [typeDraggable, setTypeDraggable] = useState<string | null>(null);

    const [flags, setFlags] = useState<Record<string, boolean>>({
        newChoice: false,
        parameters: false,
    });

    const setFlag = (key: string, value: boolean) =>
        setFlags((prev) => ({...prev, [key]: value}));

    const [loading, setLoading] = useState<boolean>(false);
    const fetching = useIsFetching({
        queryKey: ["getChoices", "scenesWithChoices"],
    });

    useEffect(() => {
        setLoading(fetching > 0);
    }, [fetching]);

    const openSidebar = ({
                             nodeId,
                             elementData,
                             edgeId,
                             flags: newFlags,
                         }: OpenSidebarProps) => {
        if (nodeId) setSelectedNodeId(nodeId);
        if (edgeId) setSelectedChoiceId(edgeId);
        if (newFlags) {
            setFlags((prev) => ({...prev, ...newFlags}));
        }
        setSelectedElementData(elementData);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedNodeId(null);
        setSelectedChoiceId(null);
        setSelectedElementData(null);
        setFlags({newChoice: false, parameters: false});
    };

    return (
        <GraphSidebarContext.Provider
            value={{
                isSidebarOpen,
                selectedNodeId,
                selectedElementData,
                openSidebar,
                closeSidebar,
                typeDraggable,
                setTypeDraggable,
                selectedChoiceId,
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
