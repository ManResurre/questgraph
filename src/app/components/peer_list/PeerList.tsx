import {
    Box,
    Button, Checkbox,
    FormControl,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    TextField,
} from "@mui/material";
import {theme} from "@/theme";
import React from "react";
import SimplePeer from "simple-peer";
import {Participant, SupabaseDBProvider} from "@/lib/SupabaseDBProvider";
import {Controller, useForm} from "react-hook-form";
import MessageList from "@/app/components/peer_list/MessageList";

export interface PeerListProps {
    participants: Participant[],
    peers: Map<string, SimplePeer.Instance>,
    userId: string,
    messages?: { user_id: string; text: string; time: number }[],
    update?: React.Dispatch<React.SetStateAction<string>>,
    provider?: SupabaseDBProvider
}

export default function PeerList({participants, peers, userId, messages, update, provider}: PeerListProps) {

    const isConnected = (userId: string) => {
        const peer = peers.get(userId);
        return peer?.connected;
    }

    // const sendBroadcast = () => {
    //     peers.forEach((peer: any) => {
    //         if (!peer.connected) {
    //             return;
    //         }
    //         peer.send("Hello World");
    //         // console.log(peer);
    //     })
    // }

    const {handleSubmit, control, setValue} = useForm<any>({
        defaultValues: {
            message: "",
            selectedParticipants: []
        }
    });
    const onSubmit = ({message, selectedParticipants}: any) => {
        [...peers].map(([key, peer]) => {
            if (!selectedParticipants[key]) {
                return
            }

            console.log(key, peer.connected);

            provider?.destroyPeer(key);

            if (!provider)
                return;

            provider.createPeer(key, true).then((p) => {
                console.log(p);
            });

        })

        console.log(peers);

        // console.log(peers);
        // if (!message) {
        //     return;
        // }
        //
        // messages?.push({user_id: userId, text: message, time: Date.now()});
        // setValue("message", "");
        //
        // [...peers].filter(([key]) => {
        //     return selectedParticipants[key];
        // }).map(([, peer]) => {
        //     if (!peer.connected)
        //         return;
        //     peer.send(JSON.stringify({text: message, time: Date.now()}));
        //     if (update)
        //         update(String(Date.now()));
        // })
    }

    return <Paper>
        <Box p={1}>
            <Stack
                p={1}
                spacing={1}
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}>
                <List disablePadding>
                    {participants.map((item: any) =>
                        <ListItem key={item.id}
                                  secondaryAction={
                                      <Controller
                                          name={`selectedParticipants.${item.user_id}`}
                                          control={control}
                                          defaultValue={false}
                                          render={({field}) => (
                                              <Checkbox
                                                  {...field}
                                                  edge="end"
                                                  checked={field.value}
                                                  onChange={(e) => field.onChange(e.target.checked)}
                                              />
                                          )}
                                      />
                                  }
                        >
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


                <FormControl fullWidth>
                    <Controller
                        name={`message`}
                        control={control}
                        render={({field: {value, onChange}}) => (
                            <TextField
                                variant="standard"
                                value={value}
                                onChange={onChange}
                                placeholder={'Message'}
                                label={'Message'}
                                size="small"
                            />
                        )}
                    />
                </FormControl>
                <Button size="small"
                        variant="contained"
                        type="submit"
                        fullWidth
                >Connect</Button>
            </Stack>

            <Box>
                <MessageList messages={messages}
                             currentUserId={userId}
                />
            </Box>
        </Box>
    </Paper>

}
