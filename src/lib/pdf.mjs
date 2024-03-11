// pdf.js
import { PDFDocument, rgb } from 'pdf-lib';

export async function loadPDF(pdfURL) {
	return await PDFDocument.load(pdfURL);
}

export async function isPdfPrintedInSpread(pdf) {
	const pages = pdf.getPages();
	console.log("spread detection starts here");

	// Ensure there are enough pages to compare
	if (pages.length < 2) return false;
  
	const firstPage = pages[0];
	const lastPage = pages[pages.length - 1];
	
	const backInsideCoverIndex = pages.length - 2;
	const firstPageWidth = firstPage.getSize().width;
	const lastPageWidth = lastPage.getSize().width;
	let interiorPageWidth = pages[1].getSize().width; 
	const backInsideCoverWidth = pages[backInsideCoverIndex].getSize().width;
	
	console.log(`last page: page ${pages.length-1}:`);
	console.log(`firstPage.width: ${firstPageWidth}`);
	console.log(`pages[1].width: ${pages[1].getSize().width}`);
	console.log(`lastPage.width: ${lastPageWidth}`);
	console.log(`pages[${backInsideCoverIndex}].width: ${backInsideCoverWidth}`);

	// Early exit for very short documents
	if (pages.length < 4) {
	  // If it's less than 4 pages, check if the first/last pages are narrower (assuming they could be half-width covers)
	  console.log("less than 4 pages");
	  console.log(`spread return ${firstPageWidth < interiorPageWidth || lastPageWidth < backInsideCoverWidth}`);
	  return firstPageWidth < interiorPageWidth || lastPageWidth < backInsideCoverWidth;
	}
	const arePagesWider = (firstPageWidth < interiorPageWidth || lastPageWidth < interiorPageWidth);
  	if (arePagesWider) {
	  console.log(`interior page was wider ${interiorPageWidth} than first/last page ${firstPageWidth}/${lastPageWidth}`);
	  // Further validation to ensure consistency among interior pages
	  for (let i = 2; i < pages.length - 2; i++) {
		  if (pages[i].getSize().width !== interiorPageWidth) {
			console.log(`pages[${i}].width ${pages[i].getSize().width} !== interiorPageWidth: ${pages[i].getSize().width !== interiorPageWidth}`);
			console.log("spread return false");  
		  return false; // Found an inconsistency, not a spread
		}
	  }
	  console.log(``)
	  console.log("spread return true");
	  return true; // All checks passed, likely a spread
	}
	console.log("spread return false");  
	return false; // Default case, doesn't match the spread criteria
  }
  
async function splitPDFSpreads(pdf) {
  // Create a new PDF document
  const newPdfDoc = await PDFDocument.create();

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
      const [copiedPage] = await newPdfDoc.copyPages(pdf, [pageIndex]);
      newPdfDoc.addPage(copiedPage);
    }
  }
  
  // For non-spread pages, just copy the page as is
  console.log(`last page: ${pdf.getPageCount()-1}`);
  const [copiedLastPage] = await newPdfDoc.copyPages(pdf, [pdf.getPageCount()-1]);
  newPdfDoc.addPage(copiedLastPage);
  
  return newPdfDoc;
}

export async function foldPDF(pdf, start=0, end=0) {
	const len = getPDFLength(pdf);
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

function getPDFLength(pdfDoc) {
	return pdfDoc.getPages().length;
}

async function newPage(pdfDoc) {
    // Check if the document has at least two pages to get the dimensions from the second page
    if (pdfDoc.getPageCount() < 2) {
        console.error("The document does not have a second page.");
        return;
    }
    
    // Get the second page
    const secondPage = pdfDoc.getPages()[1];
    
    // Extract the width and height from the second page
    const width = secondPage.getWidth();
    const height = secondPage.getHeight();
    
    // Add a new blank page with the same dimensions as the second page
    const blankPage = pdfDoc.addPage([width, height]);
    
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

async function addPagesBeforeLast(pdfDoc, pages=1) {
    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();
    
    // Determine the number of pages in the original document
    const numberOfPages = pdfDoc.getPageCount();
    
    // Copy all pages from the original document to the new one, except for the last page
    for (let i = 0; i < numberOfPages - 1; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
    }
    
	while (pages > 0) {
		// Add the blank page to the new document before the last page of the original document
		newPage(newPdfDoc);
		pages--;
	}
    // Now, copy the last page of the original document to the new document
    const [lastPage] = await newPdfDoc.copyPages(pdfDoc, [numberOfPages - 1]);
    newPdfDoc.addPage(lastPage);
    
	return newPdfDoc;
}

export async function createBookletPDF(originalPdfBytes) {
	// load pdf -> split spreads -> pad pages -> reorder for stuff
	let originalPdfDoc = await PDFDocument.load(originalPdfBytes);

	if (await isPdfPrintedInSpread(originalPdfDoc)) {
		console.log("spread pages detected in pdf, splitting!");
		originalPdfDoc = await splitPDFSpreads(originalPdfDoc);
	}
	const len = originalPdfDoc.getPageCount();
	console.log(`initial pdf page count: ${len}`);
	// Calculate how many blank pages are needed to make the page count a multiple of 4
	let pagesToAdd = (4 - (len % 4)) % 4; // This ensures that we add pages only if needed
	console.log(`pages to add: ${pagesToAdd}`);
	if (pagesToAdd)	originalPdfDoc = await addPagesBeforeLast(originalPdfDoc, pagesToAdd);
	console.log(originalPdfDoc);
	console.log(`new pdf length: ${originalPdfDoc.getPageCount()}`);

	console.log("folding pdf");
	const foldedPdf = await foldPDF(originalPdfDoc);
	
	console.log("original pdf");
	console.log(originalPdfDoc);
	console.log("folded pdf");
	console.log(foldedPdf);

	const newPdfDoc = await PDFDocument.create();
	for (let i=0; i<foldedPdf.getPages().length; i+=2) {
		console.log(`getting pages ${i} and ${i+1}`);
		const [firstPage] = await newPdfDoc.embedPdf(foldedPdf, [i]);
		const [secondPage] = await newPdfDoc.embedPdf(foldedPdf, [i+1]);
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
