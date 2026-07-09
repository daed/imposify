import React from "react";
import { Box, Typography } from "@mui/material";
import Donation from "./Donation";
import packageJson from '../../package.json'; // Adjust the relative path as necessary
import { COLORS, FONTS } from '../theme';

const monoSx = { fontFamily: FONTS.MONO, fontSize: "0.75rem" };

const Footer = () => {
    const version = packageJson.version;

    return (
        <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="space-between"
            gap={2}
            sx={{ borderTop: `2px solid ${COLORS.ink}`, mt: 4, pt: 2 }}
        >
            <Box textAlign="left" maxWidth="35%">
                <Typography sx={monoSx}>cookies for eating, not tracking.</Typography>
                <Typography sx={monoSx}>you bind your business, we'll bind ours.</Typography>
            </Box>
            <Box display="flex" alignItems="center">
                <Donation></Donation>
            </Box>
            <Box textAlign="right" maxWidth="35%">
                <Typography sx={monoSx}>imposify v{version}</Typography>
                <Typography sx={monoSx}>
                    <a href="https://github.com/daed/imposify">source on github</a>
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;