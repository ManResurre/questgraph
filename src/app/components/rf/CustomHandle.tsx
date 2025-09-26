import {Handle, HandleProps, HandleType} from "@xyflow/react";
import React, {HTMLAttributes} from "react";

const CustomHandle = (props: {
    connectionCount?: number,
    nextSceneId?: number,
    type: HandleType
} & HandleProps & Omit<HTMLAttributes<HTMLDivElement>, "id">) => {
    const {connectionCount, type, id, nextSceneId, ...restProps} = props;

    // const connections = useNodeConnections();

    const isConnectable = !nextSceneId;

    return (
        <Handle
            {...restProps}
            id={id}
            type={type}
            isConnectable={isConnectable}
        />
    );
}

export default React.memo(CustomHandle);
