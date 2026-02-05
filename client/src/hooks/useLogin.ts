import { useCallback, useMemo, useState } from "react";
import {useNavigate } from "react-router-dom";
import {useUserName} from "./useUserName.ts";

export type LoginCredentials = {
    username: string;
    password: string;
};

export const useLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // Keep a reference to the shared username setter so chat can read it.
    const { setUsername: setStoredUsername } = useUserName();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const canSubmit = useMemo(
        () => username.trim().length > 0 && password.trim().length > 0,
        [username, password]
    );

    const login = useCallback(async (): Promise<LoginCredentials | null> => {
        const sanitizedUsername = username.trim();
        const sanitizedPassword = password.trim();

        if (!sanitizedUsername || !sanitizedPassword) {
            setError("Username and password are required.");
            return null;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const credentials: LoginCredentials = {
                username: sanitizedUsername,
                password: sanitizedPassword,
            };

            if (credentials.username === "Marley" && credentials.password === "bob123") {
                setStoredUsername(credentials.username);
                navigate("/chat");
                return credentials;

            }

            if (credentials.username === "Alice" && credentials.password === "wonderland") {
                setStoredUsername(credentials.username);
                navigate("/chat");
                return credentials;
            }



        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to login. Please try again.";
            setError(message);
            return null;
        } finally {
            setIsSubmitting(false);
            return null;
        }
    }, [navigate, password, setStoredUsername, username]);

    return {
        username,
        password,
        setUsername,
        setPassword,
        login,
        canSubmit,
        isSubmitting,
        error,
        setError,
    } as const;
};
