import React from "react";
import {usePlayer} from "@/app/components/sidebar/PlayerProvider";
import {Card, CardContent, Stack} from "@mui/material";
import ChoiceButton from "@/app/components/choice/ChoiceButton";
import PlayerText from "@/app/components/quest_player/PlayerText";

const Player = () => {
    const {currentScene} = usePlayer();

    return <>
        <Stack spacing={0}>
            {currentScene?.texts &&
                <div className="p-3 bg-neutral-900/50 dark:bg-neutral-700/30 border border-gray-500 dark:border-neutral-600 rounded-[4px] min-h-[250px] max-h-[vh] overflow-y-auto
                    scrollbar-thin scrollbar-thumb-neutral-800/70 scrollbar-track-transparent">
                    <div
                        className="text-lg text-gray-300 font-sans whitespace-pre-wrap break-words leading-5">
                        {currentScene.texts.map((t) => {
                            return <div key={t.id}><PlayerText text={t.text} /></div>
                        })}
                    </div>
                </div>
            }
            {currentScene?.choices && <Card>
                <CardContent sx={{padding: '16px 0'}}>
                    <ol style={{
                        // listStyle: 'decimal',
                        // listStylePosition: 'inside',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        // counterReset: 'list-counter'
                    }}>
                        {currentScene.choices.map((ch, index) => {
                            return <li
                                key={`scene.choice.${index}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    margin:'8px',
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
                                <ChoiceButton choice={ch}/>
                            </li>
                        })}
                    </ol>
                </CardContent>
            </Card>}
        </Stack>
    </>
}

export default React.memo(Player);
