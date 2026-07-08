const { PDFDocument, PDFArray, PDFRawStream } = require("pdf-lib");
const zlib = require("zlib");

const {
  loadPDF,
  validatePDF,
  detectSpreadPages,
  splitSpreadPages,
  applySpreadDetection,
  padPDF,
  arrangePDF,
  createSpreads,
  creepShiftForSpread,
  savePDF,
} = require("./index.js");

// once a doc's been through save/load, the streams come back compressed
// (PDFRawStream instead of plain PDFContentStream); gotta inflate them
// before you can read the text back out
function decodeStreamText(streamObj) {
  if (streamObj instanceof PDFRawStream) {
    let bytes = streamObj.contents;
    try {
      bytes = zlib.inflateSync(Buffer.from(bytes));
    } catch (e) {}
    return Buffer.from(bytes).toString("latin1");
  }
  return streamObj.getContentsString();
}

// grabs the "Page N" label back off a page made by makeLabeledPdf (null
// means blank). only looks at a page's own content stream though, can't
// see through embedded XObjects
function getPageLabel(page) {
  const contents = page.node.Contents();
  const context = page.node.context;
  const streams = contents instanceof PDFArray
    ? contents.asArray().map((ref) => context.lookup(ref))
    : [contents];
  const text = streams.map(decodeStreamText).join("\n");
  const match = text.match(/<([0-9a-fA-F]+)>\s*Tj/);
  if (!match) return null;
  const decoded = Buffer.from(match[1], "hex").toString("latin1");
  const num = decoded.match(/Page (\d+)/);
  return num ? Number(num[1]) : null;
}

const getPageLabels = (pdf) => pdf.getPages().map(getPageLabel);

async function makeLabeledPdf(pageCount) {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.addPage([612, 792]);
    page.drawText(`Page ${i + 1}`, { x: 50, y: 700, size: 20 });
  }
  return pdf;
}

// [cover, interior spread, cover]. has to go through save/load first because
// embedPage (used by splitSpreadPages) doesn't seem to work right on pages
// that haven't been saved yet
async function makeSpreadTestPdf({ coverWidth = 306, coverHeight = 792, interiorWidthMultiplier = 2 } = {}) {
  const pdf = await PDFDocument.create();
  const cover1 = pdf.addPage([coverWidth, coverHeight]);
  cover1.drawText("Page 1", { x: 50, y: 700, size: 20 });

  const interiorWidth = coverWidth * interiorWidthMultiplier;
  const interior = pdf.addPage([interiorWidth, coverHeight]);
  interior.drawText("Page 2", { x: 50, y: 700, size: 20 });
  interior.drawText("Page 3", { x: interiorWidth / 2 + 50, y: 700, size: 20 });

  const cover2 = pdf.addPage([coverWidth, coverHeight]);
  cover2.drawText("Page 4", { x: 50, y: 700, size: 20 });

  return PDFDocument.load(await pdf.save());
}

async function makeUniformTestPdf(pageCount = 4) {
  return PDFDocument.load(await (await makeLabeledPdf(pageCount)).save());
}

describe("PDF Pipeline", () => {
  it("loadPDF loads a pdf", async () => {
    const buffer = await (await makeLabeledPdf(4)).save();
    const pdf = await loadPDF(buffer);
    expect(pdf.getPageCount()).toBe(4);
  });

  it("loadPDF errors on an empty buffer", async () => {
    let result;
    try {
      result = await loadPDF(new Uint8Array());
    } catch (error) {
      result = { success: false, message: error.message };
    }
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/No PDF header|Failed to parse/);
  });

  it("validatePDF passes a real pdf straight through", async () => {
    const pdf = await loadPDF(await (await makeLabeledPdf(4)).save());
    const result = await validatePDF(pdf);
    expect(result.getPageCount()).toBe(4);
  });

  it("padPDF rounds 5 pages up to 8", async () => {
    const padded = await padPDF(await makeLabeledPdf(5), true);
    expect(padded.getPageCount()).toBe(8);
  });

  it("padPDF rounds 7 pages up to 8 too", async () => {
    const padded = await padPDF(await makeLabeledPdf(7), true);
    expect(padded.getPageCount()).toBe(8);
  });

  it("arrangePDF doesn't change the page count, LTR or RTL", async () => {
    const padded = await padPDF(await makeLabeledPdf(4));
    expect((await arrangePDF(padded, false)).getPages().length).toBe(4);
    expect((await arrangePDF(padded, true)).getPages().length).toBe(4);
  });

  it("createSpreads pairs pages up two to a sheet", async () => {
    const padded = await padPDF(await makeLabeledPdf(4));
    const spreads = await createSpreads(await arrangePDF(padded));
    expect(spreads.getPageCount()).toBe(2);
  });

  it("savePDF hands back real bytes", async () => {
    const saved = await savePDF(await makeLabeledPdf(4));
    expect(saved).toBeInstanceOf(Uint8Array);
    expect(saved.length).toBeGreaterThan(0);
  });

  it("the whole chain works end to end", async () => {
    const buffer = await (await makeLabeledPdf(4)).save();
    let result = await loadPDF(buffer);
    result = await validatePDF(result);
    result = await padPDF(result);
    result = await arrangePDF(result);
    result = await createSpreads(result);
    result = await savePDF(result);
    const resultPdf = await PDFDocument.load(result);
    expect(resultPdf.getPageCount()).toBe(2);
  });

  it("arrangePDF handles multi-signature counts, LTR and RTL", async () => {
    const pdf = await loadPDF(await (await makeLabeledPdf(8)).save());
    expect((await arrangePDF(pdf, false, 2)).getPageCount()).toBe(8);
    expect((await arrangePDF(pdf, true, 2)).getPageCount()).toBe(8);
  });
});

describe("page order", () => {
  it("padPDF pads just inside the back cover, not after it", async () => {
    const padded = await padPDF(await makeLabeledPdf(5), false);
    // last original page (5) has to stay last
    expect(getPageLabels(padded)).toEqual([1, 2, 3, 4, null, null, null, 5]);
  });

  it("front padding lands right after page 1, cover stays put", async () => {
    const padded = await padPDF(await makeLabeledPdf(5), true);
    expect(getPageLabels(padded)).toEqual([1, null, 2, 3, 4, null, null, 5]);
  });

  it("front padding warns when it has to pull in a whole extra sheet", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    // 8 pages is already a complete signature, so shifting by 1 for front
    // padding has no room to absorb into and needs a whole new sheet
    await padPDF(await makeLabeledPdf(8), true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/extra blank sheet/);
    warn.mockRestore();
  });

  it("...but stays quiet when there's slack to absorb the shift into, or padFront is off", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await padPDF(await makeLabeledPdf(7), true); // 7 + 1 shift page = 8, fits fine
    await padPDF(await makeLabeledPdf(8), false); // no shift requested at all
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("arrangePDF goes outside-in, odd pages on the right", async () => {
    const arranged = await arrangePDF(await makeLabeledPdf(8), false);
    // sheet 1 is (8,1) then (2,7), sheet 2 is (6,3) then (4,5); odd pages
    // on the right, even on the left, same as a real book
    expect(getPageLabels(arranged)).toEqual([8, 1, 2, 7, 6, 3, 4, 5]);
  });

  it("RTL just flips each pair, sheet order is the same", async () => {
    const arranged = await arrangePDF(await makeLabeledPdf(8), true);
    expect(getPageLabels(arranged)).toEqual([1, 8, 7, 2, 3, 6, 5, 4]);
  });

  it("pad + arrange together on an odd page count (6)", async () => {
    const padded = await padPDF(await makeLabeledPdf(6), false);
    const arranged = await arrangePDF(padded, false);
    expect(getPageLabels(arranged)).toEqual([6, 1, 2, null, null, 3, 4, 5]);
  });

  it("regression: the 7-page booklet from the bug report", async () => {
    // page 1 has to land on the right side, and the padding blank has to
    // sit just inside the back cover so page 7 still prints last; this
    // is literally the bug that got reported
    const padded = await padPDF(await makeLabeledPdf(7), false);
    const arranged = await arrangePDF(padded, false);
    expect(getPageLabels(arranged)).toEqual([7, 1, 2, null, 6, 3, 4, 5]);
  });

  it("each signature gets imposed on its own, not across the whole doc", async () => {
    const pdf = await makeLabeledPdf(8);
    expect(getPageLabels(await arrangePDF(pdf, false, 2))).toEqual([4, 1, 2, 3, 8, 5, 6, 7]);
    expect(getPageLabels(await arrangePDF(pdf, true, 2))).toEqual([1, 4, 3, 2, 5, 8, 7, 6]);
  });

  it("padPDF rounds up to a multiple of 4 * signatures, not just 4", async () => {
    const padded = await padPDF(await makeLabeledPdf(5), false, 2);
    expect(getPageLabels(padded)).toEqual([1, 2, 3, 4, null, null, null, 5]);
  });

  it("9 pages / 2 signatures rounds all the way up to 16", async () => {
    const padded = await padPDF(await makeLabeledPdf(9), false, 2);
    expect(getPageLabels(padded)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, null, null, null, null, null, null, null, 9,
    ]);
  });

  it("pad + arrange, 9 pages into 2 signatures", async () => {
    const padded = await padPDF(await makeLabeledPdf(9), false, 2);
    const arranged = await arrangePDF(padded, false, 2);
    expect(getPageLabels(arranged)).toEqual([
      8, 1, 2, 7, 6, 3, 4, 5, 9, null, null, null, null, null, null, null,
    ]);
  });

  it("arrangePDF bails out if the pages can't split evenly across signatures", async () => {
    const result = await arrangePDF(await makeLabeledPdf(8), false, 3);
    expect(result.success).toBe(false);
  });
});

describe("creep shift", () => {
  it("no shift on the outer sheet, more the deeper you go", () => {
    expect(creepShiftForSpread(0, 4, 5)).toBe(0); // sheet 1 (spreads 0-1)
    expect(creepShiftForSpread(1, 4, 5)).toBe(0);
    expect(creepShiftForSpread(2, 4, 5)).toBe(5); // sheet 2 (spreads 2-3)
    expect(creepShiftForSpread(3, 4, 5)).toBe(5);
  });

  it("resets per signature, and 0 just turns it off", () => {
    // 16 pages / 2 signatures = 4 spreads per signature
    expect(creepShiftForSpread(4, 4, 5)).toBe(0); // sheet 1 of signature 2
    expect(creepShiftForSpread(6, 4, 5)).toBe(5); // sheet 2 of signature 2
    expect(creepShiftForSpread(2, 4, 0)).toBe(0);
  });

  it("actually changes createSpreads' output when turned on", async () => {
    const arranged = await arrangePDF(await makeLabeledPdf(8), false);
    const flat = await createSpreads(await arrangePDF(await makeLabeledPdf(8), false), 1, 0);
    const shifted = await createSpreads(arranged, 1, 5);
    expect(flat.getPageCount()).toBe(shifted.getPageCount());
    expect(await flat.save()).not.toEqual(await shifted.save());
  });
});

describe("spread detection", () => {
  it("finds cover + double-wide interior + cover", async () => {
    expect(detectSpreadPages(await makeSpreadTestPdf())).toBe(true);
  });

  it("says no for a uniform-width doc, or fewer than 3 pages", async () => {
    expect(detectSpreadPages(await makeUniformTestPdf())).toBe(false);

    const doc = await PDFDocument.create();
    doc.addPage([306, 792]);
    doc.addPage([306, 792]);
    expect(detectSpreadPages(await PDFDocument.load(await doc.save()))).toBe(false);
  });

  it("wants interior pages close to double width - 1.2x no, 1.9x yes", async () => {
    expect(detectSpreadPages(await makeSpreadTestPdf({ interiorWidthMultiplier: 1.2 }))).toBe(false);
    expect(detectSpreadPages(await makeSpreadTestPdf({ interiorWidthMultiplier: 1.9 }))).toBe(true);
  });

  it("splitSpreadPages gets back to 4 normal-width pages", async () => {
    const split = await splitSpreadPages(await makeSpreadTestPdf({ coverWidth: 306, coverHeight: 792 }));
    expect(split.getPageCount()).toBe(4);
    for (const { width, height } of split.getPages().map((p) => p.getSize())) {
      expect(width).toBeCloseTo(306, 0);
      expect(height).toBeCloseTo(792, 0);
    }
  });

  it("...and leaves the cover pages alone", async () => {
    const split = await splitSpreadPages(await makeSpreadTestPdf());
    const labels = split.getPages().map(getPageLabel);
    // the split interior halves are embedded XObjects under the hood, and
    // getPageLabel can't see into those; had to check this one against
    // actual rendered output by hand instead
    expect(labels[0]).toBe(1);
    expect(labels[3]).toBe(4);
  });

  it("'off' never splits, even on an obvious match", async () => {
    const result = await applySpreadDetection(await makeSpreadTestPdf(), "off");
    expect(result.getPageCount()).toBe(3);
  });

  it("'on' splits anyway, even when detection would've said no", async () => {
    const pdf = await makeSpreadTestPdf({ interiorWidthMultiplier: 1.2 });
    expect(detectSpreadPages(pdf)).toBe(false);
    expect((await applySpreadDetection(pdf, "on")).getPageCount()).toBe(4);
  });

  it("'auto' only splits when it actually detects the pattern", async () => {
    const unchanged = await applySpreadDetection(await makeUniformTestPdf(), "auto");
    expect(getPageLabels(unchanged)).toEqual([1, 2, 3, 4]);

    const split = await applySpreadDetection(await makeSpreadTestPdf(), "auto");
    expect(split.getPageCount()).toBe(4);
  });

  it("a detected spread doc still imposes into a correct booklet", async () => {
    const normalized = await applySpreadDetection(await makeSpreadTestPdf(), "auto");
    const arranged = await arrangePDF(await padPDF(normalized, false), false);
    // 4 pages, already a multiple of 4, so it comes out as (4,1,2,3). middle
    // two are split halves hiding behind embedded XObjects so they show up
    // as null here; checked those against the actual rendered PDF by hand
    const labels = getPageLabels(arranged);
    expect(labels[0]).toBe(4);
    expect(labels[1]).toBe(1);
    expect(arranged.getPageCount()).toBe(4);
    const widths = arranged.getPages().map((p) => p.getSize().width);
    expect(widths.every((w) => Math.abs(w - 306) < 1)).toBe(true);
  });
});
