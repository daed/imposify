import React from "react";
import { Box } from "@mui/material";
import { COLORS } from '../theme';

export const RegistrationMark = ({ size = 16 }) => (
    <Box
        component="span"
        sx={{
            position: "relative",
            display: "inline-block",
            width: size,
            height: size,
            flexShrink: 0,
        }}
    >
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: "2px",
                backgroundColor: COLORS.ink,
                transform: "translateY(-1px)",
            }}
        />
        <Box
            sx={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: COLORS.ink,
                transform: "translateX(-1px)",
            }}
        />
        <Box
            sx={{
                position: "absolute",
                inset: `${size * 0.26}px`,
                border: `2px solid ${COLORS.ink}`,
                borderRadius: "50%",
            }}
        />
    </Box>
);

export const ColorBar = ({ height = 8 }) => (
    <Box display="flex" sx={{ height }}>
        {[COLORS.ink, COLORS.pink, COLORS.blue, COLORS.yellow].map((c) => (
            <Box key={c} sx={{ flex: 1, backgroundColor: c }} />
        ))}
    </Box>
);
