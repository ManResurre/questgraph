import {ProviderOptions, WebrtcProvider} from "y-webrtc";
import * as Y from "yjs";
import {Array} from "yjs";
import * as map from "lib0/map";
import * as buffer from "lib0/buffer";
import * as cryptoutils from './crypto.js'
import supabase from "@/supabaseClient";
import {REALTIME_LISTEN_TYPES, REALTIME_SUBSCRIBE_STATES} from "@supabase/realtime-js";

const signalingConns = new Map();

const emitStatus = (provider: any) => {
    provider.emit('status', [{
        connected: provider.connected
    }])
}

const rooms = new Map();

const publishSignalingMessage = (conn: any, room: any, data: any) => {
    if (room.key) {
        cryptoutils.encryptJson(data, room.key).then(data => {
            conn.send({type: 'publish', topic: room.name, data: buffer.toBase64(data)})
        })
    } else {
        conn.send({type: 'publish', topic: room.name, data})
    }
}

export class SignalingConnRework {
    listeners: Set<(data: Uint8Array) => void> = new Set();

    providers = new Set();

    sbRoom = supabase.channel('testroom');

    constructor(url: string) {
        /**
         * @type {Set<WebrtcProvider>}
         */
        this.providers = new Set()
        this.sbRoom = supabase.channel('testroom');
        this.sbRoom.subscribe((status) => {
            if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
                this.sbRoom.send({
                    type: REALTIME_LISTEN_TYPES.BROADCAST,
                    event: 'connect',
                    payload: {message: 'Hi'},
                })
            }
        })


        this.on('connect', () => {
            console.log(`connected (${url})`)
            const topics = Array.from(rooms.keys() as any)
            this.send({type: 'subscribe', topics})
            rooms.forEach(room =>
                publishSignalingMessage(this, room, {type: 'announce', from: room.peerId})
            )
        })
        this.on('message', (m: any) => {
            switch (m.type) {
                case 'publish': {
                    const roomName = m.topic
                    const room = rooms.get(roomName)
                    if (room == null || typeof roomName !== 'string') {
                        return
                    }
                    const execMessage = (data: any) => {
                        const webrtcConns = room.webrtcConns
                        const peerId = room.peerId
                        if (data == null || data.from === peerId || (data.to !== undefined && data.to !== peerId) || room.bcConns.has(data.from)) {
                            // ignore messages that are not addressed to this conn, or from clients that are connected via broadcastchannel
                            return
                        }
                        const emitPeerChange = webrtcConns.has(data.from)
                            ? () => {
                            }
                            : () =>
                                room.provider.emit('peers', [{
                                    removed: [],
                                    added: [data.from],
                                    webrtcPeers: Array.from(room.webrtcConns.keys()),
                                    bcPeers: Array.from(room.bcConns)
                                }])
                        switch (data.type) {
                            case 'announce':
                                if (webrtcConns.size < room.provider.maxConns) {
                                    map.setIfUndefined(webrtcConns, data.from, () => new WebrtcConn(this as unknown as SignalingConn, true, data.from, room))
                                    emitPeerChange()
                                }
                                break
                            case 'signal':
                                if (data.signal.type === 'offer') {
                                    const existingConn = webrtcConns.get(data.from)
                                    if (existingConn) {
                                        const remoteToken = data.token
                                        const localToken = existingConn.glareToken
                                        if (localToken && localToken > remoteToken) {
                                            console.log('offer rejected: ', data.from)
                                            return
                                        }
                                        // if we don't reject the offer, we will be accepting it and answering it
                                        existingConn.glareToken = undefined
                                    }
                                }
                                if (data.signal.type === 'answer') {
                                    console.log('offer answered by: ', data.from)
                                    const existingConn = webrtcConns.get(data.from)
                                    existingConn.glareToken = undefined
                                }
                                if (data.to === peerId) {
                                    map.setIfUndefined(webrtcConns, data.from, () => new WebrtcConn(this as unknown as SignalingConn, false, data.from, room)).peer.signal(data.signal)
                                    emitPeerChange()
                                }
                                break
                        }
                    }
                    if (room.key) {
                        if (typeof m.data === 'string') {
                            cryptoutils.decryptJson(buffer.fromBase64(m.data), room.key).then(execMessage)
                        }
                    } else {
                        execMessage(m.data)
                    }
                }
            }
        })
        this.on('disconnect', () => console.log(`disconnect (${url})`))
    }

    on(event: string, cb: (m: any) => void) {
        console.log('on', event);

        this.sbRoom.on(
            REALTIME_LISTEN_TYPES.BROADCAST,
            {event: event},
            (payload: any) => cb.bind(this)(payload)
        );
    }

    send(payload: any) {
        console.log('send', payload);
        this.sbRoom.send({
            type: REALTIME_LISTEN_TYPES.BROADCAST,
            event: 'message',
            payload,
        })
    }

    disconnect() {
        this.sbRoom.unsubscribe();
    }
}

export class WebrtcProviderRework extends WebrtcProvider {
    constructor(roomName: string, doc: Y.Doc, options?: ProviderOptions | null) {
        super(roomName, doc, options);
    }

    connect() {
        this.shouldConnect = true
        this.signalingUrls.forEach(url => {
            const signalingConn = map.setIfUndefined(signalingConns, url, () => new SignalingConnRework(url))
            this.signalingConns.push(signalingConn)
            signalingConn.providers.add(this)
        })
        if (this.room) {
            this.room.connect()
            emitStatus(this)
        }
    }
}