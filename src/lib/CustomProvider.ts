import {EventEmitter} from "events";

export class CustomProvider extends EventEmitter {
    ydoc: any;
    options: any;
    connected: any;

    constructor(ydoc: any, options: any) {
        super();
        this.ydoc = ydoc; // Y.Doc экземпляр
        this.options = options;
        this.connected = false;

        // Регистрируем обработчик обновлений
        ydoc.on('update', this.handleDocUpdate);
    }

    connect() {
        this.connected = true;
        this.emit('status', [{status: 'connected'}]);
    }

    disconnect() {
        this.connected = false;
        this.emit('status', [{status: 'disconnected'}]);
    }

    handleDocUpdate = (update: any, origin: any) => {
        if (origin !== this) {
            this.sendUpdate(update);
        }
    };

    sendUpdate(update: any) {
        // Абстрактный метод (реализуется в дочерних классах)
        throw new Error('sendUpdate not implemented');
    }

    applyUpdate(update: any) {
        import('yjs').then(Y => {
            Y.applyUpdate(this.ydoc, update, this);
        });
    }

    destroy() {

    }
}

export class MyWebRTCProvider extends CustomProvider {
    constructor(ydoc: any, peerId: any) {
        super(ydoc, {peerId});
        // this.peer = new SimplePeer({ initiator: true });
        this.setupPeer();
    }

    setupPeer() {
        // this.peer.on('signal', data => {
        //     // Отправьте `data` другим пирам через ваш сигнальный сервер
        // });
        //
        // this.peer.on('connect', () => {
        //     this.connect();
        // });
        //
        // this.peer.on('data', data => {
        //     this.applyUpdate(new Uint8Array(data));
        // });
    }

    sendUpdate(update: any) {
        console.log(update);
        // this.peer.send(update);
    }
}