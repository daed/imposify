# What is this doing and why would I do it?

This tool takes a PDF and prints it out so that it can be folded into a booklet.  It does this by reordering the pages.

Let's imagine we're creating a small booklet with four pages, printed on a single sheet of paper, which is then folded in half.  In your pdf file on your computer, the pages are all in order, from 1 to 4.  Imposify would reorder those pages so that they print out like the diagram below:


```
Front of the Sheet| Back of the Sheet
------------------|------------------
| Page 4 | Page 1 | Page 2 | Page 3 |
|        |        |        |        |
---------|--------|--------|---------

```

When folded, page 4 will be on the left (back cover) and page 1 will be on the right (front cover).  Likewise, the two pages on the back of the sheet will be the interior content.  This turns into a convenient pamphlet size that can be quickly mass produced on a home printer.
