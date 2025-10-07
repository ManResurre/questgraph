import {useCallback, useRef, useState} from "react";
import {createFromFile} from "@/lib/SceneRepository";

const useFileLoader = () => {
    const [fileContent, setFileContent] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const isValidFileType = useCallback((file: File): boolean => {
        const allowedTypes = ['text/plain'];
        const allowedExtensions = ['.txt'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        return allowedTypes.includes(file.type) ||
            allowedExtensions.includes(fileExtension);
    }, []);

    const cleanup = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.remove();
            inputRef.current = null;
        }
    }, []);

    const handleChange = useCallback(async (e: Event, questId: number) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
            cleanup();
            return;
        }

        setFileContent('');
        setError('');
        setIsLoading(true);

        // Валидация файла
        if (!isValidFileType(file)) {
            setError('Please select a text file (.txt)');
            setIsLoading(false);
            cleanup();
            return;
        }


        try {
            const content = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (event) => {
                    resolve(event.target?.result as string);
                };

                reader.onerror = () => {
                    reject(new Error('Error reading file'));
                };

                reader.readAsText(file);
            });

            setFileContent(content);
            await createFromFile(content, questId);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
            cleanup();
        }
    }, [])

    const loadFile = (questId: number) => {
        cleanup();

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,text/plain';
        input.style.display = 'none';

        input.onchange = (e: Event) => handleChange(e, questId);
        input.oncancel = () => cleanup();

        document.body.appendChild(input);
        inputRef.current = input;
        input.click();
    };

    return {
        fileContent,
        error,
        isLoading,
        loadFile,
    };
};

export default useFileLoader;
