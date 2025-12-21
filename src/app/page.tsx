'use client'
import "reflect-metadata";
import Registration from "@/app/components/auth/registration";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";

export default function Home() {
    const user = useLiveQuery(() => db.user.orderBy("id").first());

    return <>
        <div>Hello</div>

        {user ? null : <Registration/>}
    </>
}
