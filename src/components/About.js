import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function About() {
    const navigate = useNavigate();
    return (
        <div className="about">
            <Button onClick={() => navigate("/")}>                
                &lt;- back
            </Button>
            <h2>What is Imposify?</h2>
            <p>
                Imposify is a free and open-source PDF book imposition tool.  This means
                that it transforms a normal PDF file into a format that can be easily printed
                as a book.  The process of imposition rearranges the pages of the PDF so
                that when printed and folded, the pages appear in the correct order.
            </p>

            <h2>Okay but what does Imposify actually do?</h2>
            <p>
                Imposify does three things to help you print your PDF as a book:
            </p>
            <ol>
                <li>it "shuffles" the pages into correct printing order</li>
                <li>it composites two pages per sheet</li>
                <li>if the PDF page count isn't a multiple of 4, pad it out with blank pages</li>
            </ol>
            <h3>Wait, padding?</h3>
            <p>
                Yes, padding.  If you want to print a book, the number of pages must be a
                multiple of 4.  This is because each sheet of paper in a book has two pages
                on the front and two pages on the back.  If your PDF has an odd number of
                pages, Imposify will add blank pages to make it a multiple of 4.  It
                attempts to do this intelligently by adding the minimum number of pages
                to get to a multiple of 4, and then it will also add them at the end of
                the PDF, just inside the back cover.  This way, you can print your books
                with minimum fuss.
            </p>
            <h3>Okay, can you explain the "shuffling" and composite?</h3>
            <p>
                Think about printing a normal PDF file.  If you print it as-is, the pages will not
                be in the correct order for a book.  By default settings, your pages will
                typically occupy a single sheet of paper:
            </p>
            <img src="static/img/why0.drawio.png" className="img-center" alt="Default PDF Printing goes in order 1, 2, 3, 4..." width="500" />

            <p>
                This is because each page of the PDF is printed on a separate sheet of
                paper in order:  1, 2, 3, 4, etc.  Even if you duplex them, you will still
                end up with a stack of sheets that are in the order 1, 2, 3, 4, etc.
            </p>

            <p>
                This is fine for a handout you'll put a staple through, but not for a book.
                If you want a proper book that you can fold in half and even bind, then you
                need your pages in a different order so that when you open the book, the
                pages appear next to each other in the correct sequence:
            </p>
            <img src="static/img/why.book.drawio.png" className="img-center" alt="Imposed PDF Printing goes in order 4, 1, 2, 3..." width="500" />
            <p>
                This actually prints the pages in an "outside-in" order, two per side.  An
                eight-page book would print like this when printed in an imposed format:
            </p>
            <table>
                <tr>
                    <th>Sheet</th>
                    <th>Front</th>
                    <th>Back</th>
                </tr>
                <tr>
                    <td>1</td>
                    <td>Pages 8, 1</td>
                    <td>Pages 2, 7</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Pages 6, 3</td>
                    <td>Pages 4, 5</td>
                </tr>
            </table>

            <p>
                This produces a set of sheets that become a book when folded in half.  Many
                higher end printers can actually print this way, if you know where to find the
                settings to set it up to do this.  However, this process varies by printer
                model and is not always available.
            </p>

            <p>
                Instead of operating at the printer driver level, Imposify operates at a <b>PDF
                file level</b>.  It takes in a normal PDF file as input, and the output is an
                imposed PDF file.  This is important because it makes your PDF <b>portable</b>.
                You can take the imposed PDF file and print it on any printer that supports
                duplex printing, even if that printer does not support the imposition settings
                you need.  You can even manually duplex the pages if you need to.
            </p>

            <p>
                A more exciting consequence of this is that, not only can you print your own
                books, but you can also share the imposed PDF with others and they can print it
                on their own printers.  This is a great way to distribute your work to or to
                collaborate with others on a project!  No print shop needed.
            </p>
            <h2>I have questions/bugs/feature requests!</h2>
            <p>
                Great!  Imposify is an open-source project, and I welcome your
                feedback.  PRs are also welcome.  You can find the source code on&nbsp;
                <a href="https://github.com/daed/imposify">GitHub</a>.
            </p>
            <Button onClick={() => navigate("/")}>                
                &lt;- back
            </Button>
        </div>
    );
}