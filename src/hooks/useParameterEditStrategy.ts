import {ParameterInsert, ParameterSceneInsert} from "@/lib/ParametersRepository";
import {useParameters} from "@/components/parameters/ParametersProvider.tsx";
import {useParametersSceneMutations} from "@/hooks/parameters.ts";
import {useSidebar} from "@/components/sidebar/graphSidebarProvider.tsx";

interface IEditStrategy {
    handleSubmit: (data: ParameterInsert | ParameterSceneInsert) => Promise<void>;
}

export function useParameterEditStrategy() {
    const {selectedElementData: {scene}, setLoading} = useSidebar();
    const {
        editingParameterScene,
        upsertParameter,
        setEditingParameter
    } = useParameters();

    const {upsertSceneParameter} = useParametersSceneMutations();

    const strategy = new Map<string, IEditStrategy>([
        ["parameter", {
            handleSubmit: async (data) => {
                setLoading(true)
                await upsertParameter(data);
                setEditingParameter(null);
                setLoading(false)
            }
        }],
        ["parameterScene", {
            handleSubmit: async (data) => {
                if (!data.id || !scene.id) {
                    return;
                }

                setLoading(true)
                await upsertSceneParameter({
                    id: editingParameterScene?.id ?? undefined,
                    param_id: data.id,
                    scene_id: scene.id,
                    value: JSON.stringify(data)
                })
                setEditingParameter(null);
                setLoading(false)
            }
        }]
    ]);

    let handleSubmit = async (data: ParameterInsert) => {
    }
    if (scene) {
        handleSubmit = strategy.get('parameterScene')?.handleSubmit ?? handleSubmit
    } else {
        handleSubmit = strategy.get('parameter')?.handleSubmit ?? handleSubmit
    }

    return {
        handleSubmit
    };
}
