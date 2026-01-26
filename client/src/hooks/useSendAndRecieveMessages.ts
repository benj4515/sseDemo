import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {decryptWithKey, encryptWithKey} from "../utils/encryption";

type ChatMessage = {
    user: string;
    content: string;
}

type TypingStatus = {
    user: string;
    isTyping: boolean;
};

type UseStreamMessagesOptions = {
    encryptionKey?: string | null;
    currentUser?: string | null;
};

export const useStreamMessages = ({ encryptionKey = null, currentUser = null }: UseStreamMessagesOptions = {}) => {
    const [rawMessages, setRawMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState("");
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const postTypingStatus = useCallback(async (isTypingValue: boolean) => {
        const displayUser = currentUser && currentUser.trim().length > 0
            ? currentUser.trim()
            : "Anonymous";

        try {
            await fetch("http://localhost:5196/chat/typing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isTyping: isTypingValue, user: displayUser }),
            });
        } catch (error) {
            console.warn("Unable to post typing status", error);
        }
    }, [currentUser]);

    const stopTyping = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        void postTypingStatus(false);
    }, [postTypingStatus]);

    const isTypingHandler = () => {
        void postTypingStatus(true);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 3000);
    };

    useEffect(() => {
        const typingEs = new EventSource("http://localhost:5196/chat/typingStream");

        typingEs.onmessage = (event) => {
            try {
                if (!event.data) {
                    setTypingUser(null);
                    return;
                }

                const typingStatus = JSON.parse(event.data) as TypingStatus;

                if (!typingStatus?.user) {
                    setTypingUser(null);
                    return;
                }

                if (currentUser && typingStatus.user === currentUser) {
                    setTypingUser(null);
                    return;
                }

                setTypingUser(typingStatus.isTyping ? typingStatus.user : null);
            } catch (error) {
                console.warn("Unable to parse typing event", error);
            }
        };

        return () => {
            typingEs.close();
        };
    }, [currentUser]);

    useEffect(() => {
        return () => {
            stopTyping();
        };
    }, [stopTyping]);

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
        stopTyping,
        isTyping: Boolean(typingUser),
        typingUser,
    };
};