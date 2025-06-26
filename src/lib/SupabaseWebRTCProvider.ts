import SimplePeer from 'simple-peer';
import * as Y from 'yjs';
import supabase from "@/supabaseClient";

export class SimplePeerProvider {
    private ydoc: Y.Doc;
    private room: string;
    private userId: string;
    private peers: Map<string, SimplePeer.Instance> = new Map();
    private channel: any;
    private presenceUnsubscribe: Function | null = null;

    constructor(ydoc: Y.Doc, room: string, userId: string) {
        this.ydoc = ydoc;
        this.room = room;
        this.userId = userId;

        this.setupSupabaseChannel();
    }

    private async setupSupabaseChannel() {
        // Создаем Realtime-канал для комнаты
        this.channel = supabase.channel(this.room);

        // 1. Подписываемся на сигналы
        this.channel.on('broadcast', {event: 'signal'}, ({payload}: any) => {
            const {senderId, signal} = payload;
            if (senderId === this.userId) return;

            this.handleSignal(senderId, signal);
        });

        // 2. Настраиваем Presence
        this.channel.on('presence', {event: 'sync'}, () => {
            const state = this.channel.presenceState();
            console.log(state);

            const onlineUserIds = Object.keys(state);

            console.log(onlineUserIds);

            // Удаляем пиров, которые больше не онлайн
            this.peers.forEach((_, peerId) => {
                if (!onlineUserIds.includes(peerId)) {
                    this.destroyPeer(peerId);
                }
            });

            // Создаем соединения с новыми пользователями
            onlineUserIds.filter(id => id !== this.userId).forEach(peerId => {
                if (!this.peers.has(peerId)) {
                    this.createPeer(peerId);
                }
            });
        });

        // Подписываемся на канал
        this.channel.subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
                // Отправляем текущее присутствие
                await this.channel.track({online: true});
            }
        });
    }

    private createPeer(targetUserId: string) {
        if (this.peers.has(targetUserId)) return;

        console.log(this.userId);

        // Определяем, кто инициатор (пользователь с меньшим ID)
        // const isInitiator = this.userId < targetUserId;
        // console.log(isInitiator, targetUserId);
        // console.log(this.peers);
        const peer = new SimplePeer({initiator: false});

        this.peers.set(targetUserId, peer);

        peer.on('signal', (signal: any) => {
            // console.log('signal', signal);
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
            console.error('Peer error:', err);
            this.destroyPeer(targetUserId);
        });
    }

    private handleSignal(senderId: string, signal: any) {
        let peer = this.peers.get(senderId);

        if (!peer) {
            // Создаем новое соединение для входящего сигнала
            this.createPeer(senderId);
            peer = this.peers.get(senderId);
        }

        // Передаем сигнал в SimplePeer
        if (peer) {
            peer.signal(signal);
        }
    }

    private destroyPeer(peerId: string) {
        const peer = this.peers.get(peerId);
        if (peer) {
            peer.destroy();
            this.peers.delete(peerId);
        }
    }

    public test(text: string) {
        // Отправляем обновление всем подключенным пирам
        this.peers.forEach((peer: SimplePeer) => {
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