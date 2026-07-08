const { PDFDocument } = require('pdf-lib');

async function loadPDF(data) {
  const pdf = await PDFDocument.load(data);
  if (!pdf || pdf.getPageCount() === 0) {
    return { success: false, message: 'PDF document is empty or invalid' };
  }
  return pdf;
}

async function validatePDF(pdf) {
  if (!pdf || pdf.getPageCount() === 0) {
    return { success: false, message: 'PDF document is empty or invalid' };
  }
  return pdf;
}

const { rgb } = require('pdf-lib');

const WIDTH_TOLERANCE = 0.15;
const isApprox = (a, b) => Math.abs(a - b) <= b * WIDTH_TOLERANCE;

// basically: is the first page and last page a normal width, but everything
// in between is twice as wide?  that usually means somebody exported a PDF
// where the inside pages are already pre-made spreads.  if so we gotta split
// those back apart with splitSpreadPages() or the rest of this is gonna be wrong
function detectSpreadPages(pdf) {
  const pages = pdf.getPages();
  if (pages.length < 3) return false;

  const first = pages[0].getSize();
  const last = pages[pages.length - 1].getSize();
  if (!isApprox(first.width, last.width) || !isApprox(first.height, last.height)) {
    return false;
  }

  const coverWidth = (first.width + last.width) / 2;
  const interior = pages.slice(1, -1);
  return interior.every((page) => {
    const { width, height } = page.getSize();
    return isApprox(width, coverWidth * 2) && isApprox(height, first.height);
  });
}

// cuts every inside page in half so we're back to normal single pages
// (undoes whatever pre-made-spread thing was going on).  leaves the first
// and last page alone, those should already be normal width.
async function splitSpreadPages(pdf) {
  const pageCount = pdf.getPageCount();
  const newPdf = await PDFDocument.create();

  for (let i = 0; i < pageCount; i++) {
    const page = pdf.getPage(i);
    if (i === 0 || i === pageCount - 1) {
      const [copied] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copied);
      continue;
    }

    const { width, height } = page.getSize();
    const half = width / 2;
    const leftEmbed = await newPdf.embedPage(page, { left: 0, bottom: 0, right: half, top: height });
    const rightEmbed = await newPdf.embedPage(page, { left: half, bottom: 0, right: width, top: height });

    const leftPage = newPdf.addPage([half, height]);
    leftPage.drawPage(leftEmbed, { x: 0, y: 0, width: half, height });

    const rightPage = newPdf.addPage([half, height]);
    rightPage.drawPage(rightEmbed, { x: 0, y: 0, width: half, height });
  }

  // found this one the hard way; if you try to embed one of these split
  // pages again later (createSpreads does that), you get corrupted/mixed up
  // content out the other end.  pdf-lib seems to need an actual save+load
  // round trip before it treats an embedded page as "real", otherwise stuff
  // further down the pipeline breaks in ways that are annoying to debug.
  // so just doing that here to be safe, no clue if there's a cleaner way.
  return PDFDocument.load(await newPdf.save());
}

// off = leave it alone, on = split no matter what, auto = only split if
// detectSpreadPages() above thinks it looks like the spread pattern
async function applySpreadDetection(pdf, mode = 'auto') {
  if (mode === 'off') return pdf;
  if (mode === 'on') return splitSpreadPages(pdf);
  return detectSpreadPages(pdf) ? splitSpreadPages(pdf) : pdf;
}

async function padPDF(pdf, padFront = false, signatures = 1) {
  try {
    const pageCount = pdf.getPageCount();
    const newPdf = await PDFDocument.create();

    const pages = pdf.getPages();
    for (let i = 0; i < pageCount; i++) {
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);
    }

    const { width, height } = pages[0].getSize();
    const addBlankAt = (index) => {
      const blank = index === undefined
        ? newPdf.addPage([width, height])
        : newPdf.insertPage(index, [width, height]);
      blank.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
    };

    const chunkSize = 4 * signatures;

    if (padFront) {
      if (pageCount % chunkSize === 0) {
        // if the page count was already a clean multiple of 4 (or whatever
        // chunkSize is), shifting everything over by one for front padding
        // means we now need a whole extra blank sheet just to get back to
        // a clean number again.  not really a bug, more just unavoidable
        // math; there just wasn't any slack room to absorb the shift into.
        console.warn(
          `Front padding added an extra blank sheet: this document's ${pageCount} pages already formed complete signatures, so shifting by one page required a whole new sheet to stay foldable.`
        );
      }
      // has to be index 1, NOT 0; if you stick it at 0 you end up blanking
      // out the cover page instead of shifting past it.  learned that one
      // the hard way too.
      addBlankAt(1);
    }

    // gotta insert this right before the last page, not just tack it onto
    // the end, otherwise the actual last page isn't the last page anymore
    // and your back cover ends up wrong
    const toAdd = (chunkSize - (newPdf.getPageCount() % chunkSize)) % chunkSize;
    const lastPageIndex = newPdf.getPageCount() - 1;
    for (let i = 0; i < toAdd; i++) addBlankAt(lastPageIndex);

    return newPdf;
  } catch (error) {
    return { success: false, message: 'Pad PDF failed: ' + error.message };
  }
}

async function arrangePDF(pdf, rtl=false, signatures=1) {
  const n = pdf.getPageCount();

  if (n % signatures !== 0 || (n / signatures) % 4 !== 0) {
    return {
      success: false,
      message: 'Page count must split evenly into signatures, each a multiple of 4',
    };
  }

  // each signature gets arranged on its own, not mixed in with the rest of the doc
  const pagesPerSignature = n / signatures;
  const arr = await PDFDocument.create();

  for (let sig = 0; sig < signatures; sig++) {
    const offset = sig * pagesPerSignature;
    let start = offset;
    let end = offset + pagesPerSignature - 1;

    while (start < end) {
      // odd pages always end up on the right, even pages on the left;
      // that's just how a book works when you open it up.  start is always
      // an odd page number and end is always even, so for the outside pair
      // of each sheet, "end" goes on the left and "start" goes on the right.
      const leftIdx = rtl ? start : end;
      const rightIdx = rtl ? end : start;
      const leftIdx1 = rtl ? end - 1 : start + 1;
      const rightIdx1 = rtl ? start + 1 : end - 1;

      const [a] = await arr.copyPages(pdf, [leftIdx]);
      const [b] = await arr.copyPages(pdf, [rightIdx]);
      const [c] = await arr.copyPages(pdf, [leftIdx1]);
      const [d] = await arr.copyPages(pdf, [rightIdx1]);

      arr.addPage(a);
      arr.addPage(b);
      arr.addPage(c);
      arr.addPage(d);

      start += 2;
      end -= 2;
    }
  }

  return arr;
}

// this is the "creep" thing; when you nest a bunch of folded sheets inside
// each other, the ones deeper in the stack end up sticking out a bit further
// before you trim the edges.  so we shift the deeper sheets in a little more
// to make up for it.  outermost sheet doesn't need any shift at all.
function creepShiftForSpread(spreadIndex, spreadsPerSignature, creepPerSheet) {
  const sheetIndex = Math.floor((spreadIndex % spreadsPerSignature) / 2);
  return sheetIndex * creepPerSheet;
}

async function createSpreads(pdf, signatures = 1, creepPerSheet = 0) {
    // same deal as splitSpreadPages; if the pages coming in already have
    // an embedded page inside them that hasn't gone through a save/load yet,
    // embedding them again down below comes out wrong.  just doing a
    // save+load here no matter what, to be safe, regardless of how many
    // times this doc already got copied around before it got to us.
    pdf = await PDFDocument.load(await pdf.save());

    let newPdf = await PDFDocument.create();

    const pageCount = pdf.getPageCount();
    const sourcePages = pdf.getPages();
    const spreadsPerSignature = (pageCount / signatures) / 2;

    for (let i = 0; i < pageCount; i += 2) {
      const leftPage = sourcePages[i];
      const rightPage = sourcePages[i + 1];

      const leftDims = leftPage.getSize();
      const rightDims = rightPage.getSize();

      const leftEmbeddedArray = await newPdf.embedPdf(pdf, [i]);
      const rightEmbeddedArray = await newPdf.embedPdf(pdf, [i + 1]);
      const leftEmbedded = leftEmbeddedArray[0];
      const rightEmbedded = rightEmbeddedArray[0];

      const spread = await newPdf.addPage([leftDims.width + rightDims.width, leftDims.height]);
      const shift = creepShiftForSpread(i / 2, spreadsPerSignature, creepPerSheet);

      // nudging it toward the middle to make up for creep, see the function above
      spread.drawPage(leftEmbedded, { x: shift, y: 0, width: leftDims.width, height: leftDims.height });
      spread.drawPage(rightEmbedded, { x: leftDims.width - shift, y: 0, width: rightDims.width, height: leftDims.height });
    }

    return newPdf;
}

async function savePDF(pdf) {
  return pdf.save();
}

module.exports = {
  loadPDF,
  validatePDF,
  detectSpreadPages,
  splitSpreadPages,
  applySpreadDetection,
  padPDF,
  arrangePDF,
  createSpreads,
  creepShiftForSpread,
  savePDF
};
