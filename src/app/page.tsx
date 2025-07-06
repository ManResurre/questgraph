'use client'
import "reflect-metadata";
import {useEffect} from "react";
import supabase from "@/supabaseClient";

export default function Home() {
    useEffect(() => {
        const load = async () => {
            const data = await supabase.from('rooms').select('*');
            console.log(data);
        }
        load();
    }, [])

    return (
        <div>Hello</div>
    );
}
