const chunkService = (
    text,
    chunkSize = 2000,
    overlap = 200
) => {

    const chunks = [];

    let start = 0;

    while (start < text.length) {

        const end = Math.min(
            start + chunkSize,
            text.length
        );

        chunks.push(text.slice(start, end));

        start += chunkSize - overlap;
    }

    return chunks;
};

export default chunkService;