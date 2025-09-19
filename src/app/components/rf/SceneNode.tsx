import React, {type HTMLAttributes, memo} from "react";
import {BaseNode, BaseNodeContent} from "@/components/base-node";
import {Position} from "@xyflow/system";
import {Box, Divider, IconButton, Paper} from "@mui/material";
import {Choice, db} from "@/lib/db";
import "./style.scss";
import {useLiveQuery} from "dexie-react-hooks";
import {Handle, HandleType, useNodeConnections, useNodeId, useUpdateNodeInternals} from '@xyflow/react';
import type {HandleProps as HandlePropsSystem} from "@xyflow/system/dist/esm/types/handles";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import {SettingsIcon} from "lucide-react";

export type SceneNodeData = {
    data: {
        id: string;
        label: string;
        choices: Choice[];
    }
};

const CustomHandle = (props: {
    connectionCount?: number,
    nextSceneId?: number,
    type: HandleType
} & HandlePropsSystem & Omit<HTMLAttributes<HTMLDivElement>, "id">) => {
    const {connectionCount, type, id, nextSceneId, ...restProps} = props;

    const connections = useNodeConnections();

    // console.log(connections);

    const isConnectable = !nextSceneId;
    // && connectionCount && connections
    // .filter((c) => c.sourceHandle == id).length < connectionCount

    return (
        <Handle
            {...restProps}
            id={id}
            type={type}
            isConnectable={isConnectable}
        />
    );
}

const SceneNode = memo(({data}: SceneNodeData) => {
            const {openSidebar} = useSidebar();

            const handleClick = () => {
                openSidebar(data.id, {type: 'node', data});
            }
            return (
                <div
                    className="max-w-60 hover:ring-1 ring-gray-600 relative border bg-card text-card-foreground dark:bg-neutral-800 rounded-[2px]">
                    <div className="flex flex-col gap-y-2 font-normal text-gray-700 dark:text-gray-400">
                        <CustomHandle id={`s${data.id}`}
                                      type={'target'} position={Position.Left}/>
                        <div className="p-1 flex justify-between">
                            {data.label}
                            <IconButton sx={{
                                minWidth: 'auto',
                                height: 24,
                                width: 24
                            }} onClick={() => handleClick()} size="small">
                                <SettingsIcon/>
                            </IconButton>
                        </div>

                        <Divider/>
                        <ul className="p-2">
                            {data.choices.map((choice) => {
                                return <li key={`SceneNode_s${data.id}_c${choice.id}_s${choice.nextSceneId}`}
                                           className="flex items-center rounded-[2px] bg-neutral-900 p-2 mb-1 last:mb-0">


                                        <span className="text-neutral-400 text-xs multiline-truncate">
                                            {choice.text}
                                        </span>


                                    <CustomHandle id={`c${choice.id}_s${choice.nextSceneId}`}
                                                  type={'source'}
                                                  connectionCount={1}
                                                  nextSceneId={choice.nextSceneId}
                                                  position={Position.Right}/>
                                </li>
                            })}
                        </ul>
                    </div>
                </div>

            );
        }
    )
;

export default SceneNode;