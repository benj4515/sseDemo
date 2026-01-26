import {useEffect, useState} from "react";

export const getUserName = () => sessionStorage.getItem("userName");

export const useUserName = () => {
    const [username, setUsername] = useState<string | null>(() => {
        const storedName = sessionStorage.getItem("userName");
        return storedName && storedName.trim().length > 0 ? storedName : null;
    });

    useEffect(() => {
        if (username && username.trim().length > 0) {
            sessionStorage.setItem("userName", username.trim());
        } else {
            sessionStorage.removeItem("userName");
        }
    }, [username]);

    return { username, setUsername } as const;
};