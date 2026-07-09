import { createTheme, alpha } from "@mui/material/styles";

export const COLORS = {
    paper: "#F1EFEA",
    ink: "#1C1B19",
    pink: "#FF3E8E",
    blue: "#0078BF",
    yellow: "#FFD400",
};

const MONO = '"Space Mono", "Courier New", monospace';
const BODY = '"IBM Plex Sans", Arial, sans-serif';

export const theme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: COLORS.paper,
            paper: COLORS.paper,
        },
        text: {
            primary: COLORS.ink,
            secondary: COLORS.ink,
        },
        primary: {
            main: COLORS.pink,
            contrastText: COLORS.paper,
        },
        secondary: {
            main: COLORS.blue,
            contrastText: COLORS.paper,
        },
        divider: COLORS.ink,
        action: {
            disabledBackground: "transparent",
            disabled: alpha(COLORS.ink, 0.35),
        },
    },
    shape: {
        borderRadius: 0,
    },
    typography: {
        fontFamily: BODY,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    borderRadius: 0,
                    border: `2px solid ${COLORS.ink}`,
                    backgroundColor: COLORS.paper,
                    color: COLORS.ink,
                    padding: "8px 16px",
                    transition: "transform 80ms ease, background-color 120ms ease, color 120ms ease",
                    "&:hover": {
                        backgroundColor: COLORS.ink,
                        color: COLORS.paper,
                        borderColor: COLORS.ink,
                    },
                    "&:active": {
                        transform: "translate(1px, 1px)",
                    },
                    "&.Mui-disabled": {
                        border: `2px solid ${alpha(COLORS.ink, 0.25)}`,
                        color: alpha(COLORS.ink, 0.35),
                    },
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    borderRadius: 0,
                    border: `2px solid ${COLORS.ink}`,
                    color: COLORS.ink,
                    "&:hover": {
                        backgroundColor: alpha(COLORS.ink, 0.08),
                    },
                    "&.Mui-selected": {
                        backgroundColor: COLORS.pink,
                        color: COLORS.paper,
                        borderColor: COLORS.ink,
                    },
                    "&.Mui-selected:hover": {
                        backgroundColor: COLORS.pink,
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    fontFamily: MONO,
                    fontSize: "0.85rem",
                    backgroundColor: COLORS.paper,
                    "& fieldset": {
                        borderColor: COLORS.ink,
                        borderWidth: 2,
                    },
                    "&:hover fieldset": {
                        borderColor: COLORS.ink,
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: COLORS.blue,
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontFamily: MONO,
                    color: COLORS.ink,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.06em",
                    "&.Mui-focused": {
                        color: COLORS.blue,
                    },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontFamily: MONO,
                    fontSize: "0.85rem",
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    fontFamily: MONO,
                },
            },
        },
    },
});

export const FONTS = { MONO, BODY };
