import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';

export const processBridgeLetter = async (
    file: File,
    data: Record<string, string>
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target?.result;
            if (!content) {
                return reject(new Error("Failed to read file content"));
            }

            try {
                // 1. Load the DOCX file as a zip
                const zip = new PizZip(content as ArrayBuffer);

                // Auto-fix: Attempt to clean up common XML mess (like duplicate tags)
                try {
                    const docXmlPath = "word/document.xml";
                    const docFile = zip.file(docXmlPath);
                    if (docFile) {
                        let xmlContent = docFile.asText();
                        // Simple cleanup for double brackets often caused by copy-pasting
                        // This turns {{{{Keyword}}}} into {{Keyword}}
                        let cleanedXml = xmlContent
                            .replace(/\{\{\{\{/g, "{{")
                            .replace(/\}\}\}\}/g, "}}");

                        // Also handle mixed tags if they are adjacent in XML but split by docxtemplater?
                        // Actually, duplicate open tags error usually comes from literal characters in the XML.

                        if (cleanedXml !== xmlContent) {
                            console.log("Auto-fixed detected duplicate brackets in template.");
                            zip.file(docXmlPath, cleanedXml);
                        }
                    }
                } catch (cleanError) {
                    console.warn("Failed to auto-clean template:", cleanError);
                    // Continue with original content
                }

                // 2. Parse the template
                let doc;
                try {
                    doc = new Docxtemplater(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                        delimiters: {
                            start: '{{',
                            end: '}}'
                        }
                    });
                } catch (error: any) {
                    // Parsing error usually happens here
                    throw error;
                }

                // 3. Render the document (replace variables)
                doc.render(data);

                // 4. Output the result as an ArrayBuffer
                const out = doc.getZip().generate({
                    type: "arraybuffer",
                    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                });

                // 5. Convert the filled DOCX to HTML for preview
                // We use mammoth for this.
                const result = await mammoth.convertToHtml({ arrayBuffer: out });

                if (result.messages && result.messages.length > 0) {
                    console.warn("Mammoth warnings:", result.messages);
                }

                // 6. Extract header image (logo) since mammoth doesn't process headers
                let logoBase64 = '';
                try {
                    const outputZip = new PizZip(out);
                    const headerFile = outputZip.file("word/header1.xml");
                    const headerRels = outputZip.file("word/_rels/header1.xml.rels");

                    if (headerFile && headerRels) {
                        const headerXml = headerFile.asText();
                        const relsXml = headerRels.asText();

                        // Find the image relationship ID in the header
                        const embedMatch = headerXml.match(/r:embed="([^"]+)"/);
                        if (embedMatch) {
                            const relId = embedMatch[1];
                            // Find the image path from relationships
                            const targetMatch = relsXml.match(new RegExp(`Id="${relId}"[^>]*Target="([^"]+)"`));
                            if (targetMatch) {
                                const imagePath = "word/" + targetMatch[1].replace('../', '');
                                const imageFile = outputZip.file(imagePath);
                                if (imageFile) {
                                    const imageData = imageFile.asUint8Array();
                                    // Convert Uint8Array to base64 in chunks to avoid stack overflow
                                    let binary = '';
                                    const chunkSize = 8192;
                                    for (let i = 0; i < imageData.length; i += chunkSize) {
                                        const chunk = imageData.subarray(i, i + chunkSize);
                                        binary += String.fromCharCode.apply(null, Array.from(chunk));
                                    }
                                    const base64 = btoa(binary);
                                    const ext = imagePath.split('.').pop()?.toLowerCase() || 'png';
                                    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
                                    logoBase64 = `data:${mimeType};base64,${base64}`;
                                }
                            }
                        }
                    }
                } catch (headerError) {
                    console.warn("Could not extract header image:", headerError);
                }

                // 7. Build the final HTML with proper letter layout
                // The logo should float right and the first ~6 paragraphs should wrap around it
                const logoHtml = logoBase64
                    ? `<img src="${logoBase64}" alt="Humi Logo" style="float: right; max-width: 180px; height: auto; margin-left: 24px; margin-bottom: 12px;" />`
                    : '';

                // Insert the logo at the beginning of the content
                const finalHtml = logoHtml + result.value + '<div style="clear: both;"></div>';

                resolve(finalHtml);

            } catch (error: any) {
                console.error("Error processing document:", error);

                // Detailed Error Extraction
                const validationErrors =
                    error.properties?.errors ||
                    error.errors ||
                    (Array.isArray(error) ? error : []);

                if (validationErrors.length > 0) {
                    try {
                        const messages = validationErrors.map((e: any) => {
                            const explanation = e.properties?.explanation;
                            const msg = e.message;
                            const id = e.properties?.id;
                            if (id === 'multi_error') return null;
                            const context = e.properties?.context ? ` (near "...${e.properties.context.substr(0, 50)}...")` : "";
                            return `• ${explanation || msg}${context}`;
                        })
                            .filter(Boolean)
                            .filter((msg: string, index: number, self: string[]) => self.indexOf(msg) === index)
                            .join("\n");

                        if (messages.trim()) {
                            let finalMessage = `Template Issues Found:\n${messages}`;

                            // Add helpful tips for common errors
                            if (messages.includes("duplicate open tags") || messages.includes("duplicate close tags")) {
                                finalMessage += "\n\n💡 Possible Fix: This often happens when tags are copy-pasted or edited heavily in Word, causing hidden formatting issues.\n\nTry this:\n1. Delete the problematic tags entirely.\n2. Re-type them manually (e.g. {{CompanyName}}).\n3. Ensure you don't have double brackets like '{{{{...}}}}'.";
                            }

                            reject(new Error(finalMessage));
                            return;
                        }
                    } catch (mapErr) {
                        // Fallback
                    }
                }

                // If error message is just "Multi error" but we failed to extract details, try JSON stringify
                if (error.message === "Multi error") {
                    reject(new Error(`Multi error occurred. Details: ${JSON.stringify(error.properties || error)}`));
                    return;
                }

                // Provide user-friendly message for common issues
                if (error.message && error.message.includes("Corrupted zip")) {
                    reject(new Error("The file appears to be corrupted or not a valid DOCX file."));
                } else {
                    reject(new Error(`Processing Failed: ${error.message || JSON.stringify(error)}`));
                }
            }
        };

        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsArrayBuffer(file);
    });
};
