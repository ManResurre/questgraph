import React, { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import supabase from "@/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Login from "./auth/login";

export default function Navbar() {
    const pathname = useRouterState({
        select: (s) => s.location.pathname,
    });

    const [user, setUser] = useState<SupabaseUser | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUser(user);
        };

        checkUser();

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.subscription.unsubscribe();
    }, []);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Quest Editor
                </Typography>

                <Button
                    component={Link}
                    to="/"
                    variant={pathname === "/" ? "contained" : "text"}
                    color="inherit"
                >
                    Home
                </Button>

                {user && (
                    <Button
                        component={Link}
                        to="/quests"
                        variant={pathname === "/quests" ? "contained" : "text"}
                        color="inherit"
                    >
                        Quests
                    </Button>
                )}

                <Button
                    component={Link}
                    to="/about"
                    variant={pathname === "/about" ? "contained" : "text"}
                    color="inherit"
                >
                    About
                </Button>

                <Login user={user} />
            </Toolbar>
        </AppBar>
    );
}
