import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';


const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    })
  ),
  book: z.object({
    id: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    description: z.string().optional(),
    categories: z.array(z.string()).optional(),
    publishedDate: z.string().optional()
  })
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
        { error: 'Invalid request format.' },
        { status: 400 }
      );
    }
    
    const { messages, book } = result.data;
    
    
    const bookDetails = `
      Title: ${book.title}
      Author(s): ${book.authors.join(', ')}
      ${book.publishedDate ? `Published: ${book.publishedDate}` : ''}
      ${book.categories && book.categories.length > 0 ? `Categories: ${book.categories.join(', ')}` : ''}
      ${book.description ? `Description: ${book.description}` : ''}
    `;
    
  
    const systemMessage = {
      role: "system",
      content: `You are an AI librarian assistant for the Libris app, knowledgeable and helpful. You are discussing the book "${book.title}" by ${book.authors.join(', ')} with a user.

      Book Details:
      ${bookDetails}

      Your persona:
      - Act like a friendly, approachable librarian.
      - Be knowledgeable about the book's plot, characters, themes, context, and author.
      - Answer questions accurately based on the book's content.
      - If asked for opinions or analysis, provide balanced perspectives.
      - If a question is unclear or goes beyond the scope of the book, politely ask for clarification or state your limitations.
      - Keep responses conversational and relatively concise for a chat interface. Avoid overly long paragraphs.
      - You can use simple markdown like bullet points (*) for lists if it enhances clarity, but avoid complex formatting.
      - Do not invent information or plot points. Stick to established knowledge about the book.
      - Address the user directly and maintain a helpful tone.

      Engage with the user's questions about "${book.title}".`
    };


    const apiMessages = [
      systemMessage,
      ...messages 
    ];

    
    const maxRetries = 3;
    let currentRetry = 0;
    let lastError = null;

    while (currentRetry < maxRetries) {
      try {
       
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL,
            "X-Title": "Libris - Book Talk!",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001", 
            "messages": apiMessages,
            "temperature": 0.7
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          console.error(`Attempt ${currentRetry + 1} failed:`, errorData);
          lastError = new Error(`API request failed: ${errorData.error || response.statusText}`);
          throw lastError;
        }

        const openRouterData = await response.json();
        
        if (!openRouterData.choices || 
            !openRouterData.choices[0] || 
            !openRouterData.choices[0].message) {
          lastError = new Error('Invalid response format from AI');
          throw lastError;
        }
        
        const aiResponse = openRouterData.choices[0].message.content;
        
      
        return NextResponse.json({ response: aiResponse });
        
      } catch (error) {
        console.error(`Attempt ${currentRetry + 1} failed:`, error);
        lastError = error;
        currentRetry++;
        
        if (currentRetry < maxRetries) {
          const delay = 1000 * Math.pow(2, currentRetry - 1); 
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('All retry attempts failed');
    return NextResponse.json(
      { error: 'Our AI is having trouble right now. Please try again later.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in Book Talk API:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}