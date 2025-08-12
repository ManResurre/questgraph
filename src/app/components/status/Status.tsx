import React from "react";
import {useLiveQuery} from "dexie-react-hooks";
import {db, Param} from "@/lib/db";
import {ListItem, List, Divider, Box, Typography} from "@mui/material";
import Stack from "@mui/material/Stack";
import KeyIcon from "@mui/icons-material/Key";

interface StatusParams {
    questId: number;
}

const Status = ({questId}: StatusParams) => {

    const params = useLiveQuery(async () => {
        // await db.params.where('questId').equals(questId).modify({hide: true})
        return db.params.where('questId').equals(questId).toArray();
    });

    return <List>
        {params && params
            .filter((p) => !p.hide)
            .map((param: Param) =>
                <ListItem key={param.id}>
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        divider={<Divider orientation="vertical" flexItem/>}
                    >
                        <Typography variant="body1" sx={{flexGrow: 1}}>
                            {param.label}
                        </Typography>

                        <Typography variant="h6" color="primary">
                            {param.value}
                        </Typography>
                    </Stack>
                </ListItem>
            )}
    </List>
}

export default React.memo(Status);
