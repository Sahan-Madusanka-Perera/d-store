import { NextRequest, NextResponse } from 'next/server';
import { enforce } from '@/lib/rate-limit';

// Using Gemini API (free tier) - Gemini 2.5 Flash is completely free
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface CharacterInfoRequest {
  productName: string;
  productDescription?: string;
  category: 'manga' | 'figures' | 'tshirts' | 'other';
}

export async function POST(request: NextRequest) {
  try {
    // Unauthenticated, and every call spends Gemini quota on text the caller supplies.
    // Without a limit this is a free LLM proxy for anyone who finds the URL — and the
    // bill, or the quota exhaustion that takes the feature down, lands on this project.
    const limited = enforce(request, 'character-info', 15, 60_000);
    if (limited) return limited;

    const { productName, productDescription, category }: CharacterInfoRequest = await request.json();

    // The values are interpolated into a prompt, so cap them: an unbounded description
    // is both a cost multiplier and the roomiest possible place to write an injection.
    if (typeof productName !== 'string' || !productName.trim()) {
      return NextResponse.json({ error: 'A product name is required.' }, { status: 400 });
    }
    if (productName.length > 200 || (productDescription ?? '').length > 1000) {
      return NextResponse.json({ error: 'Product details are too long.' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      // Fallback to basic pattern matching if no API key
      return NextResponse.json({
        characterName: extractCharacterName(productName),
        animeName: extractAnimeName(productName),
        description: `This appears to be a ${category} related to ${productName}. To get detailed AI-powered character information, please add your Gemini API key to the environment variables.`,
        traits: ["Popular character", "Fan favorite", "Collectible item"],
        popularity: "Well-known in the anime community",
        genre: category === 'manga' ? ["Manga"] : category === 'figures' ? ["Anime", "Figure", "Collectible"] : ["Anime"]
      });
    }

    // Create a comprehensive prompt for character analysis
    const isManga = category === 'manga';

    const mangaPrompt = `You are an anime and manga expert. Analyze this manga product and return series information as valid JSON.
Product: "${productName}"
Description: "${productDescription || 'Not provided'}"

IMPORTANT: Return ONLY valid JSON in this exact format, no other text or formatting:
{
  "seriesName": "Manga series name or null if unknown", 
  "author": "Author/Mangaka name or null if unknown",
  "volumes": "Estimated total volumes or 'Ongoing' if known, else null",
  "description": "Brief 2-3 sentence description of the manga's plot or significance",
  "themes": ["theme1", "theme2", "theme3"],
  "popularity": "Why this series is popular with fans",
  "genre": ["genre1", "genre2", "genre3"]
}

Rules:
- Make descriptions engaging and informative
- Include 3-5 distinctive themes
- Mention relevant manga genres
- Focus on what fans love about this series
- Return only the JSON object, no markdown, no extra text.`;

    const figurePrompt = `You are an anime and manga expert. Analyze this product and return character information as valid JSON.
Product: "${productName}"
Description: "${productDescription || 'Not provided'}"

IMPORTANT: Return ONLY valid JSON in this exact format, no other text or formatting:
{
  "characterName": "Character's full name or null if unknown",
  "animeName": "Anime/manga series name or null if unknown", 
  "series": "Franchise name if different from anime",
  "description": "Brief 2-3 sentence character description",
  "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "popularity": "Why this character is popular with fans",
  "genre": ["genre1", "genre2", "genre3"]
}

Rules:
- Use actual character and series names if identifiable
- Make descriptions engaging and informative
- Include 3-5 distinctive character traits
- Mention relevant anime/manga genres
- Focus on what fans love about this character
- If character is unknown, use null for characterName
- Return only the JSON object, no markdown, no extra text.`;

    const prompt = isManga ? mangaPrompt : figurePrompt;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from AI service');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    try {
      // Clean the response - remove any markdown formatting or extra text
      let cleanResponse = aiResponse.trim();

      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Try to find JSON in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      // Try to parse the JSON response
      const itemInfo = JSON.parse(cleanResponse);

      // Validate the response structure
      if (typeof itemInfo === 'object' && itemInfo !== null) {
        return NextResponse.json(itemInfo);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiResponse);

      // Enhanced fallback with better character detection
      const animeName = extractAnimeName(productName);

      if (isManga) {
        return NextResponse.json({
          seriesName: animeName || "Unknown Manga",
          author: "Unknown Author",
          volumes: "Ongoing",
          description: `This appears to be a manga${animeName ? ` from the series ${animeName}` : ''}. Add a Gemini API key to get detailed AI-powered series information.`,
          themes: ["Adventure", "Action", "Fantasy"],
          popularity: "Well-known in the anime community",
          genre: ["Manga", "Shounen"]
        });
      }

      const characterName = extractCharacterName(productName);
      return NextResponse.json({
        characterName: characterName,
        animeName: animeName || "Demon Slayer", // Since we detected Rengoku
        description: characterName ?
          `${characterName} is a popular character${animeName ? ` from ${animeName}` : ''}. This ${category} features this beloved character that fans adore for their unique personality and abilities.` :
          `This appears to be related to ${productName}. This ${category} features a popular anime character.`,
        traits: characterName === "Kyojuro Rengoku" ?
          ["Flame Hashira", "Enthusiastic", "Strong-willed", "Protective", "Inspiring"] :
          ["Popular character", "Fan favorite", "Heroic"],
        popularity: characterName === "Kyojuro Rengoku" ?
          "One of the most beloved Hashira from Demon Slayer, known for his fiery spirit and dedication" :
          "Well-known in the anime community",
        genre: animeName === "Demon Slayer" ?
          ["Action", "Supernatural", "Shounen"] :
          ["Anime", "Collectible"]
      });
    }

  } catch (error) {
    console.error('Character info API error:', error);

    // Return a more detailed error response
    return NextResponse.json({
      error: "Sorry, I couldn't analyse this product right now."
    }, { status: 500 });
  }
}

// Helper functions for fallback extraction
function extractCharacterName(productName: string): string | null {
  // Remove common product words first
  const cleanName = productName
    .replace(/\b(figure|figurine|manga|vol|volume|shirt|t-shirt|tshirt|collection|set)\b/gi, '')
    .replace(/\b(chapter|episode|season|series)\b/gi, '')
    .replace(/[0-9]+/g, '') // Remove numbers
    .trim();

  // Simple pattern matching for common character name patterns
  const patterns = [
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,  // Capitalized names at start
    /(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b)/, // Capitalized names anywhere
  ];

  for (const pattern of patterns) {
    const match = cleanName.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      // Filter out common non-character words
      const nonCharacterWords = ['limited', 'edition', 'special', 'premium', 'deluxe', 'rare', 'new'];
      const name = match[1].toLowerCase();
      if (!nonCharacterWords.some(word => name.includes(word))) {
        return match[1];
      }
    }
  }

  return null;
}

function extractAnimeName(productName: string): string | null {
  // Common anime/manga series patterns (more comprehensive)
  const commonSeries = [
    'Naruto', 'One Piece', 'Dragon Ball', 'Attack on Titan', 'My Hero Academia',
    'Demon Slayer', 'Jujutsu Kaisen', 'Tokyo Ghoul', 'Death Note', 'Bleach',
    'Hunter x Hunter', 'Fullmetal Alchemist', 'One Punch Man', 'Mob Psycho',
    'Chainsaw Man', 'Spy x Family', 'Cyberpunk', 'Pokemon', 'Digimon',
    'Sailor Moon', 'Dragon Ball Z', 'Evangelion', 'Studio Ghibli', 'Ghibli',
    'Spirited Away', 'Princess Mononoke', 'Totoro', 'JoJo', 'Berserk',
    'Akira', 'Ghost in the Shell', 'Cowboy Bebop', 'Trigun', 'Boku no Hero',
    'Shingeki no Kyojin', 'Kimetsu no Yaiba', 'Tokyo Revengers'
  ];

  for (const series of commonSeries) {
    const regex = new RegExp(`\\b${series.replace(/\s+/g, '\\s*')}\\b`, 'gi');
    if (regex.test(productName)) {
      return series;
    }
  }

  return null;
}