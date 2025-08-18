export class CryptHelper {
    static async generateRSAKeys() {
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 2048, // 2048 или 4096
                    publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
                    hash: "SHA-256",
                },
                true, // ключи можно экспортировать
                ["encrypt", "decrypt"] // права доступа
            );

            return keyPair;
        } catch (error) {
            console.error("Ошибка генерации ключей:", error);
            throw error;
        }
    }

    static async exportKey(key: CryptoKey, format: "pkcs8" | "spki" = 'spki') {
        const exported = await window.crypto.subtle.exportKey(
            format,
            key
        );

        // Конвертируем в base64
        const base64 = btoa(String.fromCharCode(...new Uint8Array(exported)));

        // Форматируем как PEM
        const pemHeader = format === 'spki'
            ? '-----BEGIN PUBLIC KEY-----'
            : '-----BEGIN PRIVATE KEY-----';

        const pemFooter = format === 'spki'
            ? '-----END PUBLIC KEY-----'
            : '-----END PRIVATE KEY-----';

        return `${pemHeader}\n${base64.match(/.{1,64}/g)!.join('\n')}\n${pemFooter}`;
    }

    static async importPublicKey(pem: string) {
        // Удаляем PEM-заголовки и пробелы
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = pem
            .replace(pemHeader, "")
            .replace(pemFooter, "")
            .replace(/\s+/g, "");

        // Декодируем Base64
        const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

        return await window.crypto.subtle.importKey(
            "spki", // Формат: SubjectPublicKeyInfo
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true, // extractable
            ["encrypt"] // разрешения
        );
    }

    static async importPrivateKey(pem: string) {
        // Удаляем PEM-заголовки и пробелы
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = pem
            .replace(pemHeader, "")
            .replace(pemFooter, "")
            .replace(/\s+/g, "");

        // Декодируем Base64
        const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

        return await window.crypto.subtle.importKey(
            "pkcs8", // Формат: PKCS #8
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true, // extractable
            ["decrypt"] // разрешения
        );
    }
}
