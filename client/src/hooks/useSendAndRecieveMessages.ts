import {useEffect, useState} from "react";

type ChatMessage = {
    user: string;
    content: string;
}

export const useStreamMessages = () => {
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [message, setMessage] = useState("");
const [isTyping, setIsTyping] = useState(false);

useEffect(() => {
    const es = new EventSource("http://localhost:5196/chat/stream");

    es.onmessage = (event) => {
        const obj = JSON.parse(event.data) as ChatMessage;
        console.log(obj);
        setMessages(prev => [
            ...prev, obj
        ]);
    };

    return () => es.close();
}, []);

    useEffect(() => {
    const typingEs = new EventSource("http://localhost:5196/chat/typingStream");

    typingEs.onmessage = (event) => {
        const typingStatus = JSON.parse(event.data) as { isTyping: boolean };
        setIsTyping(typingStatus.isTyping);
    }
    }, []);

const isTypingHandler = () => {
    setIsTyping(true);
    TypingHandler(isTyping);
    setTimeout(() => setIsTyping(false), 3000);
    TypingHandler(isTyping);
};

const TypingHandler = async (isTyping: boolean) => {
    await fetch("http://localhost:5196/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
    });
}

    const sendMessageToServer = async (username: string) => {
        if (!message.trim() || !username) return;



        await fetch("http://localhost:5196/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: message, user: username }),
        });

        setMessage("");
    };

    return{
    messages,
    message,
    setMessage,
    sendMessageToServer,
    isTypingHandler
    };

}