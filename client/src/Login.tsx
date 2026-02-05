import type {FormEvent} from "react";
import "./App.css";
import { useLogin } from "./hooks/useLogin";

export type LoginProps = {
    onSuccess?: (username: string) => void;
};

const Login = ({ onSuccess }: LoginProps) => {
    const {
        username,
        password,
        setUsername,
        setPassword,
        login,
        canSubmit,
        isSubmitting,
        error,
    } = useLogin();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const credentials = await login();
        if (credentials && onSuccess) {
            onSuccess(credentials.username);
        }
    };

    return (
        <div className="app-shell">
            <div className="app-card login-card">
                <h1 className="app-title">Welcome back</h1>
                <p className="login-subtitle">Sign in to continue to the chat.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="login-label" htmlFor="username">
                        Username
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="jane.doe"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        disabled={isSubmitting}
                        required
                    />

                    <label className="login-label" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={isSubmitting}
                        required
                    />

                    {error ? <div className="login-error">{error}</div> : null}

                    <button type="submit" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
