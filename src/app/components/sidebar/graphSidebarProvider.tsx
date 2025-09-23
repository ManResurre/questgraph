import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GraphSidebarContextType {
    isSidebarOpen: boolean;
    selectedNodeId: number | null;
    selectedElementData: any;
    openSidebar: (nodeId: number, elementData?: any) => void;
    closeSidebar: () => void;
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

export const GraphSidebarProvider: React.FC<GraphSidebarProviderProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [selectedElementData, setSelectedElementData] = useState<any>(null);

    const openSidebar = (nodeId: number, elementData?: any) => {
        setSelectedNodeId(nodeId);
        setSelectedElementData(elementData);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedNodeId(null);
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
            }}
        >
            {children}
        </GraphSidebarContext.Provider>
    );
};