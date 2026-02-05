import React, {useCallback, useMemo, useRef, useState, useTransition} from "react";
import {Box, CircularProgress, Paper, TextField} from "@mui/material";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import ChoiceItem from "@/components/choice/ChoiceItem";
import {useChoices} from "@/hooks/choice";
import {Database} from "@/supabase";
import {useParams} from "@tanstack/react-router";
import {questIdRoute} from "@/routes/quests";

type Choice = Database["public"]["Tables"]["choice"]["Row"];

function ChoiceList() {
    const {id: questId} = useParams({from: questIdRoute.id});
    const [searchTerm, setSearchTerm] = useState<string>("");
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [isPending, startTransition] = useTransition();
    const {data: choices} = useChoices(Number(questId));

    const filteredChoices: Choice[] = useMemo(() => {
        if (!choices) return [];
        if (!searchTerm) return choices;
        const term = searchTerm.toLowerCase();
        return choices
            .filter(
                (choice: Choice) =>
                    (choice.label ?? "").toLowerCase().includes(term) ||
                    (choice.text ?? "").toLowerCase().includes(term)
            )
            .sort((a: Choice, b: Choice) => {
                const aLabel = (a.label ?? "").toLowerCase();
                const aText = (a.text ?? "").toLowerCase();
                const bLabel = (b.label ?? "").toLowerCase();
                const bText = (b.text ?? "").toLowerCase();
                const aExact = aLabel === term || aText === term ? 1 : 0;
                const bExact = bLabel === term || bText === term ? 1 : 0;
                return bExact - aExact;
            });
    }, [choices, searchTerm]);

    const handleSearch = useCallback(
        (term: string) => {
            if (!choices || !choices.length) return;
            setSearchTerm(term);

            if (!term) return;

            const index = choices.findIndex(
                (choice: Choice) =>
                    (choice.label ?? "").toLowerCase().includes(term.toLowerCase()) ||
                    (choice.text ?? "").toLowerCase().includes(term.toLowerCase())
            );

            if (index !== -1 && virtuosoRef.current) {
                virtuosoRef.current.scrollToIndex({
                    index,
                    align: "start",
                    behavior: "smooth",
                });
            }
        },
        [choices]
    );

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        startTransition(() => {
            handleSearch(term);
        });
    };

    return (
        <div>
            <TextField
                label="Search choices"
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                sx={{mb: 2}}
            />

            <Paper>
                <Box height="70vh">
                    {isPending && <CircularProgress size={20}/>}
                    <Virtuoso<Choice>
                        ref={virtuosoRef}
                        style={{height: "100%", scrollbarWidth: "none"}}
                        className="hide-scrollbar"
                        data={filteredChoices}
                        itemContent={(index: number, choice: Choice) => (
                            <ChoiceItem highlight={searchTerm} choice={choice}/>
                        )}
                    />
                </Box>
            </Paper>
        </div>
    );
}

export default React.memo(ChoiceList);
