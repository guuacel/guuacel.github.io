# Extraction and translation notes

- Source classification: selectable-text PDF (`pdf-text`).
- The full 32-page document was text-extracted and the algorithm pages were visually checked against rendered PNGs.
- This is a targeted reader because the user explicitly requested the research question, motivation, algorithms, and blog material rather than a full translation.
- Formula glyphs in raw `pdftotext` output occasionally suffered font-encoding mojibake. Figures 2, 3, and 5 were therefore checked visually against PDF pages 9 and 21.
- Figure crops are tight crops of the original user-provided PDF; no figures were redrawn.
- Page references use the printed PDF page numbers, which match the relevant rendered pages for Figures 2, 3, and 5.
- Terminology was normalized according to the terminology table in `paper.md`.
- No substantive uncertainty remains in the formulas implemented in the accompanying Charm-Crypto module.
