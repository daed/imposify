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
	return newPdf
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

export async function compositeTwoPages(firstPage, secondPage, workingPdf) { 
  const width = firstPage.width;
  const height = firstPage.height;
  console.log(`compositeTwoPages: page width: ${width}, ${height}`);
  // Create a new page with double the width of the original to hold two pages side by side
  const newPage = workingPdf.addPage([width * 2, height]);

  console.log("rendering first page");
  // Draw the first page on the left half
  newPage.drawPage(firstPage, {
    x: 0,
    y: 0,
    width: width,
    height: height,
  });
  
  console.log("rendering second page");
  // Draw the second page on the right half
  newPage.drawPage(secondPage, {
    x: width, // Offset by the width of the first page
    y: 0,
    width: width,
    height: height,
  });
  
}

export async function createBookletPDF(originalPdfBytes) {
	const originalPdfDoc = await PDFDocument.load(originalPdfBytes);
	console.log("folding pdf");
	const foldedPdf = await foldPDF(originalPdfDoc);
	
	const newPdfDoc = await PDFDocument.create();
	console.log("original pdf");
	console.log(originalPdfDoc);
	console.log("folded pdf");
	console.log(foldedPdf);

	for (let i=0; i<foldedPdf.getPages().length; i+=2) {
		console.log(`getting pages ${i} and ${i+1}`);
		const [firstPage] = await newPdfDoc.embedPdf(foldedPdf, [i]);
		const [secondPage] = await newPdfDoc.embedPdf(foldedPdf, [i+1]);
		
		//const [firstPage] = await newPdfDoc.copyPages(foldedPdf, [i]);
		//const [secondPage] = await newPdfDoc.copyPages(foldedPdf, [i+1]);
		console.log("pdf page:");
		console.log(firstPage);
		await compositeTwoPages(firstPage, secondPage, newPdfDoc);
		console.log(`composited ${i} and ${i+1}`);
	}
	// Serialize the PDFDocument to bytes
	const pdfBytes = await newPdfDoc.save();
	// Here, you can save the pdfBytes to a file, or return it from a server endpoint, etc.
	return pdfBytes;
	
}
