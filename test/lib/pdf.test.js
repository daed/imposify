import { PDFDocument } from 'pdf-lib';
import { loadPDF, foldPDF, renderPage, compositeTwoPages, createBookletPDF } from '../../src/lib/pdf.mjs';

// Mock the pdf-lib module
jest.mock('pdf-lib', () => ({
  PDFDocument: {
    load: jest.fn(),
    create: jest.fn(() => ({
      addPage: jest.fn(),
      copyPages: jest.fn(() => [{}]),
      getPages: jest.fn(() => new Array(4).fill({})), // Simulate a PDF with 4 pages
      embedPdf: jest.fn(() => [{}]),
      save: jest.fn(() => new ArrayBuffer(10)),
    })),
  },
}));

describe('PDF manipulation tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadPDF', () => {
    it('should load a PDF document from a URL', async () => {
      const mockPdfURL = 'http://example.com/test.pdf';
      const mockPdfDoc = {};
      PDFDocument.load.mockResolvedValue(mockPdfDoc);

      const result = await loadPDF(mockPdfURL);

      expect(PDFDocument.load).toHaveBeenCalledWith(mockPdfURL);
      expect(result).toEqual(mockPdfDoc);
    });
  });

  describe('foldPDF', () => {
    it('should fold the PDF correctly for a 4-page document', async () => {
      const mockPdf = await PDFDocument.create();
      const newPdf = await foldPDF(mockPdf);

      expect(newPdf.addPage).toHaveBeenCalledTimes(4); // Expect 4 pages to have been added in the new folded PDF
      // Additional assertions can be made regarding the order and content of the pages
    });
  });


  
  // Add more tests for renderPage, compositeTwoPages, and createBookletPDF following similar patterns

});

