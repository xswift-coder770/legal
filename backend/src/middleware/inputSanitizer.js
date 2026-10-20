// ============================================
// Prompt Injection & Input Sanitization
// ============================================

/**
 * Dangerous patterns that indicate prompt injection attempts.
 * These are common jailbreak / injection phrases found in
 * adversarial prompts embedded inside PDF documents or user input.
 */
const INJECTION_PATTERNS = [
    // Role override attempts
    /ignore\s+(all\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|context|rules?)/gi,
    /disregard\s+(all\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|context|rules?)/gi,
    /forget\s+(all\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|context|rules?)/gi,
    /you\s+are\s+now\s+(a\s+)?(new|different|another|my)/gi,
    /act\s+as\s+(if\s+you\s+are\s+)?(a\s+)?/gi,
    /pretend\s+(to\s+be|you\s+are)/gi,
    /roleplay\s+as/gi,
    /your\s+new\s+(role|persona|instructions?|task)/gi,

    // System prompt leaking / override
    /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions?|context)/gi,
    /print\s+(your|the)\s+(system\s+)?(prompt|instructions?|context)/gi,
    /show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions?|context)/gi,
    /what\s+(are|were)\s+(your|the)\s+instructions?/gi,

    // Direct command injection markers
    /\[SYSTEM\]/gi,
    /\[INST\]/gi,
    /<\|system\|>/gi,
    /<\|user\|>/gi,
    /<\|assistant\|>/gi,
    /<<SYS>>/gi,
    /\[\/INST\]/gi,
];

/**
 * Sanitize a text string by detecting and removing prompt injection patterns.
 * Returns the cleaned string and a flag indicating if injection was detected.
 */
export const sanitizeText = (text) => {

    if (!text || typeof text !== "string") {
        return { sanitized: "", injectionDetected: false };
    }

    let sanitized = text;
    let injectionDetected = false;

    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(sanitized)) {
            injectionDetected = true;
            sanitized = sanitized.replace(pattern, "[REDACTED]");
        }
    }

    return { sanitized, injectionDetected };
};

/**
 * Express middleware that sanitizes req.body.question
 * before it reaches the controller.
 */
export const sanitizeQuestion = (req, res, next) => {

    const { question } = req.body;

    if (!question || typeof question !== "string") {
        return next();
    }

    // Length limit — prevent token flooding
    const MAX_QUESTION_LENGTH = 1000;

    if (question.length > MAX_QUESTION_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `Question is too long. Maximum allowed is ${MAX_QUESTION_LENGTH} characters.`,
        });
    }

    const { sanitized, injectionDetected } = sanitizeText(question);

    if (injectionDetected) {
        console.warn("⚠️  Prompt injection attempt detected in user question.");
    }

    req.body.question = sanitized;

    next();

};
