import React, { useEffect, useMemo } from "react";
import { ReactFlow, Background, Controls, useReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useSidebar } from "@/components/sidebar/graphSidebarProvider";
import { Grid } from "@mui/material";
import GraphSidebar from "@/components/sidebar/GraphSidebar";
import PlayerModal from "@/components/quest_player/PlayerModal";
import GraphMenuSidebar from "@/components/sidebar/GraphMenuSidebar";

import { useParams } from "@tanstack/react-router";
import { PlayerProvider } from "@/components/sidebar/PlayerProvider";
import { useQuestGraph } from "@/hooks/graph";
import { useScenesWithChoices } from "@/hooks/scene";
import { buildGraphFromScenes } from "@/utils/graphUtils";
import {
  CONNECTION_LINE_TYPE,
  CONTAINER_STYLE,
  CustomEdgeType,
  EDGE_TYPES,
  NODE_TYPES,
} from "@/pages/quests/id/constants/graph";
import { SceneNodeType } from "@/components/rf/SceneNode";
import { questIdRoute } from "@/routes/quests";

const QuestPage = () => {
  const { id: questId } = useParams({ from: questIdRoute.id });

  const { typeDraggable } = useSidebar();

  const { data: scenes } = useScenesWithChoices(Number(questId));

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraphFromScenes(scenes ?? []),
    [scenes],
  );

  const { setNodes, setEdges } = useReactFlow<SceneNodeType, CustomEdgeType>();
  const {
    onNodesChange,
    onEdgesChange,
    onConnect,
    onConnectEnd,
    onDrop,
    onDragStart,
    onDragOver,
    handleEdgeClick,
  } = useQuestGraph(Number(questId), setNodes, setEdges, typeDraggable);

  useEffect(() => {
    if (initialNodes.length) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <PlayerProvider>
      <Grid container spacing={1}>
        <div style={CONTAINER_STYLE}>
          <ReactFlow
            defaultNodes={initialNodes}
            defaultEdges={initialEdges}
            selectNodesOnDrag={true}
            elevateNodesOnSelect={true}
            nodesDraggable={true}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectEnd={onConnectEnd}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onEdgeClick={handleEdgeClick}
            connectionLineType={CONNECTION_LINE_TYPE}
            colorMode="dark"
            edgeTypes={EDGE_TYPES}
            nodeTypes={NODE_TYPES}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
          </ReactFlow>
          <GraphSidebar />
          <GraphMenuSidebar />
          {/*<PlayerModal/>*/}
        </div>
      </Grid>
    </PlayerProvider>
  );
};

export default React.memo(QuestPage);
