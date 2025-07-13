import { PDFDocument, rgb } from 'pdf-lib';

// Adds a blank white page matching the size of the second page
const addBlankPage = (pdf, insertIndex=-1) => {
    const pages = pdf.getPages();
    if (pages.length < 2) return;
    const { width, height } = pages[1].getSize();
    let blank;
    if (insertIndex >= 0) {
        blank = pdf.insertPage(insertIndex, [width, height]);
    } else {
        blank = pdf.addPage([width, height]);
    }
    blank.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
};

// Combines two embedded pages into a spread
const makeSpread = (pdf, left, right) => {
    const width = left.width, height = left.height;
    const spread = pdf.addPage([width * 2, height]);
    spread.drawPage(left, { x: 0, y: 0, width, height });
    spread.drawPage(right, { x: width, y: 0, width, height });
};

export default class Impose {
    pdf = null;

    async loadPDF(data) {
        this.pdf = await PDFDocument.load(data);
    }

    length() {
        return this.pdf.getPageCount();
    }

    async addPadding(padFront=false) {
        const pdf = this.pdf;
        const newPdf = await PDFDocument.create();
        const [frontPage] = await newPdf.copyPages(pdf, [0]);
        newPdf.addPage(frontPage);
        console.log("adding content pages");
        const n = pdf.getPageCount();
        for (let i = 1; i < n - 1; i++) {
            const [p] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(p);
        }
        console.log("adding back padding");
        console.log(`Total pages before padding: ${n}`);
        // Pad to multiple of 4
        let toAdd = ((4 - (n % 4)) % 4);
        if (padFront) {
            console.log("adding one fewer pages for padding because of front padding");
            addBlankPage(newPdf, 1); // Add a blank page at the front
            toAdd -= 1; // If we added front padding, we need one less blank page
        }
        console.log(`Adding ${toAdd} blank pages to make total a multiple of 4`);
        while (toAdd--) addBlankPage(newPdf);
        console.log("adding last page");
        const [last] = await newPdf.copyPages(pdf, [n-1]);
        newPdf.addPage(last);
        console.log(`Total pages after padding: ${newPdf.getPageCount()}`);
        this.pdf = newPdf;
    }

    async foldPDF() {
        const n = this.length();
        if (n % 4 !== 0) throw new Error("Page count must be multiple of 4");
        const newPdf = await PDFDocument.create();
        let start = 0, end = n - 1;
        while (start < end) {
            const [a] = await newPdf.copyPages(this.pdf, [end]);
            const [b] = await newPdf.copyPages(this.pdf, [start]);
            const [c] = await newPdf.copyPages(this.pdf, [start + 1]);
            const [d] = await newPdf.copyPages(this.pdf, [end - 1]);
            newPdf.addPage(a); newPdf.addPage(b); newPdf.addPage(c); newPdf.addPage(d);
            start += 2; end -= 2;
        }
        this.pdf = newPdf;
    }

    async createSignature(pagesPerSignature=4) {
    }

    async createBooklet({ rtl=false, signatures=1, padFront=false } = {}) {
        await this.addPadding(padFront);
        // break up the PDFs into signatures
        // pages per signature = total PDF length / signatures
        const pagesPerSignature = this.length() / signatures;
        // create a new PDF for each signature
        const newPdf = await PDFDocument.create();
        let pages = [];
        for (let i = 0; i < signatures; i++) {
            const start = i * pagesPerSignature;
            const end = start + pagesPerSignature - 1;
            const signaturePages = [];
            // need to grab pages up to pagesPerSignature
            for (let j = start; j <= end; j++) {
                if (j < this.pdf.getPageCount()) {
                    const [p] = await newPdf.copyPages(this.pdf, [j]);
                    signaturePages.push(p);
                }
            }
            pages.push(signaturePages);
        }
        if (rtl) {
            const revPdf = await PDFDocument.create();
            for (let i = this.pdf.getPageCount() - 1; i >= 0; i--) {
                const [p] = await revPdf.copyPages(this.pdf, [i]);
                revPdf.addPage(p);
            }
            this.pdf = revPdf;
        }
        await this.foldPDF();
        const outPdf = await PDFDocument.create();
        pages = this.pdf.getPages();
        for (let i = 0; i < pages.length; i += 2) {
            const [left] = await outPdf.embedPdf(this.pdf, [i]);
            const [right] = await outPdf.embedPdf(this.pdf, [i + 1]);
            makeSpread(outPdf, left, right);
        }
        return await outPdf.save();
    }
}
