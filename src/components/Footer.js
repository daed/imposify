import React from "react";
import { Box } from "@mui/material";
import Donation from "./Donation";
import packageJson from '../../package.json'; // Adjust the relative path as necessary

const Footer = () => {
    const version = packageJson.version;
    
    return (
        <Box display="flex" justifyContent="space-between" position="relative" paddingTop="48px" bottom={0}>
            <Box textAlign="left" maxWidth="35%" paddingLeft="6px" marginRight="6px" position="relative" bottom={0}>
                <p textAlign="right">
                    Cookies for eating, not tracking.
                </p>
                <p textAlign="right">
                    You bind your business and we'll bind ours.
                </p>
            </Box>
            <Box textAlign="left" maxWidth="35%" paddingLeft="6px" marginRight="6px" position="relative" bottom={0}>
                <p display="flex" height={"100%"} flexDirection={"column-reverse"} padding={"0 0 0px 0"}>
                    <Donation></Donation>
                </p>
            </Box>
            <Box textAlign="left" maxWidth="35%" paddingLeft="6px" marginRight="6px" position="relative" bottom={0}>
                <p textAlign="right">
                    <Box textAlign="right"> 
                        imposify v{version}
                    </Box>
                </p>
                <p>
                    <Box textAlign="right">
                        <a href="https://github.com/daed/imposify">github page!</a>
                    </Box>
                </p>
            </Box>
        </Box>
    );
};

export default Footer;