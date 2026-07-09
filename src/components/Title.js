import { Box, Typography } from "@mui/material";
import { COLORS, FONTS } from '../theme';
import { RegistrationMark, ColorBar } from "./PrintMarks";

const Title = () => {
    return (
        <Box textAlign="center" sx={{ pt: 2, pb: 1 }} marginBottom="3%">
            <Box display="flex" justifyContent="space-between" sx={{ px: 1, mb: 1 }}>
                <RegistrationMark />
                <RegistrationMark />
            </Box>
            <Typography
                component="h1"
                sx={{
                    fontFamily: '"Archivo Black", sans-serif',
                    fontSize: { xs: "2.75rem", sm: "4rem" },
                    lineHeight: 0.9,
                    letterSpacing: "-0.01em",
                    color: COLORS.ink,
                    display: "inline-block",
                    m: 0,
                    textShadow: `2px 2px 0 ${COLORS.pink}, -2px -2px 0 ${COLORS.blue}`,
                }}
            >
                IMPOSIFY
            </Typography>
            <Box display="flex" justifyContent="space-between">
                <Typography
                    component="p"
                    sx={{
                        fontFamily: FONTS.MONO,
                        fontSize: "0.8rem",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: COLORS.ink,
                        mt: 1,
                    }}
                >
                    fold flat pages into a real booklet
                </Typography>
                <Typography>
                    <a href="/about">about</a>
                </Typography>
            </Box>
            <Box sx={{ maxWidth: 280, mx: "auto", mt: 2 }}>
                <ColorBar />
            </Box>
        </Box>
    );
}

export default Title;
