import React, {createContext, useContext, useState, ReactNode} from 'react';

interface OpenSidebarProps {
    nodeId?: number,
    edgeId?: number,
    elementData?: any
}

interface GraphSidebarContextType {
    isSidebarOpen: boolean;
    selectedNodeId: number | null;
    selectedElementData: any;
    openSidebar: (props:OpenSidebarProps) => void;
    closeSidebar: () => void;
    typeDraggable: string | null;
    setTypeDraggable: (type: string | null) => void;
    selectedChoiceId: number | null;
}

const GraphSidebarContext = createContext<GraphSidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(GraphSidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

interface GraphSidebarProviderProps {
    children: ReactNode;
}

export const GraphSidebarProvider: React.FC<GraphSidebarProviderProps> = ({children}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);

    const [selectedElementData, setSelectedElementData] = useState<any>(null);
    const [typeDraggable, setTypeDraggable] = useState<string | null>(null);

    const openSidebar = ({
                             nodeId,
                             elementData,
                             edgeId
                         }: OpenSidebarProps) => {
        if (nodeId)
            setSelectedNodeId(nodeId);

        if (edgeId)
            setSelectedChoiceId(edgeId)

        setSelectedElementData(elementData);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedNodeId(null);
        setSelectedChoiceId(null);
        setSelectedElementData(null);
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
            }}
        >
            {children}
        </GraphSidebarContext.Provider>
    );
};
