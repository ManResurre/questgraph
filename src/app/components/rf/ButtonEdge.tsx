import React from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useReactFlow,
    type EdgeProps, useNodes,
} from '@xyflow/react';
import {setNextSceneId} from "@/lib/ChoiceRepository";
import {getSmartEdge} from "@tisoap/react-flow-smart-edge";

export default function CustomEdge(
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
    }: EdgeProps) {

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
        sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, nodes
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

    // @ts-ignore
    const {svgPathString} = smartPath;
    return <>
        <BaseEdge path={svgPathString}
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
                <button className="nodrag nopan"
                        onClick={onEdgeClick}>
                    ×
                </button>
            </div>
        </EdgeLabelRenderer>
    </>
}