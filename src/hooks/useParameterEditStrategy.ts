import {ParameterInsert} from "@/lib/ParametersRepository";
import {useParameters} from "@/components/parameters/ParametersProvider.tsx";
import {useParametersSceneMutations} from "@/hooks/parameters.ts";
import {useSidebar} from "@/components/sidebar/graphSidebarProvider.tsx";
import {useMemo} from "react";

export type EditMode = 'parameter' | 'parameterScene';

interface IEditStrategy {
    handleSubmit: (data: ParameterInsert) => Promise<void>;
}

export function useParameterEditStrategy() {
    const {selectedElementData: {scene}} = useSidebar();
    const {
        editingParameterScene,
        upsertParameter,
        setEditingParameter
    } = useParameters();

    const {upsertSceneParameter} = useParametersSceneMutations();

    const strategy = useMemo(() => new Map<EditMode, IEditStrategy>([
        ["parameter", {
            handleSubmit: upsertParameter
        }],
        ["parameterScene", {
            handleSubmit: async (data) => {
                if (!data.id || !scene?.id) {
                    return;
                }

                await upsertSceneParameter({
                    id: editingParameterScene?.id ?? undefined,
                    param_id: data.id,
                    scene_id: scene.id,
                    value: JSON.stringify(data)
                })
            }
        }]
    ]), [scene, editingParameterScene]);

    const mode: EditMode = scene ? 'parameterScene' : 'parameter';

    const handleSubmit = async (data: ParameterInsert) => {
        if (!strategy.has(mode)) return;
        await strategy.get(mode)?.handleSubmit(data)
        setEditingParameter(null);
    }

    return {
        handleSubmit
    };
}
