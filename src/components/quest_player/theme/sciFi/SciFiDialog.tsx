import React from "react";
import {Choice} from "@/lib/ChoiceRepository.ts";

interface SciFiDialogProps {
    choices?: Choice[]
}

const SciFiDialog = ({choices}: SciFiDialogProps) => {
    if (!choices)
        return

    // console.log('SciFiDialog');

    return (
        <div className="dialog-frame flex items-start justify-between">
            <div className="dialog-content flex-1 mx-4">
                <ol className="list-decimal pl-10 options space-y-1 choice-text font-['Alegreya'] font-semibold text-lg">
                    {choices.map((choice) =>
                        <li key={`choice_id_${choice.id}`}>{choice.text}</li>
                    )}
                </ol>
            </div>
        </div>
    );
};

export default SciFiDialog;
