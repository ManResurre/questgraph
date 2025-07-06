'use client'
import React from "react";
import {Card, Divider, List, ListItemButton, ListItemText} from "@mui/material";
import Link from "next/link";
import {useParams} from "next/navigation";

export default function ParamsList({questParams}: { questParams?: any }) {
    const {questId} = useParams();

    return <Card>
        <List disablePadding>
            <ListItemButton href={`./${questId}/new_param`} component={Link}>
                <ListItemText sx={{textAlign: "center"}} primary="Add Parameter"/>
            </ListItemButton>
            <Divider/>
            {questParams?.map((param: any) =>
                <ListItemButton key={`${param.key}_${param.id}`}>
                    <ListItemText primary={param.label}/>
                </ListItemButton>
            )}
        </List>
    </Card>
}
