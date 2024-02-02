import React, { useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { Document, Page, pdfjs } from "react-pdf";
import { loadPDF, foldPDF } from "../lib/pdf.mjs";

const Main = () => {
    const filePreviewRef = useRef(null);
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
        if(pageNumber - 2 >= 0)
            setPageNumber(pageNumber - 2);
    };

    const increment = () => {
        if(pageNumber + 2 <= numPages)
            setPageNumber(pageNumber + 2);
    };

    const decrementFolded = () => {
        if(pageNumberFolded - 2 >= 0)
            setPageNumberFolded(pageNumberFolded - 2);
    };

    const incrementFolded = () => {
        if(pageNumberFolded + 2 <= numPagesFolded)
            setPageNumberFolded(pageNumberFolded + 2 );
    };

    const handlePreviewButtonClick = () => {
        filePreviewRef.current.click();
    }

    const handleDownloadButtonClick = () => {
        fileInputRef.current.click();
    };

    const handlePreview = async (event) => {
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
                
                // Create a blob from the bytes
                const blob = new Blob([foldedPdf], { type: "application/pdf" });
                setFoldedPDF(blob);
            } catch (error) {
                console.error("Error processing file:", error);
            }
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
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
                <Button onClick={handlePreviewButtonClick}>Preview PDF</Button>
                <input
                    type="file"
                    ref={filePreviewRef}
                    onChange={handlePreview}
                    style={{ display: "none" }}
                    accept="application/pdf"
                />
            </Box>
            <Box>
                <Button onClick={handleDownloadButtonClick}>Download PDF</Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept="application/pdf"
                />
            </Box>

            <Box display="flex" flexDirection="row" margin="auto">
                <Box id="testRaw" margin="50px 50px 0 0">
                    <Document
                        file={rawPDF}
                        onLoadSuccess={onDocumentLoadSuccessRaw}
                    >
                        <Box display={"flex"} flexDirection={"row"}>
                            <Page
                                pageNumber={pageNumber}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                width={window.innerWidth * 0.20} // 25% of the window width
                            />
                            <Page
                                pageNumber={pageNumber + 1}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                width={window.innerWidth * 0.20} // 25% of the window width
                            />
                        </Box>
                    </Document>
                    <Button onClick={decrement}> - </Button>
                    <Button onClick={increment}> + </Button>
                </Box>
                <Box id="testFolded" margin="50px 0 0 50px">
                    <Document
                        file={foldedPDF}
                        onLoadSuccess={onDocumentLoadSuccessFolded}
                    >
                        <Box display={"flex"} flexDirection={"row"}>
                            <Page
                                pageNumber={pageNumberFolded}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                width={window.innerWidth * 0.20} // 25% of the window width
                            />
                            <Page
                                pageNumber={pageNumberFolded + 1}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                width={window.innerWidth * 0.20} // 25% of the window width
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
