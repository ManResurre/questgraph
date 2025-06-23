import {NextResponse} from 'next/server';
import {plainToInstance} from "class-transformer";
import {Scene} from "@/entity";

async function GET() {
    try {
        // const scenes = await Scene.find();
        const scenes: any = [];
        return NextResponse.json(scenes);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {error: 'Internal Server Error'},
            {status: 500}
        );
    }
}

async function POST(request: Request) {
    const body = await request.json();

    try {
        // const scene = plainToInstance(Scene, body);
        //
        // const SceneRepository = Scene.getRepository();
        // await SceneRepository.manager.transaction(async (entityManager) => {
        //     await entityManager.save(Scene, scene);
        // })
        const scene = {};

        return NextResponse.json(scene, {status: 201});
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {error: 'Failed to create/update quests'},
            {status: 400}
        );
    }
}

export {GET, POST};
