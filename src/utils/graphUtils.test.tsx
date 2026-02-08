import { buildGraphFromScenes } from "./graphUtils";
import { SceneFullData } from "@/lib/SceneRepository";

describe("graphUtils", () => {
  describe("buildGraphFromScenes", () => {
    test("should return empty nodes and edges if no scenes provided", () => {
      const result = buildGraphFromScenes([]);
      expect(result).toEqual({ nodes: [], edges: [] });
    });

    test("should return empty nodes and edges if scenes array is empty", () => {
      const result = buildGraphFromScenes([]);
      expect(result).toEqual({ nodes: [], edges: [] });
    });

    test("should build graph from scenes with choices", () => {
      const mockScenes: SceneFullData[] = [
        {
          id: 1,
          title: "Scene 1",
          text: "This is scene 1",
          choices: [
            {
              id: 1,
              label: null,
              nextSceneId: 2,
              quest_id: null,
              text: "Go to scene 2",
              transition_text: null,
            },
          ],
          // Добавляем обязательные поля из Database["public"]["Tables"]["scene"]["Row"]
          locPosition: null,
          name: null,
          position: null,
          quest_id: 1,
          samplyLink: null,
          // Добавляем другие поля из SceneFullData
          data: {},
          texts: [],
          created_at: "",
        },
        {
          id: 2,
          title: "Scene 2",
          text: "This is scene 2",
          choices: [],
          // Добавляем обязательные поля из Database["public"]["Tables"]["scene"]["Row"]
          locPosition: null,
          name: null,
          position: null,
          quest_id: 1,
          samplyLink: null,
          // Добавляем другие поля из SceneFullData
          data: {},
          texts: [],
          created_at: "",
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
