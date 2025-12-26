import {DragEvent, DragEventHandler, useCallback} from "react";
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Connection,
    FinalConnectionState,
    NodeChange,
    useReactFlow
} from "@xyflow/react";
import {setNextSceneId} from "@/lib/ChoiceRepository";
import {createScene} from "@/lib/SceneRepository";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import {CustomEdgeType, SceneNodeType} from "@/app/quests/[questId]/constants/graph";
import {useQueryClient} from "@tanstack/react-query";

export const useQuestGraph = (
    questId: number,
    nodes: SceneNodeType[],
    setNodes: React.Dispatch<React.SetStateAction<SceneNodeType[]>>,
    setEdges: React.Dispatch<React.SetStateAction<CustomEdgeType[]>>,
    typeDraggable: string | null,
) => {

    const queryClient = useQueryClient();
    const {screenToFlowPosition} = useReactFlow();
    const {openSidebar} = useSidebar();

    /** Обновление узлов */
    const onNodesChange = useCallback(
        (changes: NodeChange<SceneNodeType>[]) => {
            setNodes(nodes => applyNodeChanges(changes, nodes));
        },
        [setNodes]
    );

    /** Обновление рёбер */
    const onEdgesChange = useCallback(
        (changes: any) => setEdges(edges => applyEdgeChanges(changes, edges)),
        [setEdges]
    );

    /** Соединение узлов */
    const onConnect = useCallback(
        (connection: Connection) => {
            if (connection.sourceHandle && connection.targetHandle) {
                const choiceId = parseInt(connection.sourceHandle.substring(1));
                const sceneId = parseInt(connection.targetHandle.substring(1));

                if (choiceId && sceneId) {
                    setNextSceneId(choiceId, sceneId);
                }
            }
            setEdges(edges => addEdge({...connection, type: "buttonEdge"}, edges));
        },
        [setEdges]
    );

    /** Получение координат события (мышь/тач) */
    const getEventCoordinates = useCallback((event: MouseEvent | TouchEvent) => {
        const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent =>
            "touches" in e;

        if (isTouchEvent(event) && event.touches.length > 0) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            };
        } else {
            const mouseEvent = event as MouseEvent;
            return {
                clientX: mouseEvent.clientX,
                clientY: mouseEvent.clientY
            };
        }
    }, []);

    /** Завершение соединения (создание searchNode) */
    const onConnectEnd = useCallback(
        (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
            if (connectionState.isValid) return;

            const {clientX, clientY} = getEventCoordinates(event);
            const pos = screenToFlowPosition({x: clientX, y: clientY});
            const id = `search-node-${Date.now()}`;

            const searchNode: SceneNodeType = {
                id,
                type: "searchNode",
                position: {x: pos.x, y: pos.y},
                data: {connectionState}
            };

            setNodes(nodes => nodes.concat(searchNode));
            setEdges(eds =>
                eds.concat({
                    id,
                    source: connectionState.fromNode?.id!,
                    target: id
                } as CustomEdgeType)
            );
        },
        [screenToFlowPosition, setNodes, setEdges, getEventCoordinates]
    );

    /** Drop нового узла */
    const onDrop = useCallback(
        async (event: React.DragEvent) => {
            event.preventDefault();
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY
            });

            if (typeDraggable === "sceneNode") {
                await createScene({
                    name: "Change name",
                    quest_id: Number(questId),
                    position: JSON.stringify(position),
                    locPosition: true
                });
                queryClient.invalidateQueries({ queryKey: ["scenesWithChoices"] });
            }
            if (typeDraggable === "default") {
                alert("WIP");
            }
        },
        [screenToFlowPosition, typeDraggable, questId]
    );

    /** Drag start */
    const onDragStart = useCallback((event: DragEvent, nodeType: string) => {
        event.dataTransfer.setData("text/plain", nodeType);
        event.dataTransfer.effectAllowed = "move";
        // console.log(event);
    }, []) as any;

    /** Drag over */
    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        // console.log(event);
    }, []);

    /** Клик по ребру */
    const handleEdgeClick = useCallback(
        (event: React.MouseEvent<Element, MouseEvent>, edge: CustomEdgeType) => {
            event.preventDefault();
            if (!edge.sourceHandle) return;

            const choiceId = parseInt(edge.sourceHandle.substring(1));
            openSidebar({
                edgeId: choiceId,
                elementData: {type: "edge", edge}
            });
        },
        [openSidebar]
    );

    return {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onConnectEnd,
        onDrop,
        onDragStart,
        onDragOver,
        handleEdgeClick
    };
};
