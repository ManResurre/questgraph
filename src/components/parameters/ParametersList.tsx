import React, {useMemo, useRef, useState, useTransition} from "react";
import {Box, CircularProgress, Paper, TextField} from "@mui/material";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import ParameterItem from "@/components/parameters/ParameterItem";
import {useParameters} from "@/components/parameters/ParametersProvider";
import {Parameter} from "@/lib/ParametersRepository.ts";

const ParametersList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [isPending, startTransition] = useTransition();
    const {parameters} = useParameters();

    const filteredParameters = useMemo(() => {
        if (!parameters) return [];
        if (!searchTerm) return parameters;
        const term = searchTerm.toLowerCase();
        return parameters.filter(
            (p: Parameter) =>
                (p.label ?? "").toLowerCase().includes(term) ||
                (p.key ?? "").toLowerCase().includes(term) ||
                (p.value ?? "").toLowerCase().includes(term)
        );
    }, [parameters, searchTerm]);

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        startTransition(() => {
            if (!parameters || !parameters.length) return;
            const index = parameters.findIndex(
                (p: Parameter) =>
                    (p.label ?? "").toLowerCase().includes(term.toLowerCase()) ||
                    (p.key ?? "").toLowerCase().includes(term.toLowerCase()) ||
                    (p.value ?? "").toLowerCase().includes(term.toLowerCase())
            );
            if (index !== -1 && virtuosoRef.current) {
                virtuosoRef.current.scrollToIndex({index, align: "start", behavior: "smooth"});
            }
        });
    };

    return (
        <div>
            <TextField
                label="Search parameters"
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                sx={{mb: 2}}
            />
            <Paper>
                <Box height="35vh">
                    {isPending && <CircularProgress size={20}/>}
                    <Virtuoso
                        ref={virtuosoRef}
                        style={{
                            height: "100%",
                            scrollbarWidth: "none"
                        }}
                        className="hide-scrollbar"
                        data={filteredParameters}
                        itemContent={(index: number, parameter: Parameter) => (
                            <ParameterItem parameter={parameter}/>
                        )}
                    />
                </Box>
            </Paper>
        </div>
    );
};

export default React.memo(ParametersList);
