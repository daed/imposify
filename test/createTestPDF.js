const pdfLib = require('pdf-lib');
const fs = require('node:fs');

const pages = 40;


async function main() {
    // PDF Creation
    const pdfDoc = await pdfLib.PDFDocument.create();
    
    for (let i=0; i<pages; i++) {
        const page = pdfDoc.addPage();
        page.drawText(i.toString());
    }
    const pdfBytes = await pdfDoc.save();
    fs.writeFile('./test.pdf', pdfBytes, (content, err) => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
    });
}

main();
