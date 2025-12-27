import React, {useCallback, useMemo, useRef, useState, useTransition} from "react";
import AvailableChoiceList from "@/app/components/choice/AvailableChoiceList";
import {Box, CircularProgress, TextField} from "@mui/material";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import {Choice} from "@/lib/db";
import ChoiceItemAccordion from "@/app/components/choice/ChoiceItemAccordion";
import {useLiveQuery} from "dexie-react-hooks";
import {getChoices} from "@/lib/ChoiceRepository";
import {useParams} from "next/navigation";
import ChoiceItem from "@/app/components/choice/ChoiceItem";
import {useChoices} from "@/app/hooks/choice";
import {useQueryClient} from "@tanstack/react-query";

const ChoiceList = () => {
    const {questId} = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [isPending, startTransition] = useTransition();
    const {data: choices} = useChoices(Number(questId));

    const filteredChoices = useMemo(() => {
        if (!choices) return [];
        if (!searchTerm) return choices;
        const term = searchTerm.toLowerCase();
        return choices
            .filter(
                (choice: Choice) =>
                    choice.label.toLowerCase().includes(term) ||
                    choice.text.toLowerCase().includes(term)
            )
            .sort((a: Choice, b: Choice) => {
                const aLabel = a.label.toLowerCase();
                const aText = a.text.toLowerCase();
                const bLabel = b.label.toLowerCase();
                const bText = b.text.toLowerCase();
                const aExact = aLabel === term || aText === term ? 1 : 0;
                const bExact = bLabel === term || bText === term ? 1 : 0;
                // сначала те, где полное совпадение
                return bExact - aExact;
            });
    }, [choices, searchTerm]);

    const handleSearch = useCallback((term: string) => {
        if (!choices || !choices.length) {
            return;
        }
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

    return <div>
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
        <Box height="75vh">
            <Virtuoso
                ref={virtuosoRef}
                style={{
                    height: '100%',
                    scrollbarWidth: 'none'
                }}
                className="hide-scrollbar"
                data={filteredChoices}
                itemContent={(index: number, choice: Choice) =>
                    <ChoiceItem highlight={searchTerm} choice={choice}/>
                }
            />
        </Box>
    </div>
}

export default React.memo(ChoiceList);
