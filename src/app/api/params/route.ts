import {NextResponse} from 'next/server';
import {Param} from "@/entity";
import {plainToInstance} from "class-transformer";

async function GET() {
    try {
        const params = await Param.find();

        return NextResponse.json(params);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {error: 'Internal Server Error'},
            {status: 500}
        );
    }
}

async function POST(request: Request) {
    const body: [] = await request.json();
    if (!Array.isArray(body)) {
        throw new Error("Expected array of parameters in request body");
    }

    try {
        const params = plainToInstance(Param, body);

        const paramRepository = Param.getRepository();
        await paramRepository.manager.transaction(async (entityManager) => {
            const uniqueParams = Array.from(
                new Map(params.map(p => [p.key, p])).values()
            )

            console.log(uniqueParams);

            await entityManager.save(Param, uniqueParams);
        })

        return NextResponse.json(params, {status: 201});
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {error: 'Failed to create/update params'},
            {status: 400}
        );
    }
}

export {GET, POST};
