const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createPdfWithPageNumbers(pageCount) {
    const pdfDoc = await PDFDocument.create();

    for (let i = 1; i <= pageCount; i++) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 100; // Large font size for visibility
        const text = String(i); // Page number as text

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);

        page.drawText(text, {
            x: (width - textWidth) / 2,
            y: (height - textHeight) / 2,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

// Example usage
const pageNumber = 12; // Specify the number of pages you want
createPdfWithPageNumbers(pageNumber)
    .then((pdfBytes) => {
        const fs = require('fs');
        fs.writeFileSync('output.pdf', pdfBytes);
    })
    .catch(err => {
        console.error('Error creating PDF:', err);
    });
