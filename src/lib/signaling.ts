// import * as Y from 'yjs';
// import supabase from "@/supabaseClient";
// import {WebrtcProvider} from "y-webrtc";
//
// class SupabaseSignaling {
//     providers = new Set();
//     shouldConnect = false;
//     roomId: string;
//     channel: any;
//     listeners: Set<(data: Uint8Array) => void> = new Set();
//
//     constructor(roomId: string) {
//         this.roomId = roomId;
//         this.channel = null;
//     }
//
//     connect() {
//         console.log("connect SupabaseSignaling");
//         if (this.shouldConnect || this.channel) return;
//         this.shouldConnect = true;
//
//         this.channel = supabase.channel(this.roomId)
//             .on('postgres_changes', {
//                 event: '*',
//                 schema: 'public',
//                 table: 'yjs_signals',
//             }, (payload) => {
//                 console.log('payload', payload);
//                 // Преобразуем данные обратно в Uint8Array
//                 // const uint8Data = new Uint8Array(payload.new.signal_data);
//                 // this.listeners.forEach(cb => cb(uint8Data));
//             })
//             .subscribe();
//
//
//     }
//
//     disconnect() {
//         if (!this.shouldConnect || !this.channel) return;
//         this.shouldConnect = false;
//
//         supabase.removeChannel(this.channel);
//         this.channel = null;
//     }
//
//     destroy() {
//         this.disconnect();
//         this.providers.clear();
//         this.listeners.clear();
//     }
//
//     on(event: 'signal' | 'error', cb: (data: Uint8Array | Error) => void) {
//         if (event === 'signal') {
//             this.listeners.add(cb as (data: Uint8Array) => void);
//         }
//     }
//
//     send(data: Uint8Array) {
//         supabase.from('signals').insert({
//             room_id: this.roomId,
//             signal_data: Array.from(data) // Преобразуем Uint8Array в массив чисел
//         });
//     }
// }
//
// // Глобальный кэш провайдеров
// const providerCache = new Map<string, WebrtcProvider>();
//
// export function getYWebRTCProvider(roomId: string, yDoc: Y.Doc): WebrtcProvider {
//     const cacheKey = `${roomId}-${yDoc.guid}`;
//
//     if (providerCache.has(cacheKey)) {
//         return providerCache.get(cacheKey)!;
//     }
//
//     const signaling: any = new SupabaseSignaling(roomId);
//     const provider = new WebrtcProvider(roomId, yDoc, {
//         signaling: [signaling]
//     });
//
//     providerCache.set(cacheKey, provider);
//
//     // Уничтожаем провайдер при закрытии документа
//     yDoc.on('destroy', () => {
//         provider.destroy();
//         providerCache.delete(cacheKey);
//     });
//
//     return provider;
// }
