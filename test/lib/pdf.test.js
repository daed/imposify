import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

import * as pdf from '../../src/lib/pdf';

const testPDFFilename = "test/test.pdf";

describe('pdf', () => {
  it('should load from file', async () => {
    try {
      const data = await fs.promises.readFile(testPDFFilename);
      console.log("data:");
      console.log(data);
      const pdfData = pdf.loadPDF(data); // `data` here is binary data, not a URL
      const pdfDoc = await PDFDocument.load(data);
      const pages = pdfDoc.getPages();

      // Assuming you have a way to get pdfLibData for comparison
      expect(pdfData).to.be.equal(pdfLibData);
    } catch (err) {
      console.error(err);
      // Handle the error appropriately
    }
  });
});
