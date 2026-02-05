import React from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useReactFlow,
    type EdgeProps, useNodes,
} from '@xyflow/react';
import {setNextSceneId} from "@/lib/ChoiceRepository";
import {getSmartEdge, PathFindingFunction} from '@tisoap/react-flow-smart-edge';
import {createAStarFinder} from "@/components/rf/aStar/aStar";

export const pathfindingAStarNoDiagonal: PathFindingFunction = (
    grid,
    start,
    end,
) => {
    try {
        const finder = createAStarFinder({
            diagonalMovement: "Always",
        });
        const fullPath = finder.findPath(start.x, start.y, end.x, end.y, grid);

        if (fullPath.length === 0) {
            throw new Error("No path found");
        }
        return fullPath;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Unknown error: ${String(error)}`);
    }
};


const CustomEdge = (
    {
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        style = {},
        markerEnd,
    }: EdgeProps) => {

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const nodes = useNodes();

    const smartPath = getSmartEdge({
        sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, nodes,
        options: {
            gridRatio: 35,
            nodePadding: 15,
            generatePath: pathfindingAStarNoDiagonal,
        },
    });

    const {setEdges} = useReactFlow();
    const onEdgeClick = () => {
        setEdges((edges) => {
            const foundEdge = edges.find(edge => edge.id == id);
            if (foundEdge && foundEdge.sourceHandle) {
                const choiceId = parseInt(foundEdge.sourceHandle.substring(1));
                setNextSceneId(choiceId)
            }

            return edges.filter((edge) => edge.id !== id)
        });
    };

    const edgeStyle = {
        stroke: '#3b82f6', // Синий цвет по умолчанию
        strokeWidth: 2,
        ...style, // Переопределяется переданным style
    };

    const getPath = () => {
        if (smartPath instanceof Error) {
            return edgePath
        }
        return smartPath.svgPathString;
    }

    return <>
        <BaseEdge path={getPath()}
                  markerEnd={markerEnd}
                  style={edgeStyle}
        />
        <EdgeLabelRenderer>
            <div
                className="nodrag nopan"
                style={
                    {
                        position: "absolute",
                        pointerEvents: 'all',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    }
                }
            >
                {/*<button className="nodrag nopan"*/}
                {/*        onClick={onEdgeClick}>*/}
                {/*    ×*/}
                {/*</button>*/}
            </div>
        </EdgeLabelRenderer>
    </>
}

export default React.memo(CustomEdge);
