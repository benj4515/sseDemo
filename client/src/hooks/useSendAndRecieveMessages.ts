import {useEffect, useMemo, useState} from "react";
import {decryptWithKey, encryptWithKey} from "../utils/encryption";

type ChatMessage = {
    user: string;
    content: string;
}

export const useStreamMessages = (encryptionKey?: string | null) => {
    const [rawMessages, setRawMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const es = new EventSource("http://localhost:5196/chat/stream");

        es.onmessage = (event) => {
            const obj = JSON.parse(event.data) as ChatMessage;
            console.log(obj);
            setRawMessages(prev => [
                ...prev, obj
            ]);
        };

        return () => es.close();
    }, []);

    const messages = useMemo(() => {
        return rawMessages.map((msg) => {
            if (!encryptionKey) {
                return msg;
            }

            const decryptedContent = decryptWithKey(msg.content, encryptionKey);
            if (!decryptedContent) {
                return msg;
            }

            return { ...msg, content: decryptedContent };
        });
    }, [rawMessages, encryptionKey]);

    /* useEffect(() => {
        const typingEs = new EventSource("http://localhost:5196/chat/typingStream");

        typingEs.onmessage = (event) => {
            const typingStatus = JSON.parse(event.data) as { isTyping: boolean };
            setIsTyping(typingStatus.isTyping);
        };
    }, []);

    */

    const isTypingHandler = () => {
        setIsTyping(true);
        void postTypingStatus(true);
        setTimeout(() => {
            setIsTyping(false);
            void postTypingStatus(false);
        }, 3000);
    };

    const postTypingStatus = async (isTypingValue: boolean) => {
        await fetch("http://localhost:5196/chat/typing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isTyping: isTypingValue }),
        });
    };

    const sendMessageToServer = async (username: string) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !username) return;

        let payload = trimmedMessage;
        if (encryptionKey) {
            const encrypted = encryptWithKey(trimmedMessage, encryptionKey);
            if (encrypted) {
                payload = encrypted;
            }
        }

        await fetch("http://localhost:5196/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: payload, user: username }),
        });

        setMessage("");
    };

    return {
        messages,
        message,
        setMessage,
        sendMessageToServer,
        isTypingHandler,
        isTyping,
    };
};