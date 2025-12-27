import {useEffect, useState} from "react";
import supabase from "@/supabaseClient";
import {User, Session} from "@supabase/supabase-js";

export const useCurrentUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            setLoading(true);
            const {data, error} = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching session:", error.message);
            }
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        };

        fetchSession();

        // Подписка на изменения состояния аутентификации
        const {data: subscription} = supabase.auth.onAuthStateChange(
            (_, session) => {
                setSession(session);
                setUser(session?.user ?? null);
            }
        );

        return () => {
            subscription?.subscription.unsubscribe();
        };
    }, []);

    return {user, session, loading};
};
