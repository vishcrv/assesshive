import { NextResponse } from 'next/server';
import { MeetingAnalysis } from '@/types/meeting';

async function* streamOllama(prompt: string) {
  try {
    console.log('Sending request to Ollama:', prompt.substring(0, 100) + '...');
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to communicate with Ollama: ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer) yield buffer;
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            buffer += json.response;
            const words = buffer.split(' ');
            if (words.length > 1) {
              const completeWords = words.slice(0, -1).join(' ') + ' ';
              yield completeWords;
              buffer = words[words.length - 1];
            }
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  } catch (error) {
    console.error('Ollama API error:', error);
    throw error;
  }
}

async function queryOllama(prompt: string): Promise<string> {
  try {
    let fullResponse = '';
    for await (const chunk of streamOllama(prompt)) {
      fullResponse += chunk;
    }
    return fullResponse;
  } catch (error) {
    console.error('Error querying Ollama:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { transcript, query } = await request.json();
    console.log('Received transcript length:', transcript?.length);
    console.log('Received query:', query);

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // If there's a query, handle it as a streaming chat request
    if (query) {
      const chatPrompt = `You are an AI assistant helping to analyze a meeting transcript. Use the context from the transcript to answer the user's question.

Context (Meeting Transcript):
${transcript}

User Question: ${query}

Please provide a clear and concise response based on the meeting transcript. If the answer cannot be found in the transcript, say so.`;

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamOllama(chatPrompt)) {
              controller.enqueue(new TextEncoder().encode(chunk));
            }
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Otherwise, handle it as a regular analysis request
    try {
      const discussionPrompt = `Analyze this meeting transcript and provide key information in a clear format.
Transcript: "${transcript}"

Format your response exactly like this:
Key Discussions:
• Topic 1
  - Point 1
  - Point 2
• Topic 2
  - Point 1
  - Point 2

Important Decisions:
• Decision 1
• Decision 2

Action Items:
• Action 1
• Action 2`;
      
      const discussionAnalysis = await queryOllama(discussionPrompt);

      const summaryPrompt = `Create a concise summary of this meeting transcript.
Transcript: "${transcript}"

Format your response exactly like this:
Main Topics:
• Topic 1
• Topic 2
• Topic 3

Key Takeaways:
• Takeaway 1
• Takeaway 2
• Takeaway 3`;
      
      const summary = await queryOllama(summaryPrompt);

      const tasksPrompt = `Extract and organize the key tasks and action items from this meeting transcript in a clear, structured format.
Transcript: "${transcript}"

Format your response in a clean, readable way:

Action Items:
1. [Task Description]
   • Owner: [Person responsible]
   • Timeline: [Due date/timeframe]
   • Priority: [High/Medium/Low]

2. [Task Description]
   • Owner: [Person responsible]
   • Timeline: [Due date/timeframe]
   • Priority: [High/Medium/Low]

Focus on extracting only clear, actionable tasks. If no clear tasks are found, respond with "No specific tasks identified in this meeting."`;
      
      const tasks = await queryOllama(tasksPrompt);

      console.log('Analysis completed successfully');
      
      const analysis: MeetingAnalysis = {
        discussions: discussionAnalysis || 'No discussions found',
        summary: summary || 'No summary available',
        tasks: tasks || 'No tasks identified'
      };
      
      return NextResponse.json({ analysis });
    } catch (error) {
      console.error('Analysis generation error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to generate analysis',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 