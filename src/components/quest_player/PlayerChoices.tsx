import React from "react";
import ChoiceButton from "@/components/choice/ChoiceButton.tsx";
import {Choice} from "@/lib/ChoiceRepository.ts";

interface PlayerChoicesProps {
    index: number;
    choice: Choice;
}

const PlayerChoices = ({index, choice}: PlayerChoicesProps) => {
    return <li
        style={{
            display: 'flex',
            alignItems: 'flex-start',
            margin: '8px',
            textAlign: 'left'
        }}
    >
                                <span style={{
                                    marginRight: '12px',
                                    flexShrink: 0,
                                    color: '#e0e0e0',
                                    fontSize: '1.1rem',
                                    lineHeight: '52px' // Выравниваем по высоте кнопки
                                }}>
                                    {index + 1}.
                                </span>
        <ChoiceButton choice={choice}/>
    </li>;
};

export default React.memo(PlayerChoices);
