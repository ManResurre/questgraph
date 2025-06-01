import {NextResponse} from 'next/server';
import {User} from "@/entity";

async function GET() {
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
