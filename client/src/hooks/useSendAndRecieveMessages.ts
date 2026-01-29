import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decryptWithKey, encryptWithKey } from "../utils/encryption";

const REALTIME_BASE_URL = "http://localhost:5196";
const CONNECT_ENDPOINT = `${REALTIME_BASE_URL}/connect`;
const DEFAULT_ROOM = "general";
const SYSTEM_USER = "System";

type ChatMessage = {
    user: string;
    content: string;
};

type UseStreamMessagesOptions = {
    encryptionKey?: string | null;
    currentUser?: string | null;
    room?: string | null;
};

type ServerEnvelope = {
    connectionId?: string;
    message?: unknown;
};

type ChatBroadcastPayload = {
    type: "chat";
    user: string;
    content: string;
};

type TypingBroadcastPayload = {
    type: "typing";
    user: string;
    isTyping: boolean;
};

type BroadcastPayload =
    | ChatBroadcastPayload
    | TypingBroadcastPayload
    | { type?: string; user?: string; content?: string; isTyping?: boolean };

const tryParseJson = <T,>(value: string): T | null => {
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

const sanitizeRoom = (room?: string | null) =>
    room && room.trim().length > 0 ? room.trim() : DEFAULT_ROOM;

const extractPayload = (envelope: ServerEnvelope | null, fallback: string) => {
    if (!envelope || envelope.message === undefined || envelope.message === null) {
        return fallback;
    }
    if (typeof envelope.message === "string") {
        return envelope.message;
    }
    return JSON.stringify(envelope.message);
};

const isChatPayload = (payload: BroadcastPayload | null): payload is ChatBroadcastPayload =>
    payload?.type === "chat" &&
    typeof payload.user === "string" &&
    typeof payload.content === "string";

const isTypingPayload = (payload: BroadcastPayload | null): payload is TypingBroadcastPayload =>
    payload?.type === "typing" &&
    typeof payload.user === "string" &&
    typeof payload.isTyping === "boolean";

export const useStreamMessages = ({
                                      encryptionKey = null,
                                      currentUser = null,
                                      room = null,
                                  }: UseStreamMessagesOptions = {}) => {
    const roomName = sanitizeRoom(room);
    const [rawMessages, setRawMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState("");
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentUserRef = useRef<string | null>(currentUser);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useEffect(() => {
        setRawMessages([]);
        setTypingUser(null);
    }, [roomName]);

    const processIncomingMessage = useCallback((rawData: string) => {
        // Fan-out SSE payloads into chat messages or typing indicators.
        const envelope = tryParseJson<ServerEnvelope>(rawData);
        const payloadString = extractPayload(envelope, rawData);
        const structured = tryParseJson<BroadcastPayload>(payloadString);

        if (isTypingPayload(structured)) {
            if (currentUserRef.current && structured.user === currentUserRef.current) {
                return;
            }
            setTypingUser(structured.isTyping ? structured.user : null);
            return;
        }

        if (isChatPayload(structured)) {
            setRawMessages((prev) => [...prev, { user: structured.user, content: structured.content }]);
            return;
        }

        if (payloadString.trim().length > 0) {
            setRawMessages((prev) => [...prev, { user: SYSTEM_USER, content: payloadString }]);
        }
    }, []);

    useEffect(() => {
        const es = new EventSource(CONNECT_ENDPOINT);

        const handleConnected = (event: MessageEvent) => {
            const payload = tryParseJson<ServerEnvelope>(event.data);
            if (payload?.connectionId) {
                setConnectionId(payload.connectionId);
            }
        };

        const handleBroadcast = (event: MessageEvent) => {
            processIncomingMessage(event.data);
        };

        es.addEventListener("connected", handleConnected as EventListener);
        es.addEventListener(roomName, handleBroadcast as EventListener);
        es.onmessage = handleBroadcast;

        return () => {
            es.removeEventListener("connected", handleConnected as EventListener);
            es.removeEventListener(roomName, handleBroadcast as EventListener);
            es.close();
        };
    }, [processIncomingMessage, roomName]);

    const joinRoom = useCallback(async (connection: string, targetRoom: string) => {
        const params = new URLSearchParams({ connectionId: connection, room: targetRoom });
        try {
            await fetch(`${REALTIME_BASE_URL}/join?${params.toString()}`, { method: "POST" });
        } catch (error) {
            console.warn("Unable to join room", error);
        }
    }, []);

    const leaveRoom = useCallback(async (connection: string, targetRoom: string) => {
        const params = new URLSearchParams({ connectionId: connection, room: targetRoom });
        try {
            await fetch(`${REALTIME_BASE_URL}/leave?${params.toString()}`, { method: "POST" });
        } catch (error) {
            console.warn("Unable to leave room", error);
        }
    }, []);

    useEffect(() => {
        if (!connectionId) {
            return;
        }

        void joinRoom(connectionId, roomName);
        return () => {
            void leaveRoom(connectionId, roomName);
        };
    }, [connectionId, joinRoom, leaveRoom, roomName]);

    const sendToRoom = useCallback(
        async (payload: string) => {
            const params = new URLSearchParams({ room: roomName, message: payload });
            try {
                await fetch(`${REALTIME_BASE_URL}/send?${params.toString()}`, { method: "POST" });
            } catch (error) {
                console.warn("Unable to send payload", error);
            }
        },
        [roomName]
    );

    const postTypingStatus = useCallback(async (isTypingValue: boolean) => {
        const displayUser = currentUser && currentUser.trim().length > 0
            ? currentUser.trim()
            : "Anonymous";

        const payload = JSON.stringify({
            type: "typing" as const,
            user: displayUser,
            isTyping: isTypingValue,
        });

        await sendToRoom(payload);
    }, [currentUser, sendToRoom]);

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
        return () => {
            stopTyping();
        };
    }, [stopTyping]);

    const messages = useMemo(() => {
        return rawMessages.map((msg) => {
            if (!encryptionKey || msg.user === SYSTEM_USER) {
                return msg;
            }

            const decryptedContent = decryptWithKey(msg.content, encryptionKey);
            if (!decryptedContent) {
                return msg;
            }

            return { ...msg, content: decryptedContent };
        });
    }, [rawMessages, encryptionKey]);

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

        const serialized = JSON.stringify({
            type: "chat" as const,
            user: username,
            content: payload,
        });

        await sendToRoom(serialized);
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