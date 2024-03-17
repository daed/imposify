// pdf.js
import { PDFDocument, rgb } from 'pdf-lib';

export default class Impose {
    loaded = false;
    orig_pdf = null;
    pdf = null;

    constructor(pdfURL) {        
        if (pdfURL) this.loadPDF(pdfURL);
    }

    async loadPDF(pdfURL) {
        // is there a cheaper way of doing this like a deepcopy?
        this.pdf = await PDFDocument.load(pdfURL);
        this.orig_pdf = await PDFDocument.load(pdfURL);

        this.loaded = true;
    }

    async isSpreadPrinted() {
        const pdf = this.pdf;
        if (pdf !== null) {
            const pages = pdf.getPages();
            const firstPage = pages[0];
            const secondPage = pages[1];
            const lastPage = pages[pages.length - 1];
            // if it's less than 4 then it's either spreads or it's not enough pages
            if (pages.length < 4) {
                for(let i=1; i<pages.length-1; i++) {
                    if (firstPage.width !== pages[i].width) return false; 
                }
                return true;
            }
            if (firstPage.width === lastPage.width) { 
                for(let i=2; i<pages.length-2; i++) {
                    if (secondPage.width !== pages[i].width) return false; 
                }
            }
            return true;
        }
        return false;
    }

    async detachSpreads() {
        // Create a new PDF document
        const newPdfDoc = await PDFDocument.create();
        const pdf = this.pdf;
        if (pdf !== null) {

            // For non-spread pages, just copy the page as is
            const [copiedFirstPage] = await newPdfDoc.copyPages(pdf, [0]);
            newPdfDoc.addPage(copiedFirstPage);

        for (let pageIndex = 1; pageIndex < pdf.getPageCount() - 1; pageIndex++) {
            const page = pdf.getPage(pageIndex);

            // Assuming you have a way to detect spreads. If this page is a spread, proceed.
            if (true) {
                const {width, height} = page.getSize();
                const middle = width / 2;

                // Copy the left half of the spread
                const leftPage = await newPdfDoc.addPage([middle, height]);
                const copiedPageLeft = await newPdfDoc.embedPage(page, {
                    left: 0,
                    bottom: 0,
                    right: middle,
                    top: height,
                });
                leftPage.drawPage(copiedPageLeft);
                    // Copy the right half of the spread
                    const rightPage = await newPdfDoc.addPage([middle, height]);
                    const copiedPageRight = await newPdfDoc.embedPage(page, {
                        left: middle,
                        bottom: 0,
                        right: width,
                        top: height,
                });
                rightPage.drawPage(copiedPageRight);
            } else {
                // For non-spread pages, just copy the page as is
                const [copiedPage] = await newPdfDoc.copyPages([pageIndex]);
                newPdfDoc.addPage(copiedPage);
            }
        }
        // For non-spread pages, just copy the page as is
        const [copiedLastPage] = await newPdfDoc.copyPages(pdf, [pdf.getPageCount()-1]);
        newPdfDoc.addPage(copiedLastPage);
        this.pdf = newPdfDoc;
        return true;
        }
        return false;
    }

    async foldPDF(pdf, start=0, end=0) {
        const len = this.getPDFLength(pdf);
        console.log(`len: ${len}`);
    
        // unless specified, autodetect the end
        if (end === 0 && len > 2) {
            // -1 because zero-indexed
            end = len - 1;
        }
    
        // sanity check
        if (start > end) {
            console.error("Overran the page numbers, something went wrong!");
            return;
        }
        
        // pdf length must be multiples of 4
        if (len % 4 !== 0) {
            console.error(`pdf is incorrect number of pages (${len} pages).  This will fail as it must be a multiple of 4.`);
            return;
        }
        
        const newPdf = await PDFDocument.create();
        for (start; start<end; start+=2) {
            const [secondPage] = await newPdf.copyPages(pdf, [start]); // Copy first page of the first PDF
            const [firstPage] = await newPdf.copyPages(pdf, [end]); // copy the last page of the first pdf
            const [thirdPage] = await newPdf.copyPages(pdf, [start+1]);
            const [fourthPage] = await newPdf.copyPages(pdf, [end-1]);
    
            newPdf.addPage(firstPage);
            newPdf.addPage(secondPage); 
            newPdf.addPage(thirdPage); 
            newPdf.addPage(fourthPage);
            
            end -= 2;
        }
        return newPdf
    }

    async renderPage(pageNumber, canvas) {
        const page = await this.pdf[pageNumber];
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport
        };
        await page.render(renderContext).promise;
    }

    async _makePageSpread(firstPage, secondPage) { 
        const width = firstPage.width;
        const height = firstPage.height;
        // Create a new page with double the width of the original to hold two pages side by side
        const newPage = this.pdf.addPage([width * 2, height]);
      
        console.log("rendering first page");
        // Draw the first page on the left half
        newPage.drawPage(firstPage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });
        // Draw the second page on the right half
        newPage.drawPage(secondPage, {
            x: width, // Offset by the width of the first page
            y: 0,
            width: width,
            height: height,
        });
    }

    length() {
        return this.pdf.getPages().length;
    }

    async newPage() {
        const pdf = this.pdf;
        // Check if the document has at least two pages to get the dimensions from the second page
        if (pdf.getPageCount() < 2) {
            console.error("The document does not have a second page.");
            return;
        }
        
        // Get the second page
        const secondPage = pdf.getPages()[1];
        
        // Extract the width and height from the second page
        const width = secondPage.getWidth();
        const height = secondPage.getHeight();
        
        // Add a new blank page with the same dimensions as the second page
        const blankPage = pdf.addPage([width, height]);
        
        // Optionally set the entire new page as white
        // Note: This step might be unnecessary if you're okay with the default white background,
        // but it ensures the page is initialized with content.
        blankPage.drawRectangle({
            x: 0, // Starting X coordinate
            y: 0, // Starting Y coordinate
            width: width,
            height: height,
            color: rgb(1, 1, 1), // RGB color for white
        });
    }

    async addPadding(pages=1) {
        const pdf = this.pdf;
        // Create a new PDF document
        const newPdfDoc = await PDFDocument.create();
        // Determine the number of pages in the original document
        const numberOfPages = this.pdf.getPageCount();

        // Copy all pages from the original document to the new one, except for the last page
        for (let i = 0; i < numberOfPages - 1; i++) {
            const [copiedPage] = await newPdfDoc.copyPages(pdf, [i]);
            newPdfDoc.addPage(copiedPage);
        }

        while (pages > 0) {
            // Add the blank page to the new document before the last page of the original document
            this.newPage(newPdfDoc);
            pages--;
        }

        // Now, copy the last page of the original document to the new document
        const [lastPage] = await newPdfDoc.copyPages(this.pdf, [numberOfPages - 1]);
        newPdfDoc.addPage(lastPage);

        return newPdfDoc;
    }

    async createBooklet() {
        // load pdf -> split spreads -> pad pages -> reorder for stuff
        let pdf = this.pdf;
        if (this.isPdfPrintedInSpread(pdf)) {
            this.pdf = await this.splitPDFSpreads(pdf);
        }
        const len = this.originalPdfDoc.getPageCount();
        // Calculate how many blank pages are needed to make the page count a multiple of 4
        let pagesToAdd = (4 - (len % 4)) % 4; // This ensures that we add pages only if needed
        if (pagesToAdd)	this.originalPdfDoc = await this.addPagesBeforeLast(pdf, pagesToAdd);
        const foldedPdf = await this.foldPDF();
        const newPdfDoc = await PDFDocument.create();
        for (let i=0; i<foldedPdf.getPages().length; i+=2) {
            const [firstPage] = await newPdfDoc.embedPdf(foldedPdf, [i]);
            const [secondPage] = await newPdfDoc.embedPdf(foldedPdf, [i+1]);
            await this._makePageSpread(firstPage, secondPage, newPdfDoc);
        }
        // Serialize the PDFDocument to bytes
        const pdfBytes = await newPdfDoc.save();
        // Here, you can save the pdfBytes to a file, or return it from a server endpoint, etc.
        return pdfBytes;
    }
}
