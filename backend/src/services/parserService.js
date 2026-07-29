import fs from "fs";
import pdfParse from "pdf-parse";

const parserService = async (filePath) => {
    try {
        const pdfBuffer = fs.readFileSync(filePath);

        const data = await pdfParse(pdfBuffer);

        const cleanedText = data.text
            .replace(/\r\n/g, "\n")
            .replace(/\n{2,}/g, "\n")
            .replace(/[ \t]+/g, " ")
            .trim();

        return cleanedText;

    } catch (error) {
        throw new Error(`PDF Parsing Failed: ${error.message}`);
    }
};

export default parserService;