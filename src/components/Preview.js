import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Spinner from "./Spinner";
import { useAppContext } from '../context/AppContext';
import { Document, Page } from "react-pdf";
import { COLORS, FONTS } from '../theme';

const navButtonSx = {
    fontFamily: FONTS.MONO,
    fontSize: "0.8rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    border: `2px solid ${COLORS.ink}`,
    backgroundColor: COLORS.paper,
    color: COLORS.ink,
    padding: "6px 16px",
    cursor: "pointer",
    "&:hover": { backgroundColor: COLORS.ink, color: COLORS.paper },
};

const Preview = () => {
    const { sharedState, setSharedState } = useAppContext();

    // runs after the pdf is folded and the preview is rendering
    const onPDFFoldSuccess = ({ numPages }) => {
        console.log("onPDFFoldSuccess: pdf should have loaded correctly");
        setSharedState({ ...sharedState,
            numPagesFolded: numPages,
            loaded: true
        });
        console.log(sharedState);
    };

    // move preview to the previous set of pages
    const decrementFolded = () => {
        const newval = sharedState.pageNumberFolded - 1;
        if(newval >= 1) // Updated to prevent going below 1
            setSharedState({ ...sharedState, pageNumberFolded: newval});
    };

    // move preview to the next set of pages
    const incrementFolded = () => {
        const newval = sharedState.pageNumberFolded + 1;
        if(newval <= sharedState.numPagesFolded)
            setSharedState({ ...sharedState, pageNumberFolded: newval});
    };

    useEffect(() => {
        if (sharedState.loaded) {
            console.log("Preview:  loaded triggers");
            console.log(sharedState);
        }
    }, [sharedState]);

    return (
        <div className="preview">
            <Typography
                sx={{
                    fontFamily: FONTS.MONO,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: COLORS.pink,
                    mb: 1,
                }}
            >
                Proof
            </Typography>
            <Box height id="spinner-box" className="hidden" >
                <Box display="flex" minHeight="80%" alignItems="baseline" justifyContent="center">
                    <Box margin="20%">
                        <Spinner />
                    </Box>
                </Box>
            </Box>
            <Box
                maxWidth="100%"
                margin="auto"
                id="document-box"
                className="doc-box"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                sx={{ border: `2px solid ${COLORS.ink}`, p: 1.5 }}
            >
                <Box width={sharedState.previewWidth} margin="auto" minHeight="80%">
                    <Document
                        width={sharedState.previewWidth}
                        file={sharedState.foldedPDF}
                        onLoadSuccess={onPDFFoldSuccess}
                        noData={
                            <Typography sx={{ fontFamily: FONTS.MONO, fontSize: "0.8rem", color: COLORS.ink, py: 6 }}>
                                open a pdf to see the proof
                            </Typography>
                        }
                    >
                        <Page
                            pageNumber={sharedState.pageNumberFolded}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            width={sharedState.previewWidth}
                        >
                        </Page>
                    </Document>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center" gap={2} mt={1.5}>
                    <Box component="button" onClick={decrementFolded} sx={navButtonSx}>&#8249; prev</Box>
                    <Typography sx={{ fontFamily: FONTS.MONO, fontSize: "0.8rem" }}>
                        sheet {sharedState.pageNumberFolded} / {sharedState.numPagesFolded || "?"}
                    </Typography>
                    <Box component="button" onClick={incrementFolded} sx={navButtonSx}>next &#8250;</Box>
                </Box>
            </Box>
        </div>
    );
}

export default Preview;
