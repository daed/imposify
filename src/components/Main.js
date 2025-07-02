import React, { useEffect, useState } from "react";
import Directions from "./Directions";
import Footer from "./Footer";
import Title from "./Title";
import Preview from "./Preview";
import Controls from "./Controls";
import { Box, Typography } from "@mui/material";
import Impose from "../lib/imposify.mjs";
import { pdfjs } from "react-pdf";
import { useAppContext } from '../context/AppContext';

// Turns the spinner on/off via CSS.  doing it this way instead of
// via react state seems to result in a quicker loading initial
// image than allowing a rerender would.
const setSpinner = (val) => {
    const docBox = document.getElementById("document-box");
    const spinBox = document.getElementById("spinner-box")
    if (val) {
        docBox.classList = "hidden";
        spinBox.classList = "";
    }
    else {
        docBox.classList = "doc-box";
        spinBox.classList = "hidden";
    }
};

const Main = () => {

    // Boolean to determine if we are dragging a file
    const [isDragging, setIsDragging] = useState(false);
    const [mode] = useState(0);
    
    const { sharedState, setSharedState } = useAppContext();
    // our pdf manipulation class itself
    const [impose] = useState(() => new Impose());

    // Set the path to the PDF.js worker from a CDN
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

    useEffect(() => {
        setSharedState(currentState => {
            const newPreviewWidth = window.innerWidth > 599 ? window.innerWidth * 0.4 : window.innerWidth * 0.8;
            return {...currentState, previewWidth: newPreviewWidth};
        });
    }, [setSharedState]);

    // Helper to update preview width based on window size
    const handleResize = (setSharedState) => {
        setSharedState(currentState => {
            const newPreviewWidth = window.innerWidth > 599 ? window.innerWidth * 0.4 : window.innerWidth * 0.8;
            return { ...currentState, previewWidth: newPreviewWidth };
        });
    };

    // Handles loading, imposing, and preparing the PDF for preview
    const processFile = async ({ file, impose, sharedState, setSharedState }) => {
        handleResize(setSharedState);
        let completedPDF = false;
        try {
            setSpinner(true);
            console.log("loading");
            await impose.loadPDF(await file.arrayBuffer());
            console.log("imposing");
            const completedPdf = await impose.createBooklet({ rtl: sharedState.rtl });
            console.log("converting to binary blob");
            if (completedPdf) {
                const pageIndex = sharedState.rtl ? completedPdf.getPages().length : 1;
                const blob = new Blob([completedPdf], { type: "application/pdf" });
                console.log("setting state for preview rendering");
                setTimeout(() => {
                    setSharedState({ ...sharedState, pageNumberFolded: pageIndex, foldedPDF: blob, loaded: true });
                }, 1000);
                console.log(sharedState);
            } else {
                throw new Error(`completedPDF was ${completedPDF}`);
            }
        } catch (error) {
            console.error("Error processing file:", error);
        }
        setTimeout(() => setSpinner(false), 1250);
    };

    useEffect(() => {
        if (sharedState.origPDF) {
            processFile({
                file: sharedState.origPDF,
                impose,
                sharedState,
                setSharedState
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [impose, sharedState.rtl, setSharedState, sharedState.origPDF]);
    
    useEffect(() => {
        // hurl the imposify instance at the sharedState
        // so that it can be used in the controls and preview
        // components.
        setSharedState(currentState => {
            return {...currentState, impose: impose};
        });
    }, [impose, setSharedState]);

    // handle drag and drop
    const handleDrop = async (event) => {
        event.preventDefault();
        setIsDragging(false); // Reset drag state on drop
        const file = event.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            setSharedState({...sharedState, origPDF: file});
        }
    };
    // handle dragging activity overlay
    const handleDragEnter = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };
    const handleDragOver = handleDragEnter;
    // turn off dragging overlay afterward
    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragging(false); // Reset drag state when leaving the drop area
    };

    useEffect(() => {
        const handleResize = () => {
            setSharedState(currentState => {
                const newPreviewWidth = window.innerWidth > 599 ? window.innerWidth * 0.4 : window.innerWidth * 0.8;
                return {...currentState, previewWidth: newPreviewWidth};
            });
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [setSharedState]);

    return (
        <Box id="main"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{ 
            border: isDragging ? '2px dashed #000' : '1px solid #ddd',
            backgroundColor: isDragging ? "rgba(0, 0, 0, 0.5)" : 'unset',
            maxWidth: "1200px",
            margin: "auto",
            padding: '20px',
            textAlign: 'center' }} 
            >
                {isDragging && (
                    <Box
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    overflow="hidden"
                    backgroundColor="rgba(0, 0, 0, 0.5)" // Translucent background
                    zIndex={2} // Ensure it's above other content
                    style={{ pointerEvents: "none" }} // Allows clicks to go through if necessary
                    >
                        <Typography overflow="hidden" variant="h4" color="white">
                            Drag and drop PDF files here
                        </Typography>
                    </Box>
                )} 
                <Title></Title>
                <Controls></Controls>

                {/* two main columns here */}
                <Box 
                display="flex" 
                margin="auto"
                maxWidth={1200}
                justifyContent="space-between"
                flexDirection="row"
                class="column-fold"
                >
                    {/* Left column, selectable, defaults to Directions */}
                    {mode === 0 && (
                        <Directions></Directions>
                    )}
                    {/* Right column, preview */}
                    <Box minWidth="50%" maxWidth="50%" textAlign="left" id="testFolded" marginBottom="20px">
                        <Preview></Preview>
                    </Box>
                </Box>
            {/* Footer has version and donation link */}
            <Footer></Footer>
        </Box>
    );
};

export default Main;
