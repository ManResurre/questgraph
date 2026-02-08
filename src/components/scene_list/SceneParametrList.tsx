import React, { useMemo, useRef, useState, useTransition } from "react";
import { Box, CircularProgress, Paper, TextField } from "@mui/material";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Database } from "@/supabase";
import SceneParameterItem from "@/components/scene_list/SceneParameterItem";
import { useSidebar } from "@/components/sidebar/graphSidebarProvider";
import { useParametersSceneQuery } from "@/hooks/parameters";

type ParameterScene = Database["public"]["Tables"]["parameter_scene"]["Row"];

const SceneParameterList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isPending, startTransition] = useTransition();

  const {
    selectedElementData: { scene },
  } = useSidebar();

  const { data: parametersScene } = useParametersSceneQuery(Number(scene.id));

  const filteredParameters = useMemo(() => {
    if (!parametersScene) return [];
    if (!searchTerm) return parametersScene;
    const term = searchTerm.toLowerCase();
    return parametersScene.filter(
      (p: ParameterScene) =>
        (p.value ?? "").toLowerCase().includes(term) ||
        String(p.param_id ?? "")
          .toLowerCase()
          .includes(term),
    );
  }, [parametersScene, searchTerm]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    startTransition(() => {
      if (!parametersScene || !parametersScene.length) return;
      const index = parametersScene.findIndex(
        (p: ParameterScene) =>
          (p.value ?? "").toLowerCase().includes(term.toLowerCase()) ||
          String(p.param_id ?? "")
            .toLowerCase()
            .includes(term.toLowerCase()),
      );
      if (index !== -1 && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({
          index,
          align: "start",
          behavior: "smooth",
        });
      }
    });
  };

  return (
    <div>
      <TextField
        label="Search scene parameters"
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Paper>
        <Box height="35vh">
          {isPending && <CircularProgress size={20} />}
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "100%", scrollbarWidth: "none" }}
            className="hide-scrollbar"
            data={filteredParameters}
            itemContent={(index: number, parameter: ParameterScene) => (
              <SceneParameterItem parameterScene={parameter} />
            )}
          />
        </Box>
      </Paper>
    </div>
  );
};

export default React.memo(SceneParameterList);
