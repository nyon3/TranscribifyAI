'use client'

import React, { createContext, useState, ReactNode } from 'react';

interface FileContextType {
    state: string;
    text: string | null;
    setText: (text: string) => void;
    setState: React.Dispatch<React.SetStateAction<string>>;
}

// Create the context with a default value
export const FileContext = createContext<FileContextType>({
    state: '', // Provide a default state value
    text: null,
    setText: () => { },
    setState: () => { }, // Provide a default setState function
});

// Create a provider component
const FileIdContextProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState('');
    const [text, setText] = useState<string | null>(null);

    return (
        <FileContext.Provider value={{ state, setState, text, setText }}>
            {children}
        </FileContext.Provider>
    );
};

export default FileIdContextProvider;