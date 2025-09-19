import React from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useReactFlow,
    type EdgeProps,
} from '@xyflow/react';

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

    const {setEdges} = useReactFlow();
    const onEdgeClick = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return <>
        <BaseEdge path={edgePath}
                  markerEnd={markerEnd}
                  style={style}
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