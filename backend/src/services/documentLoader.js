import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const documentLoader = async (filePath) => {
    try {
        const data = new Uint8Array(fs.readFileSync(filePath));

        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
        });

        const pdf = await loadingTask.promise;

        console.log("Total Pages:", pdf.numPages);

        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

            const page = await pdf.getPage(pageNum);

            const textContent = await page.getTextContent();

            console.log(
                `Page ${pageNum} items:`,
                textContent.items.length
            );

            const pageText = textContent.items
                .map((item) => item.str)
                .join(" ");

            fullText += pageText + "\n";
        }

        console.log("Extracted Characters:", fullText.length);

        return fullText.trim();

    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default documentLoader;