const textCleaner = (text) => {

    if (!text) return "";

    return text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/\u0000/g, "")
        .replace(/\s+/g, " ")
        .replace(/[ ]{2,}/g, " ")
        .trim();
};

export default textCleaner;