import React, { useEffect, useRef, useState } from "react";
import Directions from "./Directions";
import Spinner from "./Spinner";
import Footer from "./Footer";
import { Box, Button, Typography } from "@mui/material";
import { Document, Page, pdfjs } from "react-pdf";
import { Impose } from "../lib/imposifiy.mjs";

const impose = new Impose();

const Main = () => {
    const filePreviewRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [foldedPDF, setFoldedPDF] = useState(null);
    const [numPagesFolded, setNumPagesFolded] = useState(null);
    const [pageNumberFolded, setPageNumberFolded] = useState(1);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    let pageWidth;
    if (windowWidth > 1400) {
        pageWidth = 1400 * 0.425;        
    } else if (windowWidth > 599) {
        pageWidth = windowWidth * 0.425;
    } else {
        pageWidth = windowWidth * 0.8;
    }

    // Set the path to the PDF.js worker from a CDN
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

    const onDocumentLoadSuccessFolded = ({ numPages }) => {
        setLoaded(true);
        setNumPagesFolded(numPages);
    };

    const decrementFolded = () => {
        if(pageNumberFolded - 1 >= 1) // Updated to prevent going below 1
            setPageNumberFolded(pageNumberFolded - 1);
    };

    const incrementFolded = () => {
        if(pageNumberFolded + 1 <= numPagesFolded)
            setPageNumberFolded(pageNumberFolded + 1);
    };

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    const handlePreviewButtonClick = () => {
        filePreviewRef.current.click();
    };

    const handleDownloadButtonClick = () => {
        try {
            const url = URL.createObjectURL(foldedPDF);
            const link = document.createElement("a");
            link.href = url;
            link.download = "folded-pdf.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating download:", error);
        }
    };


    const processFile = async (file) => {
        try {            
            setSpinner(true);
            const completedPdf = await createBookletPDF(await file.arrayBuffer());
            const blob = new Blob([completedPdf], { type: "application/pdf" });
            setFoldedPDF(blob);
            setLoaded(true);
            // We're loaded but we should delay unshowing the Spinner just a while
            setTimeout(() => setSpinner(false), 1250);
        } catch (error) {
            console.error("Error processing file:", error);
        }
    };
    
    const handlePreview = async (event) => {
        const file = event.target.files[0];
        if (file) {
            processFile(file);
        }
    };

const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragging(true);
};

const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow the drop
    // Keep the drag state active, might not be strictly necessary depending on your CSS
    setIsDragging(true);
};

const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false); // Reset drag state when leaving the drop area
};

const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false); // Reset drag state on drop
    const file = event.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
        processFile(file);
    }
};

    return (
        <Box id="main"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{ border: isDragging ? '2px dashed #000' : '1px solid #ddd', maxWidth: "1200px", margin: "auto", padding: '20px', textAlign: 'center' }} 
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
            backgroundColor="rgba(0, 0, 0, 0.5)" // Translucent background
            zIndex={2} // Ensure it's above other content
            style={{ pointerEvents: "none" }} // Allows clicks to go through if necessary
        >
            <Typography variant="h4" color="white">
                Drag and drop PDF files here
            </Typography>
        </Box>
    )}
                <Box>
                    <h1>Imposify</h1>
                    <h2>the free book imposition tool</h2>
                </Box>
                <Box display="flex">
                    <Button onClick={handlePreviewButtonClick}>Open PDF</Button>
                    <input
                        type="file"
                        ref={filePreviewRef}
                        onChange={handlePreview}
                        style={{ display: "none" }}
                        accept="application/pdf"
                    />
                    <Box id="pdfDisplayBlock">
                        <Button disabled={!loaded} onClick={handleDownloadButtonClick}>Download PDF</Button>
                    </Box>
                </Box>
                <Box 
                display="flex" 
                margin="auto"
                maxWidth={1200}
                justifyContent="space-between"
                flexDirection="row"
                class="column-fold"
                >
                <Directions></Directions>
                <Box minWidth="50%" maxWidth="50%" textAlign="left" id="testFolded" marginBottom="20px">
                    <h3>Preview</h3>
                    <Box height id="spinner-box" className="hidden" >
                        <Box display="flex" minHeight="80%" alignItems="baseline" justifyContent="center">
                            <Box margin="20%">
                                <Spinner />
                            </Box>
                        </Box>
                    </Box>
                    <Box maxWidth="100%" height="100%" margin="auto" id="document-box" className="doc-box" display="flex" flexDirection="column" justifyContent="space-between">
                        <Box width={pageWidth} margin="auto" minHeight="80%">
                                <Document width={pageWidth} file={foldedPDF} onLoadSuccess={onDocumentLoadSuccessFolded}>
                                    <Page
                                        pageNumber={pageNumberFolded}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={false}
                                        width={pageWidth}
                                        >

                                    </Page>
                                </Document>
                        </Box>
                        <Box display="flex" width="100%" justifyContent="center">
                            <Button style={{ width: "50%", fontSize: "40px" }} onClick={decrementFolded}> ⇐ </Button>
                            <Button style={{ width: "50%", fontSize: "40px" }} onClick={incrementFolded}> ⇒ </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Footer></Footer>
        </Box>
    );
};

export default Main;
