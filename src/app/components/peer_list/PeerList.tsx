import {Box, List, ListItem, ListItemText, Paper, Typography} from "@mui/material";
import {theme} from "@/theme";
import React from "react";
import SimplePeer from "simple-peer";
import {Participant} from "@/lib/SupabaseDBProvider";

export interface PeerListProps {
    participants: Participant[];
    peers: Map<string, SimplePeer.Instance>;
    userId: string;
}

export default function PeerList({participants, peers, userId}: PeerListProps) {

    const isConnected = (userId: string) => {
        const peer = peers.get(userId);
        return peer?.connected;
    }

    return <Paper>
        <Box p={1}>
            <Typography component="h1">UserId: {userId}</Typography>
            <List disablePadding>
                {participants.map((item: any) =>
                    <ListItem key={item.id}>
                        <ListItemText
                            slotProps={{
                                primary: {
                                    sx: {color: item.user_id == userId ? 'red' : (isConnected(item.user_id)) ? 'green' : theme.palette.text.primary}
                                },
                            }}
                        >{item.user_id}</ListItemText>
                    </ListItem>
                )}
            </List>
        </Box>
    </Paper>

}