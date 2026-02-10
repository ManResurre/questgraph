import { buildGraphFromScenes } from "./graphUtils";
import { SceneNodeType } from "@/pages/quests/id/constants/graph";
import { SceneFullData } from "@/lib/SceneRepository";

describe("graphUtils", () => {
  describe("buildGraphFromScenes", () => {
    test("should return empty nodes and edges if no scenes provided", () => {
      const result = buildGraphFromScenes([]);
      expect(result).toEqual({ nodes: [], edges: [] });
    });

    test("should build graph from scenes with choices", () => {
      const mockScenes: SceneNodeType[] = [
        {
          id: "1",
          type: "sceneNode",
          dragHandle: ".drag-handle",
          width: 300,
          position: { x: 0, y: 0 },
          data: {
            id: 1,
            name: "Scene 1",
            text: "This is scene 1",
            choices: [
              {
                id: 1,
                label: "Choice 1",
                nextSceneId: 2,
                quest_id: 1,
                text: "Go to scene 2",
                transition_text: null,
              },
            ],
            locPosition: null,
            position: null,
            quest_id: 1,
            samplyLink: null,
            created_at: "",
            texts: [],
          },
        },
        {
          id: "2",
          type: "sceneNode",
          dragHandle: ".drag-handle",
          width: 300,
          position: { x: 0, y: 0 },
          data: {
            id: 2,
            name: "Scene 2",
            text: "This is scene 2",
            choices: [],
            locPosition: null,
            position: null,
            quest_id: 1,
            samplyLink: null,
            created_at: "",
            texts: [],
          },
        },
      ];

      const result = buildGraphFromScenes(mockScenes);

      expect(result.nodes.length).toBe(2);
      expect(result.edges.length).toBe(1);

      expect(result.edges[0]).toEqual({
        id: "edge_1_c1_ns2",
        source: "1",
        sourceHandle: "c1_s2",
        target: "2",
        targetHandle: "s2",
        type: "buttonEdge",
      });
    });
  });
});