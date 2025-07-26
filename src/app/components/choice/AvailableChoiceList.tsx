import {Choice, Scene} from "@/lib/db";
import React, {useCallback, useRef, useState, useTransition} from "react";
import {
    Box,
    TextField,
    CircularProgress,
} from "@mui/material";
import {Virtuoso, VirtuosoHandle} from 'react-virtuoso';
import ChoiceItemAccordion from "@/app/components/choice/ChoiceItemAccordion";

export interface AvailableChoiceListParams {
    scenes: Scene[];
    choices: Choice[];
}

const AvailableChoiceList = ({scenes, choices}: AvailableChoiceListParams) => {
    const [searchTerm, setSearchTerm] = useState("");
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [isPending, startTransition] = useTransition();
    const [selectedChoice, setSelectedChoice] = useState(Number(localStorage.getItem('selected_choice')) || 1);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);

        if (!term) return;

        // Поиск индекса элемента по тексту
        const index = choices.findIndex(
            (choice: Choice) =>
                choice.label.toLowerCase().includes(term.toLowerCase()) ||
                choice.text.toLowerCase().includes(term.toLowerCase())
        );

        if (index !== -1 && virtuosoRef.current) {
            // Прокрутка к элементу
            virtuosoRef.current.scrollToIndex({
                index,
                align: "start",
                behavior: "smooth"
            });
        }
    }, [choices]);

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);

        // Откладываем операцию поиска как неблокирующую
        startTransition(() => {
            handleSearch(term);
        });
    };

    const handleExpansion = (id: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        if (isExpanded) {
            setSelectedChoice(id);
            localStorage.setItem('selected_choice', String(id));
        }
    };


    return <Box height="100%">
        <TextField
            label="Search choices"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            sx={{mb: 2}}
        />
        {isPending && <CircularProgress size={20}/>}
        <Box height="100vh">
            <Virtuoso
                ref={virtuosoRef}
                style={{
                    height: '100%',
                    scrollbarWidth: 'none'
                }}
                className="hide-scrollbar"
                data={choices}
                itemContent={(index: number, choice: Choice) => (
                    <ChoiceItemAccordion
                        choice={choice}
                        scenes={scenes}
                        highlight={searchTerm}
                        selected={selectedChoice}
                        onExpansion={handleExpansion}/>
                )}
            />
        </Box>
    </Box>
}

export default React.memo(AvailableChoiceList);
