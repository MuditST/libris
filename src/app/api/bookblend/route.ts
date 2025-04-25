import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';


const requestSchema = z.object({
  books: z.array(
    z.object({
      id: z.string(),
      volumeInfo: z.object({
        title: z.string(),
        authors: z.array(z.string()).optional(),
        description: z.string().optional(),
        categories: z.array(z.string()).optional(),
      })
    })
  ).min(1).max(5)
});

export async function POST(req: Request) {
 
  try {
  
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      console.error("OpenRouter API key not configured");
      return NextResponse.json(
        { error: 'API key is not configured properly.' },
        { status: 500 }
      );
    }

    const body = await req.json();
   
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request. Please provide between 1-5 valid books.' },
        { status: 400 }
      );
    }
    
    const { books } = result.data;
    
    const formattedBooks = books.map((book, i) => {
      const authors = book.volumeInfo.authors?.join(', ') || 'Unknown';
      const description = book.volumeInfo.description?.substring(0, 150) || 'No description available';
      const categories = book.volumeInfo.categories?.join(', ') || 'Unknown';
      
      return `${i+1}. "${book.volumeInfo.title}" by ${authors} - ${description}... - Genres: ${categories}`;
    }).join('\n\n');

   
    const prompt = `You are a helpful and insightful AI librarian. A user has selected the following books they enjoy, representing their current reading "vibe":

Selected books:
${formattedBooks}

Your task is to recommend 5 other books they might enjoy, acting like a friendly librarian making personalized suggestions based on the *overall blend* of their selections.

Important requirements:
- Analyze the *combination* of selected books to understand the user's taste (e.g., common themes, genres, writing styles, moods, character archetypes).
- Recommend books that are relatively popular and well-known (published by major publishers).
- Include a mix of books published in the last 50 years, with at least 2 from the last decade.
- Avoid extremely obscure titles.
- Do not recommend books by the exact same authors unless their style is particularly relevant and distinct across works.
- Do not recommend any of the books that were provided as input.
- For the "reason", provide a thoughtful explanation (approx. 3-4 sentences) explaining *why* the recommended book fits the user's *overall taste* as indicated by their selections. Connect the recommendation to multiple aspects or books from their selection if possible (e.g., "Given your interest in [Theme from Book A] and the [Pacing/Style of Book B], you might appreciate [Recommended Book] because..."). Speak conversationally, like you're suggesting it in person.

Provide recommendations in the following JSON format:
{
  "recommendations": [
    {
      "title": "Exact Book Title",
      "author": "Full Author Name",
      "reason": "Your detailed librarian-style explanation connecting the recommendation to the user's combined selections."
    },
    ...
  ]
}

Ensure book titles and author names are spelled correctly for database lookups.`;

    try {
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://libris.vercel.app",
          "X-Title": "Libris BookBlend",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "google/gemini-2.0-flash-001", 
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ],
          "response_format": { "type": "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API error:', errorData);
        throw new Error(`API request failed: ${errorData.error || response.statusText}`);
      }

      const openRouterData = await response.json();
      
      if (!openRouterData.choices || !openRouterData.choices[0] || !openRouterData.choices[0].message) {
        throw new Error('Invalid response format from AI');
      }
      
      const aiResponse = openRouterData.choices[0].message.content;
      
    
      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }
     
      let recommendations;
      try {
        recommendations = JSON.parse(aiResponse);
      } catch (jsonError) {
      
        const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*?\})/;
        const jsonMatch = aiResponse.match(jsonRegex);
        if (!jsonMatch) {
          throw new Error('Invalid JSON response format');
        }
        
        const jsonStr = (jsonMatch[1] || jsonMatch[2] || jsonMatch[0]).replace(/```json|```/g, '').trim();
        recommendations = JSON.parse(jsonStr);
      }
      
      if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
        throw new Error('Invalid response format from AI');
      }
      
      const recommendationsWithCovers = await Promise.all(
        recommendations.recommendations.map(async (rec: any) => {
          try {
            const generalQuery = encodeURIComponent(`${rec.title} ${rec.author}`);
            const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${generalQuery}&maxResults=1&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

            const response = await fetch(googleBooksUrl);

            if (!response.ok) {
                 
                 console.error(`[Blend] Google Books API fetch failed for "${rec.title}": ${response.status} ${response.statusText}`);
                 throw new Error(`Google Books API fetch failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
              return {
                ...data.items[0],
                reason: rec.reason
              };
            } else {
              
               console.log(` No items found in Google Books for general query: ${generalQuery}`);
            }

            // If no items found, return basic book data (Placeholder)
            return {
              id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              volumeInfo: {
                title: rec.title,
                authors: [rec.author],
                description: "No description available",
                imageLinks: null
              },
              reason: rec.reason
            };
          } catch (error) {
            console.error(`[Blend] Error processing recommendation "${rec.title}":`, error);
            return {
              id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              volumeInfo: {
                title: rec.title,
                authors: [rec.author],
                description: "Failed to fetch book details",
                imageLinks: null
              },
              reason: rec.reason
            };
          }
        })
      );

      return NextResponse.json({
        recommendations: recommendationsWithCovers
      });

    } catch (aiError) {
      console.error('AI API error:', aiError);
      return NextResponse.json(
        { error: 'Our AI is having trouble right now. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in recommendation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations. Please try again later.' },
      { status: 500 }
    );
  }
}