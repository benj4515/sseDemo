import {useEffect, useState} from "react";

const STORAGE_KEY = "encryptionKey";

export const useEncryptionKey = () => {
    const [encryptionKey, setEncryptionKey] = useState<string | null>(() => {
        const savedKey = sessionStorage.getItem(STORAGE_KEY);
        return savedKey && savedKey.trim().length > 0 ? savedKey : null;
    });

    useEffect(() => {
        if (encryptionKey && encryptionKey.trim().length > 0) {
            sessionStorage.setItem(STORAGE_KEY, encryptionKey.trim());
        } else {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }, [encryptionKey]);

    return { encryptionKey, setEncryptionKey } as const;
};