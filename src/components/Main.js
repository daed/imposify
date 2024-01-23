import { h } from 'preact';
import { useRef } from 'preact/hooks';
import styles from './styles.less';
import { PDFDocument } from 'pdf-lib';
import { loadPDF, foldPDF } from '../lib/pdf.mjs';
import { PdfViewer } from './PdfViewer';

const Main = () => {
    const fileInputRef = useRef(null);
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };
    
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const fileBytes = await file.arrayBuffer();
                // Now fileBytes can be used with pdf-lib
                const loadedPdfData = await loadPDF(fileBytes);
                console.log(loadedPdfData);
                // foldPDF returns as 'bytes'
                const foldedPdf = await foldPDF(loadedPdfData);
                console.log(foldedPdf);

                // Create a blob from the bytes
                const blob = new Blob([foldedPdf], { type: 'application/pdf' });
    
                // Create a URL for the blob
                const url = URL.createObjectURL(blob);
    
                // Create a temporary link element and trigger the download
                const link = document.createElement('a');
                link.href = url;
                link.download = 'folded-pdf.pdf'; // Name the download file
                document.body.appendChild(link);
                link.click();
    
                // Clean up
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
            } catch (error) {
                console.error('Error processing file:', error);
            }
        }
    };
    
    return (
        <div class={styles.Main}>
            <div>
                <h1>Hello, Preact!</h1>
            </div>
            <div>
                <button onClick={handleButtonClick}>Upload PDF</button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="application/pdf"
                />
            </div>
            <div>
                Upload the PDF
            </div>
            <div>
                Click the button
            </div>
            <div>
                Download the things
            </div>
        </div>
    );
};

export default Main;
