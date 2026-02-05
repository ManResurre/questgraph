import "../../globals.css";
import Registration from "@/components/auth/registration.tsx";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db.ts";

export default function Home() {
    const user = useLiveQuery(() => db.user.orderBy("id").first());

    return <>
        <div>Hello</div>

        {user ? null : <Registration/>}
    </>
}
