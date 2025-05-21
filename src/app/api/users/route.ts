import {NextResponse} from 'next/server';
import {DatabaseService} from '@/lib/database';
import {User} from "@/entity";

async function GET() {
    await DatabaseService.create();
    try {
        const users = await User.find();

        return NextResponse.json(users);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {error: 'Internal Server Error'},
            {status: 500}
        );
    }
}

async function POST(request: Request) {
    try {
        // const connection = await getDatabaseConnection();
        // const userRepository = connection.getRepository(User);
        // const body = await request.json();

        // const newUser = userRepository.create(body);
        // await userRepository.save(newUser);

        const res = {};

        return NextResponse.json(res, {status: 201});
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {error: 'Failed to create user'},
            {status: 400}
        );
    }
}

// Для Next.js App Router нужно экспортировать методы явно
export {GET, POST};
