// pdf.js
import { PDFDocument } from 'pdf-lib';


function print(pages) {
	return console.log(`front: (${pages[0]}, ${pages[3]}) back: (${pages[1]}, ${pages[2]})`);
}

export async function loadPDF(pdfURL) {
	return await PDFDocument.load(pdfURL);
}

export async function foldPDF(pdf, start=0, end=0) {
	const pdfData = pdf.getPages();
	const len = pdfData.length;
	console.log(`len: ${len}`);
	// unless specified, autodetect the end
	if (end === 0 && len > 2) {
		// -1 because zero-indexed
		end = len - 1;
	}

	// sanity check
	if (start > end) {
		console.error("Overran the page nubmers, something went wrong!");
		return;
	}
	
	// pdf length must be multiples of 4
	if (len % 4 != 0) {
		console.error("pdf is incorrect number of pages.  This will fail");
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
	const bytes = await newPdf.save();
	return bytes;
}

export async function renderPage(pdf, pageNumber, canvas) {
	const page = await pdf[pageNumber];
	const viewport = page.getViewport({ scale: 1.5 });
	canvas.height = viewport.height;
	canvas.width = viewport.width;

	const renderContext = {
		canvasContext: canvas.getContext('2d'),
		viewport
	};
	await page.render(renderContext).promise;
}

// test
const testPDFFilename = '../../test/test.pdf';

import fs from 'fs';
const data = await fs.promises.readFile(testPDFFilename);
const pdf = await loadPDF(data);
console.log("pdf: ");
console.log(pdf.length);
const res = await foldPDF(pdf)

fs.writeFile('./folded.pdf', res, (content, err) => {
	if (err) {
	  console.error(err);
	} else {
	  // file written successfully
	}
});