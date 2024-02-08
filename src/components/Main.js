import React, { useEffect, useRef, useState } from "react";
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
    
    // Function to update the width
    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount
    // Calculate the desired width as 40% of the window width
    const pageWidth = windowWidth * 0.4;
    

    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.js",
        import.meta.url
    ).toString();

    const onDocumentLoadSuccessFolded = ({ numPages }) => {
        setNumPagesFolded(numPages);
    };

    const decrementFolded = () => {
        if(pageNumberFolded - 2 >= 0)
            setPageNumberFolded(pageNumberFolded - 1);
    };

    const incrementFolded = () => {
        if(pageNumberFolded + 2 <= numPagesFolded)
            setPageNumberFolded(pageNumberFolded + 1);
    };

    const handlePreviewButtonClick = () => {
        filePreviewRef.current.click();
    }

    const handleDownloadButtonClick = () => {
        try {
            // Create a URL for the blob
            const url = URL.createObjectURL(foldedPDF);

            // Create a temporary link element and trigger the download
            const link = document.createElement("a");
            link.href = url;
            link.download = "folded-pdf.pdf"; // Name the download file
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating download:", error);
        }
    };

    var file = null;
    const handlePreview = async (event) => {
        file = event.target.files[0];
        if (file) {
            try {
                const completedPdf = await createBookletPDF(await file.arrayBuffer());
                // Create a blob from the bytes
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
                <h1>Once Upon a Spine</h1>
                <h2>a free book imposition tool</h2>
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
            >
                <Box textAlign="left" maxWidth="40%">
                    <Box>
                        <h3>
                            info
                        </h3>
                        <p>
                            This is a <a href="https://en.wikipedia.org/wiki/Imposition">book imposition</a> tool,
                            intended to take a normal pdf paged from 1-whatever in order and rearrange
                            the pages so that they can be folded together into a <a href="https://en.wikipedia.org/wiki/Section_(bookbinding)">signature</a> and be
                            ordered correctly from the front page to the back.
                        </p>
                        <p>
                            Currently the tool only functions for a PDF with a multiple of 4 pages.  It only
                            does two page imposition, which is a comfortable size for US Letter size printing.
                            It can only create a signle signature.  It will only impose in left-to-right order.  
                        </p>
                        <p>
                            If there are additional features you are interested in, please let me know via
                            the Github link below!
                        </p>
                    </Box>
                    <Box>
                        <h3>
                            directions
                        </h3>
                        <ol>
                            <li>
                                Click Open PDF to begin
                            </li>
                            <li>
                                Select PDF file from local computer
                            </li>
                            <li>
                                Click download to get and enjoy the pretty preview
                            </li>
                            <li>
                                (manual duplex only)
                                Set printer settings to only print odd pages and print
                            </li>
                            <li>
                                (manual duplex only)
                                Take stack of papers, flip upside down, and reinsert into printer tray
                            </li>
                        </ol>
                    </Box>
                </Box>
                <Box minWidth="40%" textAlign="left" id="testFolded" marginBottom="20px">
                    <h3>preview</h3>
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
                        <Button onClick={decrementFolded}> - </Button>
                        <Button onClick={incrementFolded}> + </Button>
                    </Box>
                </Box>
            </Box>
            <Footer></Footer>
        </Box>
    );
};

export default Main;
