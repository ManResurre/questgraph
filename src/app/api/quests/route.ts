import {NextResponse} from 'next/server';
import {plainToInstance} from "class-transformer";
import {Quest} from "@/entity";

async function GET() {
    try {
        const quests = await Quest.find();

        return NextResponse.json(quests);
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
        const quest = plainToInstance(Quest, body);

        const questRepository = Quest.getRepository();
        await questRepository.manager.transaction(async (entityManager) => {
            await entityManager.save(Quest, quest);
        })

        return NextResponse.json(quest, {status: 201});
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {error: 'Failed to create/update quests'},
            {status: 400}
        );
    }
}

export {GET, POST};
