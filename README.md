# imposify
![imposify logo looks like a sylized book icon](https://raw.githubusercontent.com/daed/imposify/develop/public/logobanner.png)

#### a free pdf imposition tool

## About

Imposify is a <a href="https://en.wikipedia.org/wiki/Imposition">book imposition</a>
tool, intended to take a normal pdf paged from 1 to whatever in order and rearrange
the pages so that they can be folded together into a <a href="https://en.wikipedia.org/wiki/Section_(bookbinding)">signature</a> and still be ordered correctly from the front page to the back.

This tool is available for free at <a href="https://imposify.com/">imposify.com</a>.

Imposify works best with PDFs that are multiples of 4 pages long. If imposing a PDF of a different length, it will pad out the PDF with blank white pages. It sticks these pages at the end of the PDF, just inside the back cover. 

Currently it only does two page imposition, which is a very comfortable size for US Letter size printing. 

It can only create a single signature. 

It can impose in both right-to-left and left-to-right order.

This tool is sponsored in part by <a href="https://cfzine.thecomicseries.com/">Comic Fury Zine</a>, a free comics anthology.

## Features and Roadmap

[x] Simple two-page imposition

[x] Preview panel

[x] Automatic PDF padding

[x] Spread/Page detection

[x] Drag and Drop

[x] RTL Print Order

[ ] Configurable number of pages per sheet

[ ] Multiple signatures

[ ] Automated Testing

[ ] N-up fine tuning

[ ] Creep adjustment

[ ] Bleed and Trim adjustments

[ ] Printing marks

[ ] Proofing options

## Development

The project is a simple React app made with create-react-app. The configs are unejected. Material UI is used heavily.

PDF.js is used for preview rendering, and pdf-lib handles the pdf manipulation itself.

## Getting Started

### Run in development mode
```
yarn start
```

### Build for production
```
yarn build
```

### Run tests
```
yarn test
```

The test directory contains test PDFs and test files for Core functionality.

## Serving Production Files

To serve the built production files:

```
cd build
python3 -m http.server 8000
```

Or use Node's built-in server:

```
cd build
node -e "const http = require('http'); http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(require('fs').readFileSync('index.html')) }).listen(8000)"
```

## Running Tests

Run all tests:

```
yarn test
```

Tests use Jest and are located in:
- test/ - Integration tests with test PDFs
- src/lib/pdf/pipeline.test.js - Core pipeline tests

## Contributors

daed

Funkh0user
