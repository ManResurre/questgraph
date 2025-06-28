'use client'
import React, {useEffect, useMemo, useRef} from "react";
import {NextPage} from "next";

import * as Y from 'yjs';
import {QuestList} from "@/app/components/quest_list/QuestList";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";
import {Button, Grid} from "@mui/material";
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
import {SimplePeerProvider} from "@/lib/SupabaseWebRTCProvider";

// Генерируем уникальный ID пользователя
const userId = Date.now() //crypto.randomUUID()
const roomId = 'document-123'
const ydoc = new Doc()

// Инициализация провайдера
const provider = new SimplePeerProvider(ydoc, roomId, String(userId))
setInterval(() => {
    // provider.test("Hello")
}, 10000)

// Подключаемся к другим участникам
// provider.connectToPeers()

// Слушаем обновления документа
// ydoc.on('update', (update, origin) => {
//     if (origin !== provider) {
//         provider.sendUpdate(update)
//     }
// })
//
// // Пример работы с данными
// const ytext = ydoc.getText('content')
// ytext.insert(0, 'Привет мир!')
//

const QuestsPage: NextPage = () => {
    const yDoc = useRef(new Y.Doc()).current;
    const providerRef = useRef<MyWebRTCProvider | null>(null);

    const quests = useLiveQuery(() => db.quests.toArray());

    useEffect(() => {

        // Создаем провайдер только один раз
        if (!providerRef.current) {

            // providerRef.current = new MyWebRTCProvider(yDoc, {});
            // const config: any = {
            //     channel: 'testroom',
            //     id: 'f6a16ff7-4a31-11eb-be7b-8344edc8f36b',
            //     tableName: "yjs_signals",
            //     columnName: "signal_data"
            // }
            // const provider = new SupabaseProvider(yDoc, supabase, config);
            // const provider = getYWebRTCProvider('testroom', yDoc);
            // providerRef.current = provider;
            //
            // const allChanges = supabase
            //     .channel('testroom')
            //     .on(
            //         'postgres_changes',
            //         {
            //             event: '*',
            //             schema: 'public',
            //         },
            //         (payload) => console.log(payload)
            //     )
            //     .subscribe()
            // providerRef.current = new WebrtcProviderRework('testroom', yDoc, {
            //     signaling: ['ws://localhost:4444'],
            // });

            // providerRef.current.on('synced', synced => {
            //     console.log('synced!', synced);
            // });


        }

        const yText = yDoc.getText('sharedText');
        yText.insert(0, "test text");
        const updateState = async () => {
            console.log(yText.toString());
        };
        yText.observe(updateState);

        // const load = async () => {
        //     // const ydoc = new Y.Doc()
        //     // const provider = initYWebRTC("test-room", ydoc)
        //
        //     const {data} = await supabase
        //         .from('quest')
        //         .select('*')
        //         .overrideTypes<Array<{ id: string }>>()
        //
        //     console.log(data);
        //     return data;
        // }
        // load();
        return () => {
            // yText.unobserve(updateState);
            // yArray.unobserve(syncToDexie);
            yDoc.destroy();
            if (providerRef.current) {
                providerRef.current.destroy();
                providerRef.current = null;
            }
        };
    }, [yDoc]);


    return <Grid container spacing={1} py={1}>
        <Grid size={6}>
            <QuestList quests={quests}/>
        </Grid>
        <Grid size={6}>
            <QuestEditForm/>
        </Grid>
    </Grid>
}

export default QuestsPage;
