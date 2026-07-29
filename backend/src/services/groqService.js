// import groq from "../config/groq.js";

// const analyzePolicy = async (context, question = null) => {

//     let prompt;

//     // -----------------------------
//     // RAG Question Answering Mode
//     // -----------------------------
//     if (question) {

//         prompt = `
// You are an expert Legal AI assistant.

// Answer the user's question ONLY using the provided context.

// If the answer is not available in the context, reply exactly:

// "I couldn't find this information in the uploaded document."

// Question:
// ${question}

// Context:
// ${context}
// `;

//     }

//     // -----------------------------
//     // Document Analysis Mode
//     // -----------------------------
//     else {

//         prompt = `
// You are an expert Legal AI.

// Analyze the uploaded legal document.

// Return ONLY valid JSON.

// Do NOT return markdown.

// Do NOT wrap the response inside \`\`\`.

// Return exactly this JSON structure:

// {
//   "documentType":"",
//   "riskScore":0,
//   "summary":"",
//   "criticalClauses":[],
//   "userRights":[],
//   "companyRights":[],
//   "dataCollected":[],
//   "dataSharedWith":[],
//   "internationalTransfer":"",
//   "securityPractices":[],
//   "redFlags":[],
//   "recommendations":[]
// }

// Document:

// ${context}
// `;

//     }

//     const response = await groq.chat.completions.create({

//         model: "llama-3.3-70b-versatile",

//         messages: [
//             {
//                 role: "user",
//                 content: prompt
//             }
//         ],

//         temperature: 0.2

//     });

//     return response.choices[0].message.content;

// };

// export default analyzePolicy;



















// import groq from "../config/groq.js";

// const analyzePolicy = async (context, question = null) => {

//     let prompt;

//     if (question) {

//         prompt = `
// You are a Legal AI assistant.

// Answer ONLY from the provided context.

// If the answer is not found, reply:

// "I couldn't find this information in the uploaded document."

// Question:
// ${question}

// Context:
// ${context}
// `;

//     } else {

//         prompt = `
// You are an expert Privacy Policy and Terms & Conditions analyzer.

// Analyze the uploaded legal document.

// Return ONLY valid JSON.

// {
//     "documentType":"",
//     "riskScore":0,
//     "summary":"",
//     "dataCollected":[],
//     "sensitiveData":[],
//     "purposeOfCollection":[],
//     "thirdPartySharing":[],
//     "internationalTransfer":"",
//     "retentionPolicy":"",
//     "cookies":[],
//     "userRights":[],
//     "legalBasis":[],
//     "securityMeasures":[],
//     "redFlags":[],
//     "recommendations":[]
// }

// Risk Score Rules:

// 0-20 = Very Safe

// 21-40 = Low Risk

// 41-60 = Medium Risk

// 61-80 = High Risk

// 81-100 = Critical Risk

// Only return JSON.

// Document:

// ${context}

// `;

//     }

//     const response = await groq.chat.completions.create({

//         model: "llama-3.3-70b-versatile",

//         messages: [

//             {
//                 role: "user",
//                 content: prompt
//             }

//         ],

//         temperature: 0.2

//     });

//     return response.choices[0].message.content;

// };

// export default analyzePolicy;









import groq from "../config/groq.js";

const callGroq = async (prompt) => {

    const response = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [

            {
                role: "user",
                content: prompt
            }

        ],

        temperature: 0.2

    });

    return response.choices[0].message.content;

};

export const analyzeBatch = async (context) => {

    const prompt = `
You are a legal document analyzer.

Read ONLY this part of the document.

Return concise bullet summary.

Document:

${context}
`;

    return await callGroq(prompt);

};

export const generateFinalAnalysis = async (summaryContext) => {

    const prompt = `
You are an expert Privacy Policy analyzer.

Return ONLY valid JSON.

{
    "documentType":"",
    "riskScore":0,
    "summary":"",
    "dataCollected":[],
    "sensitiveData":[],
    "purposeOfCollection":[],
    "thirdPartySharing":[],
    "internationalTransfer":"",
    "retentionPolicy":"",
    "cookies":[],
    "userRights":[],
    "legalBasis":[],
    "securityMeasures":[],
    "redFlags":[],
    "recommendations":[]
}

Risk Score Rules

0-20 Very Safe
21-40 Low Risk
41-60 Medium Risk
61-80 High Risk
81-100 Critical Risk

Context:

${summaryContext}

Return JSON only.
`;

    return await callGroq(prompt);

};


export const askAI = async (context, question) => {

    const prompt = `
You are a Legal AI assistant.

Answer ONLY from the provided context.

Never use outside knowledge.

If the answer is not found, reply exactly:

"I couldn't find this information in the uploaded document."

Question:
${question}

Context:
${context}
`;

    return await callGroq(prompt);

};

export default generateFinalAnalysis;