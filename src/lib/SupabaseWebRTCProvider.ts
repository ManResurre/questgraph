import SimplePeer from 'simple-peer';
import * as Y from 'yjs';
import supabase from "@/supabaseClient";
import {channel} from "@cloudflare/unenv-preset/node/process";

export class SimplePeerProvider {
    private ydoc: Y.Doc;
    private room: string;
    private userId: string;
    public peers: Map<string, SimplePeer.Instance> = new Map();
    private channel: any;
    private presenceUnsubscribe: Function | null = null;

    private pendingSignals: Map<string, any[]> = new Map();
    private isNegotiating: Map<string, boolean> = new Map();

    constructor(ydoc: Y.Doc, room: string, userId: string) {
        this.ydoc = ydoc;
        this.room = room;
        this.userId = userId;

        this.setupSupabaseChannel();
    }

    private async setupSupabaseChannel() {
        // Создаем Realtime-канал для комнаты
        this.channel = supabase.channel(this.room);

        setInterval(() => {
            this.peers.keys().forEach((key) => {
                console.log(key, this.peers.get(key).connected);
            })
            // this.channel.track({online: true, userId: this.userId});
        }, 10000)

        // 1. Подписываемся на сигналы
        this.channel.on('broadcast', {event: 'signal'}, ({payload}: any) => {
            const {senderId, signal} = payload;
            if (senderId === this.userId) return;

            this.handleSignal(senderId, signal);
        });

        // 2. Настраиваем Presence
        this.channel
            .on('presence', {event: 'sync'}, () => {
                const state = this.channel.presenceState()
                const values = Object.values(state);
                const onlineUserIds = values.map((item: any) => item[0]).map(e => e.userId)
                console.log(onlineUserIds);
                onlineUserIds.forEach((id: string) => {
                    if (this.userId == id) {
                        return;
                    }
                    // const peer = this.peers.get(id);
                    // console.log(this.peers);
                })
            })
            .on('presence', {event: 'join'}, ({key, newPresences}) => {
                console.log('join', key, newPresences)
                const joinUser = newPresences.map((item: any) => item.userId)[0];
                if (joinUser === this.userId)
                    return;

                if (!this.peers.has(joinUser))
                    this.createPeer(joinUser);
            })
            .on('presence', {event: 'leave'}, ({key, leftPresences}) => {
                console.log('leave', key, leftPresences)
                leftPresences.map((item: any) => this.destroyPeer(item.userId))
            })


        // Подписываемся на канал
        this.channel.subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
                // Отправляем текущее присутствие
                await this.channel.track({online: true, userId: this.userId});
            }
        });
    }

    private createPeer(targetUserId: string) {
        // if (this.peers.has(targetUserId)) return;

        const existingPeer = this.peers.get(targetUserId);
        if (existingPeer && !existingPeer.destroyed) {
            return existingPeer;
        }

        // Определяем, кто инициатор (пользователь с меньшим ID)
        const isInitiator = this.userId < targetUserId;

        if (isInitiator)
            console.log('initiator:' + this.userId)

        const peer = new SimplePeer({initiator: isInitiator, trickle: true});
        // peer._debug = console.log

        this.peers.set(targetUserId, peer);
        this.isNegotiating.set(targetUserId, false);
        this.pendingSignals.set(targetUserId, []);

        peer.on('signal', (signal: any) => {
            // Не отправляем сигналы, если пир уничтожен
            if (peer.destroyed) return;

            // Отправляем сигнал через Supabase
            this.channel.send({
                type: 'broadcast',
                event: 'signal',
                payload: {
                    senderId: this.userId,
                    receiverId: targetUserId,
                    signal
                }
            });
        });

        peer.on('connect', () => {
            console.log(`Connected to ${targetUserId}`);

            // Очищаем отложенные сигналы после подключения
            this.pendingSignals.delete(targetUserId);

            // Отправляем текущее состояние документа
            // const update = Y.encodeStateAsUpdate(this.ydoc);
            // peer.send(update);
            peer.send("Hello " + targetUserId)
        });

        peer.on('data', (data: any) => {
            // Применяем обновление к документу
            // Y.applyUpdate(this.ydoc, new Uint8Array(data));
            const decoder = new TextDecoder();
            const message = decoder.decode(data);

            console.log('Received message:', message);
        });

        peer.on('error', (err: any) => {
            console.log('Peer error:', err);
            // this.destroyPeer(targetUserId);
        });

        peer.on('close', () => {
            console.log(`Connection closed with ${targetUserId}`);
            this.destroyPeer(targetUserId);
            // this.channel.track({online: true, userId: targetUserId});
        });

        // Обработка событий ICE
        peer.on('iceStateChange', (state: any) => {
            // console.log(`ICE state for ${targetUserId}:`, state);
        });

        return peer;
    }

    private handleSignal(senderId: string, signal: any) {
        // Игнорируем сигналы от себя
        if (senderId === this.userId) return;

        // console.log(`Received signal from ${senderId}:`, signal.type);

        let peer = this.peers.get(senderId);

        // Ранняя проверка на установленное соединение
        if (peer?.connected) {
            console.log(`Signal ignored (already connected): ${signal.type}`);
            return;
        }

        // Если пира нет - создаем и сохраняем сигнал для будущей обработки
        if (!peer) {
            peer = this.createPeer(senderId);
            this.pendingSignals.get(senderId)?.push(signal);
            return;
        }

        // Если пир уничтожен - игнорируем сигнал
        if (peer.destroyed) {
            console.warn(`Ignoring signal for destroyed peer: ${senderId}`);
            return;
        }

        // Если идет процесс согласования - сохраняем сигнал в очередь
        if (this.isNegotiating.get(senderId)) {
            console.log(`Queuing signal (negotiation in progress): ${signal.type}`);
            this.pendingSignals.get(senderId)?.push(signal);
            return;
        }

        try {
            // Помечаем начало процесса обработки сигнала
            this.isNegotiating.set(senderId, true);

            // Обрабатываем текущий сигнал
            peer.signal(signal);

            // Обрабатываем все ожидающие сигналы
            const pending = this.pendingSignals.get(senderId) || [];
            while (pending.length > 0) {
                const nextSignal = pending.shift();
                if (nextSignal) {
                    console.log(`Processing queued signal: ${nextSignal.type}`);
                    peer.signal(nextSignal);
                }
            }
        } catch (err: any) {
            console.error(`Signal handling error for ${senderId}:`, err);

            // Для нефатальных ошибок не уничтожаем соединение
            if (err.name !== 'InvalidStateError') {
                this.destroyPeer(senderId);
            }
        } finally {
            // Снимаем флаг независимо от результата
            this.isNegotiating.set(senderId, false);
        }
    }

    private destroyPeer(peerId: string) {
        const peer = this.peers.get(peerId);
        if (peer) {
            // Удаляем все обработчики событий
            peer.removeAllListeners();

            // Безопасное уничтожение
            try {
                if (!peer.destroyed) {
                    peer.destroy();
                }
            } catch (e) {
                console.error('Error destroying peer:', e);
            }

            // Очищаем связанные данные
            this.peers.delete(peerId);
            this.pendingSignals.delete(peerId);
            this.isNegotiating.delete(peerId);

            console.log(`Destroyed peer: ${peerId}`);
        }
    }

    public test(text: string) {
        // Отправляем обновление всем подключенным пирам
        this.peers.forEach((peer) => {
            if (peer.connected) peer.send(text);
        });
    }


    public sendUpdate(update: Uint8Array) {
        // Отправляем обновление всем подключенным пирам
        this.peers.forEach(peer => {
            if (peer.connected) peer.send(update);
        });
    }

    public destroy() {
        // Отслеживаем отключение
        this.channel.untrack();
        this.channel.unsubscribe();

        // Закрываем все P2P-соединения
        this.peers.forEach(peer => peer.destroy());
        this.peers.clear();
    }
}
