'use client';
import {useEffect} from "react";
import ParamsForm from "@/app/components/params_view/ParamsForm";

// import supabase from "@/supabaseClient";

export function MyFirst() {
    useEffect(() => {

        const fetchSmoothies = async () => {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            console.log(data);
        }

        fetchSmoothies();

    }, []);

    return <div>
        <h1>QuestGraph Test</h1>
        <ParamsForm/>
    </div>
}
