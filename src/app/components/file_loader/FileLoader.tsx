import React, {useState, useRef, useEffect} from 'react';
import {
    Button,
    Box,
    Typography,
    TextField,
    Paper,
    CircularProgress,
    IconButton,
    Alert
} from '@mui/material';
import {Upload as UploadIcon, Close as CloseIcon} from '@mui/icons-material';
import {db} from "@/lib/db";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";
import {useParams} from "next/navigation";


const FileLoader = () => {
    const {questId} = useParams();
    const {service} = useSceneContext();

    const [fileContent, setFileContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<any>(null);

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        // Сброс предыдущих значений
        setFileName('');
        setFileContent('');
        setError('');
        setIsLoading(true);

        // Проверка типа файла
        if (!file.type.includes('text/') && !file.name.endsWith('.txt')) {
            setError('Пожалуйста, выберите текстовый файл (.txt)');
            setIsLoading(false);
            return;
        }

        setFileName(file.name);

        const reader = new FileReader();

        reader.onload = (event: any) => {
            setFileContent(event.target.result);
            setIsLoading(false);
        };

        reader.onerror = () => {
            setError('Ошибка при чтении файла');
            setIsLoading(false);
        };

        reader.readAsText(file);
    };

    const handleButtonClick = () => {
        if (fileInputRef.current)
            fileInputRef.current.click();
    };

    const handleClear = () => {
        setFileName('');
        setFileContent('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (!fileContent)
            return;


        service?.createFromFile(fileContent, Number(questId!))
// db.scene_texts.put()
//         console.log(parsed);
    }, [fileContent])

    return (
        <Box sx={{maxWidth: 800, mx: 'auto', p: 3}}>
            <Typography variant="h5" gutterBottom>
                Загрузка текстового файла
            </Typography>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,text/plain"
                style={{display: 'none'}}
            />

            <Box sx={{display: 'flex', gap: 2, mb: 3}}>
                <Button
                    size={"small"}
                    variant="contained"
                    color="primary"
                    startIcon={<UploadIcon/>}
                    onClick={handleButtonClick}
                    disabled={isLoading}
                >
                    Выбрать файл
                </Button>

                <Button
                    size={"small"}
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon/>}
                    onClick={handleClear}
                    disabled={!fileName || isLoading}
                >
                    Очистить
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            )}

            {isLoading && (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                    <CircularProgress/>
                </Box>
            )}

            {fileName && !isLoading && (
                <Paper elevation={3} sx={{p: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <Typography variant="subtitle1">
                            Загружен файл: <strong>{fileName}</strong>
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleClear}
                            sx={{ml: 'auto'}}
                        >
                            <CloseIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default FileLoader;