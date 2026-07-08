import React from "react";
import { Box, Typography } from "@mui/material";
import Donation from "./Donation";
import packageJson from '../../package.json'; // Adjust the relative path as necessary

const Footer = () => {
    const version = packageJson.version;

    return (
        <Box display="flex" justifyContent="space-between" position="relative" paddingTop="48px" bottom={0}>
            <Box textAlign="right" maxWidth="35%" paddingLeft="6px" marginRight="6px" position="relative" bottom={0}>
                <Typography variant="body2">
                    Cookies for eating, not tracking.
                </Typography>
                <Typography variant="body2">
                    You bind your business and we'll bind ours.
                </Typography>
            </Box>
            <Box textAlign="left" maxWidth="35%" paddingLeft="6px" marginRight="6px" position="relative" bottom={0}>
                <Box display="flex" height="100%" flexDirection="column-reverse">
                    <Donation></Donation>
                </Box>
            </Box>
            <Box textAlign="right" maxWidth="35%" paddingLeft="6px" marginRight="6px" position="relative" bottom={0}>
                <Typography variant="body2">
                    imposify v{version}
                </Typography>
                <Typography variant="body2">
                    <a href="https://github.com/daed/imposify">github page!</a>
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;