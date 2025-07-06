'use client'
import React, {useEffect, useMemo, useRef, useState} from "react";
import {NextPage} from "next";

import * as Y from 'yjs';
import {QuestList} from "@/app/components/quest_list/QuestList";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";
import {Box, Button, Grid, List, ListItem, ListItemText, Paper, Typography} from "@mui/material";
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";
import {SupabaseDBProvider} from "@/lib/SupabaseDBProvider";
import {theme} from "@/theme";

// Генерируем уникальный ID пользователя
const userId = crypto.randomUUID();
const roomId = '96e1d418-9e13-472f-9006-67df2069d6aa'//'document-123'

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

    const isConnected = (userId: string) => {
        const peer = providerRef.current?.peers.get(userId);
        return peer?.connected;
    }

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
                                            sx: {color: item.user_id == userId ? 'red' : (isConnected(item.user_id)) ? 'green' : theme.palette.text.primary}
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
