// Converts Blob Array Buffer to Base64 type
export async function arrayBufferToBase64(buffer: ArrayBuffer) {
    const binary = new Uint8Array(buffer);
    let base64String = '';
    for (let i = 0; i < binary.length; i++) {
        base64String += String.fromCharCode(binary[i]);
    }
    return btoa(base64String);
}

// Define variables for Document Intelligence
const customDocumentIntelligenceObject = (modelId?: string, resultId?: string) => {
    const apiVersion = "2023-07-31"
    const analyzeDocumentUrl = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT + "/formrecognizer/documentModels/" + modelId + ":analyze?api-version=" + apiVersion + "&locale=en-GB";
    const analyzeResultUrl = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT + "/formrecognizer/documentModels/" + modelId + "/analyzeResults/" + resultId + "?api-version=" + apiVersion + ""
    const diHeaders = {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY
    }

    return {
        analyzeDocumentUrl,
        analyzeResultUrl,
        diHeaders
    }
}

// Function for Document Intelligence Analyze Document
export async function customBeginAnalyzeDocument(modelId: string, base64String: string) {
    
    const diParam = customDocumentIntelligenceObject(modelId);
    
    // Document Intelligence URL
    const analyzeDocumentUrl = diParam.analyzeDocumentUrl;

    // Document Intelligence Headers
    const analyzeDocumentHeaders = diParam.diHeaders;

    // Document Intelligence Body
    const analyzeDocumentBody = {
        'base64Source': base64String
    }

    try {
        // Analyze Document
        const response = await fetch(analyzeDocumentUrl, {
            method: 'POST',
            headers: analyzeDocumentHeaders,
            body: JSON.stringify(analyzeDocumentBody),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze document. '+ response.statusText);
        }

        const resultId = response.headers.get('apim-request-id'); // Get Operation Location or APIM request Id from header

        if(resultId != null)
        {
            return await customGetAnalyzeResult(modelId, resultId);
        }

        throw new Error('Failed to get Result ID. Status: ' + response.status)
    }
    catch (e) {
        console.error('Error at BeginAnalyzeDocument:', e);
    }
}

async function customGetAnalyzeResult(modelId: string, resultId: string) {

    const diParam = customDocumentIntelligenceObject(modelId, resultId);

    // Document Intelligence URL
    const analyzeResultUrl = diParam.analyzeResultUrl;

    // Document Intelligence Headers
    const analyzeDocumentHeaders = diParam.diHeaders;

    try{

        let operationStatus;
        let analyzedResult;

        while(!operationStatus || operationStatus !== "succeeded"){

            // Get Analyze Result
            const response = await fetch(analyzeResultUrl, {
                method: 'GET',
                headers: analyzeDocumentHeaders
            });

            if (!response.ok) {
                throw new Error('Failed to fetch result.'+ response.json);
            }

            const responseBody = await response.json();
            
            // Retrieve the operation status from the response body
            operationStatus = responseBody.status;

            if(operationStatus == "succeeded"){
                analyzedResult = responseBody.analyzeResult;
            }

            // If the operation is not completed, wait for a certain period before polling again
            if (operationStatus !== 'succeeded') {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            }

        }

        return analyzedResult;        
    }
    catch(e){
        console.error('Error at AnalyzeResult', e);
    }
}