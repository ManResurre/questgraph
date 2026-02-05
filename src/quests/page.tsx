import React from "react";
import {User} from "@supabase/supabase-js";
import {QuestList} from "@/components/quest_list/QuestList";
import {CircularProgress, Container} from "@mui/material";
import {QuestEditForm} from "@/components/quest_list/QuestEditForm";
import {useQuests} from "@/components/quest/QuestContext";
import {useCurrentUser} from "@/hooks/useCurrentUser";

const QuestsPage = () => {
    const {user} = useCurrentUser();

    const {isLoading} = useQuests();

    return <Container>
        <QuestEditForm user={user as User}/>
        {isLoading ?
            <CircularProgress size={24} color="inherit"/> :
            <QuestList user={user}/>}
    </Container>
}

export default React.memo(QuestsPage);
