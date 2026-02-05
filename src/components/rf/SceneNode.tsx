import React, {useCallback} from "react";
import {Position} from "@xyflow/system";
import {Divider, IconButton} from "@mui/material";
import {useSidebar} from "@/components/sidebar/graphSidebarProvider";
import {SettingsIcon} from "lucide-react";
import {SceneFullData} from "@/lib/SceneRepository";
import {NodeProps, XYPosition} from "@xyflow/react";
import {usePlayer} from "@/components/sidebar/PlayerProvider";
import FormatListBulletedAddIcon from '@mui/icons-material/FormatListBulletedAdd';
import {NodeResizeControl} from '@xyflow/react';
import CustomHandle from "@/components/rf/CustomHandle";
import PlayerText from "@/components/quest_player/PlayerText";
import "./style.scss";

export interface SceneNodeData extends Node {
    id: string;
    position: XYPosition;
    data: SceneFullData;
}

type SceneNodeProps = NodeProps<SceneNodeData>;

const SceneNode = ({data}: SceneNodeProps) => {
    const {openSidebar} = useSidebar();
    const {currentScene, setCurrentScene} = usePlayer();

    const handleEditNode = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        openSidebar({
            flags: {"editScene": true},
            elementData: {type: 'node', data}
        });
    }, [data])

    const handleEditParams = useCallback((e) => {
        e.stopPropagation();
        console.log('editSceneParams');
        openSidebar({
            flags: {"editSceneParams": true},
            elementData: {type: 'node', data}
        });
    }, [data])

    const handleClickCard = () => {
        console.log('handleClickCard');
        localStorage.setItem('selectedNode', String(data.id));
        setCurrentScene(data);
    }

    return <div
        className={currentScene?.id == data.id ? 'neon-scene' : ''}
        onClick={handleClickCard}
    >
        <div
            className="scene hover:ring-1 ring-gray-600 relative border bg-card text-card-foreground dark:bg-neutral-800 rounded-[2px]">
            <div className="flex flex-col gap-y-2 font-normal text-gray-700 dark:text-gray-400 cursor-auto">
                <CustomHandle id={`s${data.id}`}
                              type={'target'} position={Position.Left}/>
                <div className="drag-handle p-1 flex items-center cursor-grab">
                    {data.name}

                    <div className="flex ml-auto space-x-1">
                        <IconButton
                            sx={{minWidth: 'auto', height: 24, width: 24}}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={handleEditParams}
                            size="small"
                        >
                            <FormatListBulletedAddIcon sx={{fontSize: 16}}/>
                        </IconButton>

                        <IconButton
                            sx={{minWidth: 'auto', height: 24, width: 24}}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={handleEditNode}
                            size="small"
                        >
                            <SettingsIcon/>
                        </IconButton>
                    </div>
                </div>

                <div className="px-2">
                    <div
                        className="bg-neutral-900/50 dark:bg-neutral-700/30 border border-gray-300 dark:border-neutral-600 rounded-[4px] p-2 min-h-[60px]  overflow-y-auto
                    scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent">
                        <div
                            className="text-xs text-gray-600 dark:text-gray-300 font-sans whitespace-pre-wrap break-words leading-4">
                            {data.texts && <PlayerText text={data.texts.map(t => t.text).join('')}/>}
                        </div>
                    </div>
                </div>

                <Divider/>
                <ul className="p-2">
                    {data.choices && data.choices.map((choice) => {
                        return <li key={`SceneNode_s${data.id}_c${choice.id}_s${choice.nextSceneId}`}
                                   className="flex items-center rounded-[2px] bg-neutral-900 p-2 mb-1 last:mb-0">


                                        <span className="text-neutral-400 text-xs multiline-truncate">
                                            {choice.text}
                                        </span>


                            <CustomHandle id={`c${choice.id}_s${choice.nextSceneId ?? ''}`}
                                          type={'source'}
                                          connectionCount={1}
                                          style={{top: "auto"}}
                                          nextSceneId={choice.nextSceneId}
                                          position={Position.Right}/>
                        </li>
                    })}
                </ul>
            </div>
            <NodeResizeControl
                minWidth={300}
                minHeight={100}
            />
        </div>
    </div>
};

export default React.memo(SceneNode);
