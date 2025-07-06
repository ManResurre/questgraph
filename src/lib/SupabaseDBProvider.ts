import SimplePeer from 'simple-peer';
import * as Y from 'yjs';
import supabase from "@/supabaseClient";
import {Dispatch, SetStateAction} from "react";

export class SupabaseDBProvider {
    static #instance: SupabaseDBProvider;
    private ydoc: Y.Doc;
    private roomId: string;
    private userId: string;
    public peers: Map<string, SimplePeer.Instance> = new Map();
    public participants: any = [];
    private intervalId: NodeJS.Timeout | null = null;

    update: Dispatch<SetStateAction<string>>;

    // Таблицы Supabase
    private PARTICIPANTS_TABLE = 'participants';
    private SIGNALS_TABLE = 'signals';

    constructor() {
        if (SupabaseDBProvider.#instance) {
            return SupabaseDBProvider.#instance;
        }
        SupabaseDBProvider.#instance = this;
        console.log('Init');
    }

    public static async create(yDoc: Y.Doc, roomId: string, userId: string, update: Dispatch<SetStateAction<string>>) {
        if (!SupabaseDBProvider.#instance) {
            const instance = new SupabaseDBProvider();
            instance.ydoc = yDoc;
            instance.roomId = roomId;
            instance.userId = userId;
            instance.update = update
            await instance.init();
            SupabaseDBProvider.#instance = instance;
        }

        return SupabaseDBProvider.#instance;
    }

    private async init() {
        // 1. Регистрация участника
        await this.registerParticipant();

        // 2. Запуск мониторинга присутствия
        this.startPresenceMonitoring();

        // 3. Подписка на изменения участников
        await this.subscribeToParticipants();

        // 4. Подписка на сигналы
        await this.subscribeToSignals();
    }

    private async registerParticipant() {
        const {error} = await supabase
            .from(this.PARTICIPANTS_TABLE)
            .upsert({
                room_id: this.roomId,
                user_id: this.userId,
                status: 'online',
                last_seen: new Date().toISOString()
            });

        if (error) console.error('Participant registration error:', error);
    }

    private startPresenceMonitoring() {
        // Обновление присутствия каждые 5 секунд
        // this.intervalId = setInterval(async () => {
        //     await supabase
        //         .from(this.PARTICIPANTS_TABLE)
        //         .update({
        //             last_seen: new Date().toISOString()
        //         })
        //         .eq('room_id', this.roomId)
        //         .eq('user_id', this.userId);
        // }, 5000);
    }

    private async subscribeToParticipants() {
        // Получаем текущий список участников
        const {data, error} = await supabase
            .from(this.PARTICIPANTS_TABLE)
            .select('id, user_id')
            .eq('room_id', this.roomId)
            .eq('status', 'online');

        if (error) {
            console.error('Error fetching participants:', error);
            return;
        }

        this.participants = data;

        // Инициируем соединения с новыми участниками
        data.forEach(({user_id}) => {
            if (user_id !== this.userId && !this.peers.has(user_id)) {
                this.connectToParticipant(user_id);
            }
        });

        // Подписываемся на изменения в реальном времени
        supabase
            .channel('participants')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: this.PARTICIPANTS_TABLE,
                filter: `room_id=eq.${this.roomId}`
            }, async (payload) => {
                const userId = payload.new.user_id;
                if (userId !== this.userId) {
                    await this.connectToParticipant(userId);
                }
                const {data} = await supabase
                    .from(this.PARTICIPANTS_TABLE)
                    .select('id, user_id')
                    .eq('room_id', this.roomId)
                    .eq('status', 'online');
                this.participants = data;
                this.update('new user');
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: this.PARTICIPANTS_TABLE,
                filter: `room_id=eq.${this.roomId}`
            }, (payload) => {
                // Обработка обновлений статуса
            })
            .subscribe();

        this.update('subscribeToParticipants');
    }

    private async subscribeToSignals() {
        // Получаем непрочитанные сигналы
        const {data, error} = await supabase
            .from(this.SIGNALS_TABLE)
            .select('*')
            .eq('to_user', this.userId)
            .eq('consumed', false)
            .eq('room_id', this.roomId);

        if (error) {
            console.error('Error fetching signals:', error);
            return;
        }

        // Обрабатываем существующие сигналы
        data.forEach(signal => {
            this.handleSignal(signal.from_user, signal.signal);
            this.markSignalConsumed(signal.id);
        });

        // Подписываемся на новые сигналы в реальном времени
        supabase
            .channel('signals')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: this.SIGNALS_TABLE,
                filter: `to_user=eq.${this.userId}`
            }, (payload) => {
                console.log('payload', payload);
                const signal = payload.new;
                this.handleSignal(signal.from_user, signal.signal);
                this.markSignalConsumed(signal.id);
            })
            .subscribe();
    }

    private async connectToParticipant(targetUserId: string) {
        // Получаем время подключения обоих участников
        const {data: participants, error} = await supabase
            .from(this.PARTICIPANTS_TABLE)
            .select('user_id, last_seen')
            .in('user_id', [this.userId, targetUserId])
            .order('last_seen', {ascending: true});

        if (error) throw error;
        if (!participants || participants.length < 2) {
            console.warn('Participant data not available');
            return;
        }

        // Определяем, кто подключился раньше
        const [first, second] = participants;
        console.log('first', first);
        const isInitiator = first.user_id === this.userId;

        if (isInitiator) {
            await this.createPeer(targetUserId, true);
        } else {
            // Для не-инициатора создаем пассивное соединение
            await this.createPeer(targetUserId, false);
        }
    }

    private async createPeer(targetUserId: string, isInitiator: boolean) {
        if (this.peers.has(targetUserId)) return;

        const peer = new SimplePeer({
            initiator: isInitiator,
            // trickle: true
        });
        peer._debug = console.log;

        this.peers.set(targetUserId, peer);

        peer.on('signal', async (signal: any) => {
            console.log('Сохраняем сигнал в Supabase: ' + signal.type);
            // Сохраняем сигнал в Supabase
            await supabase
                .from(this.SIGNALS_TABLE)
                .insert({
                    room_id: this.roomId,
                    from_user: this.userId,
                    to_user: targetUserId,
                    type: signal.type,
                    signal: signal
                });
        });

        peer.on('connect', () => {
            console.log(`Connected to ${targetUserId}`);
            // Логика после подключения
            this.update('connected');
        });

        peer.on('end', () => {
            console.log(`end to ${targetUserId}`);
            this.destroyPeer(targetUserId);
            this.update('end');
        });

        peer.on('data', (data: any) => {
            // Обработка входящих данных
            console.log(data);
        });

        peer.on('iceStateChange', (state: any) => {
            if (state === 'disconnected') {
                console.warn(`Disconnected from ${targetUserId}, reconnecting...`);

                supabase
                    .from(this.PARTICIPANTS_TABLE)
                    .delete()
                    .eq('user_id', targetUserId)
                    .eq('room_id', this.roomId);

                this.destroyPeer(targetUserId);

                // Плавный перезапуск соединения
                // setTimeout(() => {
                //     if (!peer.connected && !peer.destroyed) {
                //         this.destroyPeer(targetUserId);
                //         this.createPeer(targetUserId, true);
                //     }
                // }, 2000);
            }
        });

        return peer;
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
            console.log(`Destroyed peer: ${peerId}`);
            this.update('destroy peer');
        }
    }

    private async handleSignal(senderId: string, signal: any) {
        let peer = this.peers.get(senderId);

        if (!peer) {
            // Создаем пир как не-инициатор
            peer = await this.createPeer(senderId, false);
        }

        if (peer && !peer.destroyed) {
            peer.signal(signal);
        }
    }

    private async markSignalConsumed(signalId: string) {
        await supabase
            .from(this.SIGNALS_TABLE)
            .update({consumed: true})
            .eq('id', signalId);
    }

    private async unregisterParticipant() {
        await supabase
            .from(this.PARTICIPANTS_TABLE)
            .update({status: 'offline'})
            .eq('room_id', this.roomId)
            .eq('user_id', this.userId);
    }

    public async destroy() {
        // Очистка ресурсов
        if (this.intervalId) clearInterval(this.intervalId);

        // Обновление статуса
        await this.unregisterParticipant();

        // Закрытие соединений
        this.peers.forEach(peer => peer.destroy());
        this.peers.clear();

        // Отписка от каналов
        supabase.removeAllChannels();
    }

    public test(text: string) {
        // Отправляем обновление всем подключенным пирам
        this.peers.forEach((peer) => {
            if (peer.connected) peer.send(text);
        });
    }
}
