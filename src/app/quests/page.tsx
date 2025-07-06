'use client'
import React, {useEffect, useMemo, useRef, useState} from "react";
import {NextPage} from "next";

import * as Y from 'yjs';
import {QuestList} from "@/app/components/quest_list/QuestList";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";
import {Box, Button, Grid, List, ListItem, ListItemText, Paper, Typography} from "@mui/material";
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";
import supabase from "@/supabaseClient";
import {getYWebRTCProvider} from "@/lib/signaling";
import {WebrtcProvider} from "y-webrtc";
import SupabaseProvider, {SupabaseProviderConfig} from "@/lib/y-supabase";
import {WebrtcProviderRework} from "@/lib/WebrtcProviderRework";
import {REALTIME_LISTEN_TYPES} from "@supabase/realtime-js";
import {CustomProvider, MyWebRTCProvider} from "@/lib/CustomProvider";


// const testroom = supabase.channel('testroom');
// testroom.on(
//     REALTIME_LISTEN_TYPES.BROADCAST,
//     {event: 'shout'}, // Listen for "shout". Can be "*" to listen to all events
//     (payload: any) => console.log(payload)
// )
//     .subscribe()

// setInterval(() => {
// testroom.send({
//     type: REALTIME_LISTEN_TYPES.BROADCAST,
//     event: 'connect',
//     payload: {message: 'hello, world'},
// })
// }, 10000)
// const doc = new Y.Doc();
// const provider = new WebrtcProviderRework('testroom', doc, {
//     signaling: ['ws://localhost:4444'],
// });
// provider.on('synced', synced => {
//     console.log('synced!', synced);
// });
//


import {Doc} from 'yjs'
import {SupabaseDBProvider} from "@/lib/SupabaseDBProvider";
import {theme} from "@/theme";

// Генерируем уникальный ID пользователя
const userId = crypto.randomUUID();
const roomId = '0a13648f-1a69-44de-8017-981dfcb00f07'//'document-123'

const QuestsPage: NextPage = () => {
    const yDoc = useRef(new Y.Doc()).current;
    const providerRef = useRef<SupabaseDBProvider | null>(null);

    const quests = useLiveQuery(() => db.quests.toArray());

    const [update, setUpdate] = useState('init')

    useEffect(() => {
        const yText = yDoc.getText('sharedText');
        yText.insert(0, "test text");
        const updateState = async () => {
            console.log(yText.toString());
        };
        yText.observe(updateState);

        const loadData = async () => {
            providerRef.current = await SupabaseDBProvider.create(yDoc, roomId, String(userId), setUpdate);
        }

        loadData();

        return () => {
            yDoc.destroy();
            if (providerRef.current) {
                providerRef.current.destroy();
                providerRef.current = null;
            }
        };
    }, [yDoc]);
    console.log(providerRef.current?.peers);
    console.log(providerRef.current?.peers.get(userId));
    return <Grid container spacing={1} py={1}>
        <Grid size={12}>
            <Paper>
                <Box p={1}>
                    <Typography component="h1">UserId: {userId}</Typography>
                    <List disablePadding>
                        {providerRef.current?.participants.map((item: any) =>
                            <ListItem key={item.id}>
                                <ListItemText
                                    slotProps={{
                                        primary: {
                                            sx: {color: item.user_id == userId ? 'red' : theme.palette.text.primary}
                                        },
                                    }}
                                >{item.user_id}</ListItemText>
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Paper>
        </Grid>

        <Grid size={6}>
            <QuestList quests={quests}/>
        </Grid>
        <Grid size={6}>
            <QuestEditForm/>
        </Grid>
    </Grid>
}

export default QuestsPage;
