import React from "react";
import { Choice } from "@/lib/ChoiceRepository.ts";
import styles from "./dialog.module.scss";

interface SciFiDialogProps {
  choices?: Choice[];
}

const SciFiDialog = ({ choices }: SciFiDialogProps) => {
  if (!choices) return;

  // console.log('SciFiDialog');

  return (
    <div
      className={`${styles["dialog-frame"]} flex items-start justify-between py-4 pb-10`}
    >
      <div className="dialog-content flex-1 mx-4">
        <ol
          className={`${styles["choice-text"]} list-decimal pl-10 options space-y-1 font-['Alegreya'] font-semibold text-lg`}
        >
          {choices.map((choice) => (
            <li key={`choice_id_${choice.id}`}>{choice.text}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default SciFiDialog;
