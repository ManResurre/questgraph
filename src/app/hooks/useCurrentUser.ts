import {useEffect, useState} from "react";
import supabase from "@/supabaseClient";
import {User} from "@supabase/supabase-js";

export const useCurrentUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const {data: {user}, error} = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error.message);
            }
            setUser(user);
            setLoading(false);
        };

        fetchUser();

        // Подписка на изменения состояния аутентификации
        const {data: subscription} = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription?.subscription.unsubscribe();
        };
    }, []);

    return {user, loading};
};
