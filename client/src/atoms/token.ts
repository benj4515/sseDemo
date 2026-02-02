import { atomWithStorage, createJSONStorage } from "jotai/utils";


// Storage key for JWT
export const TOKEN_KEY = "token";
export const tokenStorage = createJSONStorage<string | null>(
    () => sessionStorage,
);

export const tokenAtom = atomWithStorage<string | null>(
    TOKEN_KEY,
    null,
    tokenStorage,
);

