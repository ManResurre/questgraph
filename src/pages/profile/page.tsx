import React, {useRef} from "react";
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    IconButton,
    Button,
    Divider,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import {useLocalUser} from "@/hooks/useLocalUser";
import {useAlert} from "@/contexts/AlertContext";
import {db, User as DbUser} from "@/lib/db";
import supabase from "@/supabaseClient";

const Profile = () => {
    const {localUser, loading} = useLocalUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {showAlert} = useAlert();

    const handleCopy = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showAlert("success", `${label} copied to clipboard`);
        } catch (err) {
            console.error("Failed to copy:", err);
            showAlert("error", `Failed to copy ${label}`);
        }
    };

    const handleExport = () => {
        if (!localUser) return;

        const exportData = {
            name: localUser.name,
            publicKey: localUser.publicKey,
            privateKey: localUser.privateKey,
            auth_id: localUser.auth_id,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `questgraph-keys-${localUser.name || "user"}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text) as DbUser;

            if (!data.publicKey || !data.privateKey) {
                showAlert("error", "Invalid file format: missing keys");
                return;
            }

            // Clear table and add imported user
            await db.user.clear();
            await db.user.add({
                name: data.name,
                publicKey: data.publicKey,
                privateKey: data.privateKey,
                auth_id: data.auth_id,
            });

            // Logout from current session
            await supabase.auth.signOut();

            showAlert("success", "Keys imported successfully!");
        } catch (err) {
            console.error("Import error:", err);
            showAlert("error", "Error importing keys. Check the file format.");
        }

        // Reset input value to allow uploading the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (loading) {
        return <Container>Loading...</Container>;
    }

    if (!localUser) {
        return (
            <Container>
                <Typography>User not found</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{mt: 4}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Profile
            </Typography>

            <Paper sx={{p: 3, mt: 2}}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6">Authentication Keys</Typography>
                    <Box sx={{display: "flex", gap: 1}}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImport}
                            accept=".json"
                            style={{display: "none"}}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon/>}
                            onClick={() => fileInputRef.current?.click()}
                            size="small"
                        >
                            Import
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon/>}
                            onClick={handleExport}
                            size="small"
                        >
                            Export
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{mb: 2}}/>

                <Box sx={{mt: 2}}>
                    <TextField
                        label="Name"
                        value={localUser.name || "—"}
                        fullWidth
                        margin="normal"
                        slotProps={{input: {readOnly: true}}}
                    />

                    <TextField
                        label="Public Key"
                        value={localUser.publicKey}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        slotProps={{
                            input: {
                                readOnly: true,
                                endAdornment: (
                                    <IconButton
                                        onClick={() =>
                                            handleCopy(localUser.publicKey, "Public Key")
                                        }
                                        size="small"
                                    >
                                        <ContentCopyIcon fontSize="small"/>
                                    </IconButton>
                                ),
                            },
                        }}
                    />

                    <TextField
                        label="Private Key"
                        value={localUser.privateKey}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        slotProps={{
                            input: {
                                readOnly: true,
                                endAdornment: (
                                    <IconButton
                                        onClick={() =>
                                            handleCopy(localUser.privateKey, "Private Key")
                                        }
                                        size="small"
                                    >
                                        <ContentCopyIcon fontSize="small"/>
                                    </IconButton>
                                ),
                            },
                        }}
                    />

                    {localUser.auth_id && (
                        <TextField
                            label="Auth ID"
                            value={localUser.auth_id}
                            fullWidth
                            margin="normal"
                            slotProps={{input: {readOnly: true}}}
                        />
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default Profile;
