# pdf-flipper
#### a free pdf imposition tool

## About

pdf-flipper is a <a href="https://en.wikipedia.org/wiki/Imposition">book imposition</a>
tool, intended to take a normal pdf paged from 1 to whatever in order and rearrange
the pages so that they can be folded together into a <a href="https://en.wikipedia.org/wiki/Section_(bookbinding)">signature</a> and still be ordered correctly from the front page to the back.

This tool is available for free at <a href="https://imposify.com/">imposify.com</a>.

pdf-flipper works best with PDFs that are multiples of 4 pages long. If imposing a PDF of a different length, it will pad out the PDF with blank white pages. It sticks these pages at the end of the PDF, just inside the back cover. 

Currently it only does two page imposition, which is a very comfortable size for US Letter size printing. 

It can only create a single signature. 

It will only impose in left-to-right order.

This tool is sponsored in part by <a href="https://cfzine.thecomicseries.com/">Comic Fury Zine</a>, a free comics anthology.

## Features and Roadmap

[x] Simple two-page imposition

[x] Preview panel

[x] Automatic PDF padding

[ ] Configurable number of pages per sheet

[ ] Multiple signatures

[ ] Automated Testing

[ ] N-up fine tuning

[ ] Creep adjustment

[ ] Bleed and Trim adjustments

[ ] Printing marks

[ ] Proofing options

## Development

The project is a simple React app make with create-react-app.  The configs are unejected.   Material UI is used heavily.  

PDF.js is used for preview rendering, and pdf-lib handles the pdf manipulation itself.

Run `yarn start` to start up in development mode.

Run `yarn build` to produce production files.

## Contributors

daed

Funkh0user