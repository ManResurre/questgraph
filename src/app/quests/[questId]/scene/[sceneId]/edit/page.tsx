import React from "react";
import SceneForm from "@/app/components/scene_list/SceneForm";
import {Box} from "@mui/material";
import {Scene} from "@/entity";
import {DatabaseService} from "@/lib/DatabaseService";

export async function generateMetadata({params}: any) {

    const resolvedParams = params instanceof Promise ? await params : params;
    return {
        title: `Quest ${resolvedParams.questId} | Edit Scene`,
    };
}

// export async function generateStaticParams({params}: any) {
//     await DatabaseService.create();
//     const sceneId = await params.sceneId;
//     const scene = await Scene.findOneBy({id: sceneId});
//     return [
//         {scene}
//     ];
// }

export default async function EditScene({params}: { params: Promise<{ sceneId: number }> }) {
    await DatabaseService.getInstance();
    const {sceneId: id} = await params;
    const scene: any = await Scene.findOneBy({id});
    const plain = JSON.parse(JSON.stringify(scene));

    return <Box mt={1}><SceneForm scene={plain}/></Box>
}
