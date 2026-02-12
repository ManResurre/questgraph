import {
    ConnectionLineType,
    Edge,
    Node,
    NodeTypes,
} from "@xyflow/react";
import {SceneFullData, SceneFullDataWithRecord} from "@/lib/SceneRepository";
import {SmartBezierEdge} from "@tisoap/react-flow-smart-edge";
import SceneNode from "@/components/rf/SceneNode";
import SearchNode from "@/components/rf/SearchNode";
import ButtonEdge from "@/components/rf/ButtonEdge";

export type SceneNodeType = Node<SceneFullDataWithRecord> & {
    type: string;
    dragHandle?: string;
    width: number;
};

export type CustomEdgeType = Edge & {
    sourceHandle?: string;
    targetHandle?: string;
};

// Константы
export const NODE_TYPES: NodeTypes = {
    sceneNode: SceneNode,
    searchNode: SearchNode,
};

export const EDGE_TYPES = {
    buttonEdge: ButtonEdge,
    smart: SmartBezierEdge,
};

export const CONNECTION_LINE_TYPE = ConnectionLineType.SmoothStep;
export const CONTAINER_STYLE = {width: "100vw", height: "calc(100vh - 64px)"};
