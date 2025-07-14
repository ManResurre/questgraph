'use client'
import React, {useEffect, useRef, useState} from "react";
import {NextPage} from "next";

import * as Y from 'yjs';
import {QuestList} from "@/app/components/quest_list/QuestList";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";
import {Grid} from "@mui/material";
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";
import {SupabaseDBProvider} from "@/lib/SupabaseDBProvider";
import PeerList from "@/app/components/peer_list/PeerList";

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

    return <Grid container spacing={1} py={1}>
        <Grid size={12}>
            {providerRef.current &&
                <PeerList
                    participants={providerRef.current.participants}
                    peers={providerRef.current.peers}
                    userId={userId}
                />
            }
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
