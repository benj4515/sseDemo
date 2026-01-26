import {useState} from "react";


export const getUserName = () => {
    const storedName = sessionStorage.getItem("userName");
    return storedName;
}
export const setUserName = () => {
    const [username, setUsername] = useState<string | null>(null);

    sessionStorage.setItem("userName", username || "");

    return [username, setUsername] as const;
}