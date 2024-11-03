// translate.js
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

import inputData from '../src/i18n/locales/en_translation_target.js';
import translations from '../src/i18n/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excludeLocaleCodes = ['fr', 'en']; // List of target languages
const targetLanguages = translations.supportedLocaleCodes
  .filter((item) => !excludeLocaleCodes.includes(item))
  .splice(0, 10);

const apiEndpoint = 'http://localhost/v1/workflows/run'; // Translation API endpoint
const apiKey = 'app-lPgMjENDzIiMthTVETpTFvJW'; // API key for authentication
const difyUser = 'pjamessteven';

async function translateFile(targetLanguages, apiEndpoint, apiKey) {
  // Loop through each target language
  console.log('Target languages:');
  console.log(JSON.stringify(targetLanguages));

  for (const language of targetLanguages) {
    const translatedData = {};
    console.log('Generating translation for [' + language + ']');
    // Translate each key-value pair
    for (const [key, value] of Object.entries(inputData)) {
      try {
        // Send translation request to API
        const response = await axios.post(
          apiEndpoint,
          {
            inputs: {
              text: JSON.stringify(value),
              target_lang: language,
            },
            response_mode: 'blocking',
            user: difyUser,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        // Store the translated text
        translatedData[key] = response.data.data.outputs.json;
      } catch (error) {
        console.log(error);
        console.error(
          `Failed to translate key "${key}" to ${language}:`,
          error.message
        );
        translatedData[key] = value; // Fallback to original text if translation fails
      }
    }

    // Save translated data to a new JSON file for the target language
    const outputFilePath = path.join(__dirname, `${language}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(translatedData, null, 2));
    console.log(`Translation for ${language} saved to ${outputFilePath}`);
  }
}

function parseJsonString(text) {
  // Extract the content between the triple backticks
  const jsonContent = text.match(/```json\n([\s\S]*?)```/)[1];

  // Remove any leading/trailing whitespace
  const trimmedJson = jsonContent.trim();

  // Parse the JSON string
  try {
    return JSON.parse(trimmedJson);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

export async function runTranslation() {
  // console.log('Generating translations for: ');
  // console.log(JSON.stringify(targetLanguages));
  try {
    await translateFile(targetLanguages, apiEndpoint, apiKey);
    console.log('Translation completed successfully.');
  } catch (error) {
    console.error('Translation failed:', error);
  }
}
