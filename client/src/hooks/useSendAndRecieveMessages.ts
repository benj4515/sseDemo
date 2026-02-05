import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { decryptWithKey, encryptWithKey } from "../utils/encryption";
import {type MessageDTO, type TypingStatus} from "../models/ServerAPI.ts";
import {realtimeClient} from "../models/api-clients.ts";
import {getUserName} from "./useUserName.ts";

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

type MessageDtoPayload = {
    userId?: string;
    channelId?: string;
    content?: string;
};



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

const isMessageDtoPayload = (payload: unknown): payload is MessageDtoPayload => {
    if (!payload || typeof payload !== "object") {
        return false;
    }
    const candidate = payload as Record<string, unknown>;
    return typeof candidate.userId === "string" && typeof candidate.content === "string";
};



export const useStreamMessages = ({
                                      encryptionKey = null,
                                      currentUser = null,
                                      room = DEFAULT_ROOM,
                                  }: UseStreamMessagesOptions = {}) => {
    const username = getUserName() || "";
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
        const structured = tryParseJson<BroadcastPayload | MessageDtoPayload>(payloadString);

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

        if (isMessageDtoPayload(structured)) {
            setRawMessages((prev) => [...prev, { user: structured.userId ?? SYSTEM_USER, content: structured.content ?? "" }]);
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



    const joinRoom = useCallback(async (connection: string, targetRoom: string, username: string) => {
        try {
            const history = await realtimeClient.join(connection, targetRoom, username);

            if (Array.isArray(history) && history.length > 0) {
                // Append delivered history from the join response so it renders immediately.
                setRawMessages((prev) => [
                    ...prev,
                    ...history.map(({ userId, content }) => ({
                        user: userId ?? SYSTEM_USER,
                        content: content ?? "",
                    })),
                ]);
            }
        } catch (error) {
            console.warn("Unable to join room", error);
        }
    }, []);

    const leaveRoom = useCallback(async (connection: string, targetRoom: string) => {
        try {
            await realtimeClient.leave(connection, targetRoom);
        } catch (error) {
            console.warn("Unable to leave room", error);
        }
    }, []);


    useEffect(() => {
        if (!connectionId) {
            return;
        }

        void joinRoom(connectionId, roomName, username);
        return () => {
            void leaveRoom(connectionId, roomName);
        };
    }, [connectionId, joinRoom, leaveRoom, roomName]);

    const postTypingStatus = useCallback(async (isTypingValue: boolean) => {
        const user =
            currentUser && currentUser.trim().length > 0
                ? currentUser.trim()
                : "Anonymous";

        try {
            await realtimeClient.typing({
                user,
                isTyping: isTypingValue,
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

    useEffect(() => {
        const typingEs = new EventSource("http://localhost:5196/typingStream");

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

    const sendMessageToServer = async (usernameOverride?: string) => {
        const sender = (usernameOverride ?? currentUser ?? "").trim();
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !sender) return;

        let content = trimmedMessage;
        if (encryptionKey) {
            const encrypted = encryptWithKey(trimmedMessage, encryptionKey);
            if (encrypted) {
                content = encrypted;
            }
        }

        const dto: MessageDTO = {
            userId: sender,
            channelId: roomName,
            content,
        };

        await realtimeClient.send(dto.userId, dto.channelId, dto.content);
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