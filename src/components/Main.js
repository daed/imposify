import React, { useEffect, useRef, useState } from "react";
import Directions from "./Directions";
import Footer from "./Footer";
import { Box, Button } from "@mui/material";
import { Document, Page, pdfjs } from "react-pdf";
import { createBookletPDF } from "../lib/pdf.mjs";

const Main = () => {
    const filePreviewRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
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
    if (windowWidth > 599) {
        pageWidth = windowWidth * 0.4;
    } else {
        pageWidth = windowWidth * 0.8;
    }

    // Set the path to the PDF.js worker from a CDN
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

    const onDocumentLoadSuccessFolded = ({ numPages }) => {
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

    const handlePreview = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const completedPdf = await createBookletPDF(await file.arrayBuffer());
                const blob = new Blob([completedPdf], { type: "application/pdf" });
                setFoldedPDF(blob);
                setLoaded(true);
            } catch (error) {
                console.error("Error processing file:", error);
            }
        }
    };

    return (
        <Box id="main">
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
                minHeight={500}
                maxWidth={1200}
                justifyContent="space-between"
                flexDirection="row"
                class="column-fold"
            >
                <Directions></Directions>
                <Box minWidth="40%" textAlign="left" id="testFolded" marginBottom="20px">
                    <h3>Preview</h3>
                    <Document
                        file={foldedPDF}
                        onLoadSuccess={onDocumentLoadSuccessFolded}
                    >
                        <Box display="flex" flexDirection="row">
                            <Page
                                pageNumber={pageNumberFolded}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                width={pageWidth} // 25% of the window width
                            />
                        </Box>
                    </Document>
                    <Box position="relative" display="flex" width="100%" justifyContent="center" bottom={0}>
                        <Button style={{ fontSize: "40px" }} onClick={decrementFolded}> ⇐ </Button>
                        <Button style={{ fontSize: "40px" }} onClick={incrementFolded}> ⇒ </Button>
                    </Box>
                </Box>
            </Box>
            <Footer></Footer>
        </Box>
    );
};

export default Main;
