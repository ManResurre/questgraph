import {Box, Divider, Grid, Typography} from "@mui/material";
import SceneList from "@/app/components/scene_list/SceneList";
import {DatabaseService} from "@/lib/DatabaseService";
import {Quest} from "@/entity";
import ParamsList from "@/app/components/params_list/ParamsList";

// type PlainObject<T> = {
//     [K in keyof T]: T[K] extends PlainObject<T[K]>;
// };

interface EntityWithId {
    id: number | string;
}

function serializeEntities<T extends EntityWithId>(entities: any) {
    const serialized = JSON.parse(JSON.stringify(entities));
    return serialized.sort((a: T, b: T) => Number(a.id) - Number(b.id));
}

export default async function QuestPage({params}: { params: { questId: string } }) {
    await DatabaseService.getInstance();
    const {questId} = await params;
    const quest = await Quest.findOneBy({id: Number(questId)});

    if (!quest) {
        return <Typography>Quest not found :(</Typography>
    }

    return <Box mt={1}>
        <Typography>{quest?.name}</Typography>
        <Divider/>
        <Grid container spacing={1} mt={1}>
            <Grid size={6}>
                <SceneList scenes={serializeEntities(quest.scenes)}/>
            </Grid>
            <Grid size={6}>
                <ParamsList questParams={serializeEntities(quest.params)}></ParamsList>
            </Grid>
        </Grid>
    </Box>
}


