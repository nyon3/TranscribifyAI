'use client';

import React, { createContext, useState, ReactNode } from 'react';

interface FileContextType {
    state: string;
    text: string;
    setText: (text: string) => void;
    setState: React.Dispatch<React.SetStateAction<string>>;
    setLoading: (isLoading: boolean) => void; // Updating the type to void
    isLoading: boolean; // Removed comma, changed type to boolean
}

// Create the context with a default value
export const FileContext = createContext<FileContextType>({
    state: '', // Provide a default state value
    text: '', // Provide a default text value
    setText: () => { }, // Provide a default setText function
    setState: () => { }, // Provide a default setState function
    setLoading: () => { }, // Provide a default setLoading function
    isLoading: false, // Provide a default isLoading value
});

// Create a provider component
const FileIdContextProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState('');
    const [text, setText] = useState('');
    const [isLoading, setLoading] = useState(false); // Maintain the loading state

    // Provide the context with value containing all state and state updater functions
    return (
        <FileContext.Provider value={{ state, setState, text, setText, setLoading, isLoading }}>
            {children}
        </FileContext.Provider>
    );
};

export default FileIdContextProvider;