'use client'
import React, {useEffect, useRef, useState} from "react";
import {NextPage} from "next";

import * as Y from 'yjs';
import {QuestList} from "@/app/components/quest_list/QuestList";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";
import {Grid, TextField} from "@mui/material";
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";
import {SupabaseDBProvider} from "@/lib/SupabaseDBProvider";
import PeerList from "@/app/components/peer_list/PeerList";
import FileLoader from "@/app/components/file_loader/FileLoader";

// Генерируем уникальный ID пользователя
const userId = crypto.randomUUID();
const roomId = '96e1d418-9e13-472f-9006-67df2069d6aa'//'document-123'

const QuestsPage: NextPage = () => {
    const [text, setText] = useState('test');
    const yDoc = useRef(new Y.Doc()).current;
    const providerRef = useRef<SupabaseDBProvider | null>(null);

    const quests = useLiveQuery(() => db.quests.toArray());

    const [, setUpdate] = useState('init')

    useEffect(() => {
        const yText = yDoc.getText('sharedText');
        const updateState = async () => {
            setText(yText.toString())
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

    const handleChangeText = (e: any) => {
        const yText = yDoc.getText('sharedText');

        yDoc.transact(() => {
            yText.delete(0, yText.length);
            yText.insert(0, e.target.value);
        });
    }


    return <Grid container spacing={1} py={1}>
        <Grid size={12}>
            {providerRef.current &&
                <PeerList
                    participants={providerRef.current.participants}
                    peers={providerRef.current.peers}
                    messages={providerRef.current.peersMessages}
                    userId={userId}
                    update={providerRef.current.update}
                />
            }
        </Grid>

        <Grid size={6}>
            <QuestList quests={quests}/>
        </Grid>
        <Grid size={6}>
            <QuestEditForm/>
        </Grid>
        <TextField
            label="Messages"
            multiline
            fullWidth
            value={text}
            onChange={handleChangeText}
            rows={4}
            placeholder="Введите ваш текст..."
            sx={{mb: 3}}
        />
    </Grid>
}

export default QuestsPage;
