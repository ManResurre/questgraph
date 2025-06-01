import {Box} from "@mui/material";
import SceneForm from "@/app/components/scene_list/SceneForm";

export async function generateMetadata({params}: any) {
    const resolvedParams = params instanceof Promise ? await params : params;
    return {
        title: `Quest ${resolvedParams.questId} | Create Scene`,
    };
}

export default async function NewScenePage() {
    return <Box mt={1}><SceneForm/></Box>
}
