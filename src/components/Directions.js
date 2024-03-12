import React from "react";
import { Box } from "@mui/material";

const Directions = () => {
    return (
        <Box class="full-mobile" textAlign="left" maxWidth="40%">
            <Box class="hidden-mobile" textAlign="left">
                <h3>
                    Info
                </h3>
                <p>
                    This is a <a href="https://en.wikipedia.org/wiki/Imposition">book imposition</a> tool,
                    intended to take a normal pdf paged from 1-whatever in order and rearrange
                    the pages so that they can be folded together into a <a href="https://en.wikipedia.org/wiki/Section_(bookbinding)">signature</a> and be
                    ordered correctly from the front page to the back.
                </p>
                <p>
                    This imposition tool works best with PDFs that are multiples of 4 pages long.  If
                    imposing a PDF of a different length, it will pad out the PDF with blank white pages.
                    It sticks these pages at the end of the PDF, just inside the back cover.  It only
                    does two page imposition, which is a very comfortable size for US Letter size printing.
                    It can only create a single signature.  It will only impose in left-to-right order.  
                </p>
                <p>
                    If there are additional features you are interested in, please let me know via
                    the Github link below!
                </p>
            </Box>
            <Box>
                <h3>
                    Directions
                </h3>
                <ol>
                    <li>
                        Click Open PDF to begin (or now drag and drop a PDF!)
                    </li>
                    <li>
                        Select PDF file from local computer
                    </li>
                    <li>
                        Click download to get and enjoy the pretty preview
                    </li>
                    <li>
                        (manual duplex only)
                        Set printer settings to only print odd pages and print
                    </li>
                    <li>
                        (manual duplex only)
                        Take stack of papers, flip upside down, and reinsert into printer tray
                    </li>
                </ol>
            </Box>
        </Box>
    )
}

export default Directions;