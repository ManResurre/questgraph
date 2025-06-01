import {createTheme} from "@mui/material";

export const theme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
        MuiButton: {
            variants: [
                {
                    props: {variant: 'contained', color: 'primary'},
                    style: {
                        backgroundColor: "#7FA1B4"
                    }
                }
            ],
            styleOverrides: {
            }
        },
        MuiListSubheader: {
            styleOverrides: {
                root: {
                    backgroundColor: "#50505a"
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#212327"
                }
            }
        },
        MuiPaper: {
            variants: [
                {
                    props: {variant: 'outlined'},
                    style: {
                        backgroundColor:"#212327"
                    }
                }
            ],
            styleOverrides: {
                root: {}
            }
        },
        MuiCard: {
            variants: [
                {
                    props: {variant: 'outlined', color: 'primary'},
                    style: {
                        // backgroundColor: "#7FA1B4"
                    }
                }
            ],
            styleOverrides: {
                root: {
                    backgroundColor: "#181d28"
                }
            }
        }
    }
});
