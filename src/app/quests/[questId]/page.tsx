'use client';
import {Box, Divider, Grid, Typography} from "@mui/material";
import SceneList from "@/app/components/scene_list/SceneList";
import ParamsList from "@/app/components/params_list/ParamsList";
import {db} from "@/lib/db";
import {useLiveQuery} from "dexie-react-hooks";
import {useParams} from "next/navigation";


export default function QuestPage() {
    const {questId} = useParams();
    const quest = useLiveQuery(() => db.quests.get(Number(questId)));

    const scenes = useLiveQuery(() => db.scenes.where('questId').equals(Number(questId)).toArray());
    const questParams: any = [];

    if (!quest) {
        return <Typography>Quest not found :(</Typography>
    }

    return <Box mt={1}>
        <Typography>{quest?.name}</Typography>
        <Divider/>
        <Grid container spacing={1} mt={1}>
            <Grid size={6}>
                {scenes && <SceneList scenes={scenes}/>}
            </Grid>
            <Grid size={6}>
                <ParamsList questParams={questParams}></ParamsList>
            </Grid>
        </Grid>
    </Box>
}


