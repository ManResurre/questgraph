import React from "react";
import {useParams} from "@tanstack/react-router";
import {questIdRoute} from "@/routes/quests";
import {CustomEdgeType} from "@/pages/quests/id/constants/graph.ts";

interface ParameterChoiceEditProps {
    data: CustomEdgeType;
}

const EdgeEdit = ({data}: ParameterChoiceEditProps) => {
    const choiceId = parseInt(data.source);
    const {id: questId} = useParams({from: questIdRoute.id});


    return <>
        {/*Список доступных параметров*/}
        {/*Возможность добавления параметров к текущему Choice*/}
        {/*форма редактирования value из таблицы parameter_choice*/}
    </>
};

export default React.memo(EdgeEdit);
