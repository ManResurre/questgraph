'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {AppBar, Button, Toolbar, Typography} from "@mui/material";
import supabase from "@/supabaseClient";
import Login from "./auth/login";

const Navbar = () => {
    const pathname = usePathname();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                // console.error("Ошибка получения пользователя:", error.message);
            } else {
                setUser(user);
            }
        };

        checkUser();

        // подписка на изменения сессии
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.subscription.unsubscribe();
        };
    }, []);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    Quest Editor
                </Typography>

                <Button
                    href="/"
                    variant={pathname === "/" ? "contained" : "text"}
                    component={Link}
                    color="inherit"
                >
                    Home
                </Button>

                {user && (
                    <Button
                        href="/quests"
                        variant={pathname === "/quests" ? "contained" : "text"}
                        component={Link}
                        color="inherit"
                    >
                        Quests
                    </Button>
                )}

                <Button
                    href="/about"
                    variant={pathname === "/about" ? "contained" : "text"}
                    component={Link}
                    color="inherit"
                >
                    About
                </Button>

                <Login user={user}/>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
