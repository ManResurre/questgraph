import {ConnectionLineType, Edge, Node, NodeProps, NodeTypes} from "@xyflow/react";
import {SceneFullData} from "@/lib/SceneRepository";
import SceneNode from "@/app/components/rf/SceneNode";
import {ComponentType} from "react";
import SearchNode from "@/app/components/rf/SearchNode";
import ButtonEdge from "@/app/components/rf/ButtonEdge";
import {SmartBezierEdge} from "@tisoap/react-flow-smart-edge";

export type SceneNodeType = Node<SceneFullData>;
export type CustomEdgeType = Edge & { sourceHandle?: string; targetHandle?: string };

// Константы
export const NODE_TYPES: NodeTypes = {
    sceneNode: SceneNode as ComponentType<NodeProps & {
        data: SceneFullData;
        type: string;
    }>,
    searchNode: SearchNode
};

export const EDGE_TYPES = {
    buttonEdge: ButtonEdge,
    smart: SmartBezierEdge,
};

export const CONNECTION_LINE_TYPE = ConnectionLineType.SmoothStep;
export const CONTAINER_STYLE = {width: '100vw', height: 'calc(100vh - 64px)'};
