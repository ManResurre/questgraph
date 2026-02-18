import React from "react";
import "./dialog.scss";
import {Choice} from "@/lib/ChoiceRepository.ts";

interface PathfinderDialogProps {
    choices?: Choice[]
}

const PathfinderDialog = ({choices}: PathfinderDialogProps) => {
    if (!choices)
        return

    return (
        <div className="dialog-frame flex items-start justify-between">
            {/*<div className="portrait-frame left">*/}
            {/*    <img src="/p1.png" alt=""/>*/}
            {/*    <div className="dialog-name">*/}
            {/*        Мерсия*/}
            {/*    </div>*/}
            {/*</div>*/}

            <div className="dialog-content flex-1 mx-4">
                {/*<div className="dialog-text mb-4 font-['Alegreya'] font-semibold text-lg">*/}
                {/*    <span className="speaker">Аневия:</span> «С другой стороны, тела бедняг‑караванщиков, которых рой до*/}
                {/*    нас подстерег, я как раз в отнорках*/}
                {/*    видела, и на них наверняка полно ценного шматья. Всё, что вы не соберёте, гнусы схомячат — им что*/}
                {/*    плоть, что ткань, что металл, всё едино».*/}
                {/*</div>*/}
                <ol className="list-decimal pl-10 options space-y-1 choice-text font-['Alegreya'] font-semibold text-lg">
                    {choices.map((choice) =>
                        <li key={`choice_id_${choice.id}`}>{choice.text}</li>
                    )}
                </ol>
            </div>

            {/*<div className="portrait-frame right">*/}
            {/*    <img src="/p2.png" alt=""/>*/}
            {/*    <div className="dialog-name">*/}
            {/*        Аневия*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>

    );
};

export default PathfinderDialog;
