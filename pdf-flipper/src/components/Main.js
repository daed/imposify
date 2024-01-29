import React, { useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { Document, Page, pdfjs } from "react-pdf";
import { loadPDF, foldPDF } from "../lib/pdf.mjs";

const Main = () => {
    const fileInputRef = useRef(null);
    const [rawPDF, setRawPDF] = useState(null);
    const [foldedPDF, setFoldedPDF] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [numPagesFolded, setNumPagesFolded] = useState(null);

    const [pageNumber, setPageNumber] = useState(1);
    const [pageNumberFolded, setPageNumberFolded] = useState(1);


    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.js",
        import.meta.url
    ).toString();

    const onDocumentLoadSuccessRaw = ({ numPages }) => {
        setNumPages(numPages);
    };

    const onDocumentLoadSuccessFolded = ({ numPages }) => {
        setNumPagesFolded(numPages);
    };

    const decrement = () => {
        setPageNumber(pageNumber - 1);
    };

    const increment = () => {
        setPageNumber(pageNumber + 1);
    };

    const decrementFolded = () => {
        setPageNumberFolded(pageNumberFolded - 1);
    };

    const incrementFolded = () => {
        setPageNumberFolded(pageNumberFolded + 1);
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                setRawPDF(file);

                const fileBytes = await file.arrayBuffer();
                // Now fileBytes can be used with pdf-lib
                const loadedPdfData = await loadPDF(fileBytes);
                console.log(loadedPdfData);
                // foldPDF returns as 'bytes'
                const foldedPdf = await foldPDF(loadedPdfData);
                console.log(foldedPdf);
                
                // Create a blob from the bytes
                const blob = new Blob([foldedPdf], { type: "application/pdf" });
                setFoldedPDF(blob);

                // Create a URL for the blob
                const url = URL.createObjectURL(blob);

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
                console.error("Error processing file:", error);
            }
        }
    };
    return (
        <Box id="main">
            <Box>
                <h1>PDF Flipper</h1>
            </Box>
            <Box>
                <Button onClick={handleButtonClick}>Upload PDF</Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept="application/pdf"
                />
            </Box>
            <Box>Upload the PDF</Box>
            <Box>Click the button</Box>
            <Box>Download the things</Box>
            <Box display="flex" flexDirection="row">
                <Box id="testRaw" width="200px" height="600px">
                    <Document
                        file={rawPDF}
                        onLoadSuccess={onDocumentLoadSuccessRaw}
                    >
                        <Box display={"flex"} flexDirection={"row"}>
                            <Page
                                pageNumber={pageNumber}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                            />
                            <Page
                                pageNumber={pageNumber + 1}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                            />
                        </Box>
                    </Document>
                    <Button onClick={decrement}> - </Button>
                    <Button onClick={increment}> + </Button>
                </Box>
                <Box width="1000px"/>
                <Box id="testFolded" width="200px" height="600px">
                    <Document
                        file={foldedPDF}
                        onLoadSuccess={onDocumentLoadSuccessFolded}
                    >
                        <Box display={"flex"} flexDirection={"row"}>
                            <Page
                                pageNumber={pageNumberFolded}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                            />
                            <Page
                                pageNumber={pageNumberFolded + 1}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                            />
                        </Box>
                    </Document>
                    <Button onClick={decrementFolded}> - </Button>
                    <Button onClick={incrementFolded}> + </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Main;
