import React from "react";
import { Box } from "@mui/material";
import Donation from "./Donation";

const Footer = () => {
    return (
        <Box display="flex" justifyContent="space-between" position="relative" paddingTop="48px" bottom={0}>
            <Box textAlign="left" maxWidth="35%" paddingLeft="6px" marginRight="6px" position="relative" bottom={0}>
                <p>
                    Cookies for eating, not tracking.
                </p>
                <p>
                    You bind your business and we'll
                    bind ours.
                </p>
            </Box>
            <Box textAlign="left" maxWidth="35%" paddingLeft="6px" marginRight="6px" position="relative" bottom={0}>
                <Box textAlign={"right"}>
                    <p>Come checkout the <a href="https://github.com/daed/pdf-flipper/issues">github page!</a></p>
                    <Donation></Donation>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;