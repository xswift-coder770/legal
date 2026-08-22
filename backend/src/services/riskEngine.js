const calculateRisk = (analysis) => {

    let score = 0;

    score += analysis.redFlags?.length * 10 || 0;

    score += analysis.thirdPartySharing?.length * 5 || 0;

    score += analysis.sensitiveData?.length * 8 || 0;

    if (
        analysis.internationalTransfer &&
        analysis.internationalTransfer !== ""
    ) {

        score += 10;

    }

    if (
        !analysis.retentionPolicy ||
        analysis.retentionPolicy === ""
    ) {

        score += 15;

    }

    if (score > 100) {

        score = 100;

    }

    return score;

};

export default calculateRisk;