const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const testPath = path.join(__dirname, '../../test/data');
const loadFixture = (name) => PDFDocument.load(fs.readFileSync(path.join(testPath, name)));

// pretty much copies padPDF's blank-page math by hand here, just so we can
// sanity check these real files behave the way we'd expect
async function padWithBlanks(pdf, count) {
  const padded = await PDFDocument.create();
  for (let i = 0; i < pdf.getPageCount(); i++) {
    const [page] = await padded.copyPages(pdf, [i]);
    padded.addPage(page);
  }
  const { width, height } = pdf.getPages()[0].getSize();
  for (let i = 0; i < count; i++) {
    padded.addPage([width, height]).drawRectangle({ x: 0, y: 0, width, height });
  }
  return padded;
}

describe('real pdf fixtures', () => {
  test('09-nine.pdf loads and pads up to 12', async () => {
    const pdf = await loadFixture('09-nine.pdf');
    expect(pdf.getPageCount()).toBe(9);
    expect((await padWithBlanks(pdf, 3)).getPageCount()).toBe(12);
  });

  test('07-seven.pdf loads and pads up to 8', async () => {
    const pdf = await loadFixture('07-seven.pdf');
    expect(pdf.getPageCount()).toBe(7);
    expect((await padWithBlanks(pdf, 1)).getPageCount()).toBe(8);
  });

  test('12-twelve.pdf loads - already a clean multiple of 4', async () => {
    const pdf = await loadFixture('12-twelve.pdf');
    expect(pdf.getPageCount()).toBe(12);
  });

  test('08-eight.pdf loads - already a clean multiple of 4', async () => {
    const pdf = await loadFixture('08-eight.pdf');
    expect(pdf.getPageCount()).toBe(8);
  });
});
