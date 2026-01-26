// Lightweight XOR + base64 helper for demo-only message obfuscation.
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const xorWithKey = (data: Uint8Array, key: Uint8Array) => {
    if (key.length === 0) {
        throw new Error("Encryption key cannot be empty");
    }

    const output = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i += 1) {
        output[i] = data[i] ^ key[i % key.length];
    }

    return output;
};

const toBase64 = (bytes: Uint8Array) => {
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
};

const fromBase64 = (value: string) => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
};

export const encryptWithKey = (plainText: string, key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
        return null;
    }

    const plaintextBytes = textEncoder.encode(plainText);
    const keyBytes = textEncoder.encode(trimmedKey);
    const encryptedBytes = xorWithKey(plaintextBytes, keyBytes);

    return toBase64(encryptedBytes);
};

export const decryptWithKey = (cipherText: string, key: string) => {
    try {
        const trimmedKey = key.trim();
        if (!trimmedKey) {
            return null;
        }

        const cipherBytes = fromBase64(cipherText);
        const keyBytes = textEncoder.encode(trimmedKey);
        const decryptedBytes = xorWithKey(cipherBytes, keyBytes);

        return textDecoder.decode(decryptedBytes);
    } catch (error) {
        console.warn("Unable to decrypt message", error);
        return null;
    }
};
