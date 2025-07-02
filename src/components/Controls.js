import React, { useRef } from "react";
import { Box, Button } from "@mui/material";
import { useAppContext } from '../context/AppContext';


const Controls = () => {
    // Create a ref to store the file input element
    const fileInputRef = useRef(null);
    const { sharedState, setSharedState } = useAppContext();

    const handleOpenButtonClick = () => {
        // Programmatically click the hidden file input
        fileInputRef.current.click();
    };

    // handle open button
    const handleFileSelected = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSharedState({...sharedState, origPDF: file});
        }
    };

    const toggleRTL = async (e) => {
        e.preventDefault();
        // toggle the rtl state
        const updatedRTL = !sharedState.rtl;
        if (sharedState.loaded) {
            // reload original PDF
            await sharedState.impose.loadPDF(await sharedState.origPDF.arrayBuffer());
            // re-render it
            const completedPdf = sharedState.impose.createBooklet({rtl: updatedRTL});
            const blob = new Blob([(await completedPdf)], { type: "application/pdf" });
            setSharedState({
                ...sharedState,
                foldedPDF: blob,
                rtl: updatedRTL,
            })
        }
        else {
            // if we don't have a loaded PDF, just toggle the rtl state
            setSharedState({
                ...sharedState,
                rtl: updatedRTL,
            });
        }
    }

    // "download pdf" gets clicked by the user.  adds a anchor
    // to the page and triggers it to start the file download.
    const handleDownloadButtonClick = () => {
        try {
            const url = URL.createObjectURL(sharedState.foldedPDF);
            const link = document.createElement("a");
            link.href = url;
            link.download = "folded-pdf.pdf";
            document.body.appendChild(link);
            link.click();
            // don't leave the link dangling
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating download:", error);
        }
    };

    return (
        <Box display="flex">
            <Button onClick={handleOpenButtonClick}>Open PDF</Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                style={{ display: "none" }} // Hide the file input
                accept="application/pdf" // Accept only PDF files
            />
            <Box id="pdfDisplayBlock">
                <Button disabled={!sharedState.loaded} onClick={handleDownloadButtonClick}>Download PDF</Button>
            </Box>

            <Box style={{ marginLeft: "10px", paddingLeft: "10px", borderLeft: "1px solid #ccc"}}>

            <Button onClick={toggleRTL}>
                {sharedState.rtl ? "⇐ Right-To-Left " : "Left-To-Right ⇒"}
            </Button>
            </Box>
        </Box>
    );
};

export default Controls;