import { PDFDocument } from "pdf-lib";
import * as pdfFunctions from "./pdf/index.js";

const POINTS_PER_MM = 72 / 25.4;

export default class Impose {
  pdf = null;

  async loadPDF(data) {
    this.pdf = await PDFDocument.load(data);
  }

  length() {
    return this.pdf.getPageCount();
  }

  async createBooklet({ rtl = false, signatures = 1, padFront = false, creepPerSheetMm = 0, spreadDetection = 'auto' } = {}) {
    const normalized = await pdfFunctions.applySpreadDetection(this.pdf, spreadDetection);
    const padded = await pdfFunctions.padPDF(normalized, padFront, signatures);
    const arranged = await pdfFunctions.arrangePDF(padded, rtl, signatures);
    const creepPerSheet = creepPerSheetMm * POINTS_PER_MM;
    const spreads = await pdfFunctions.createSpreads(arranged, signatures, creepPerSheet);
    return pdfFunctions.savePDF(spreads);
  }
}
