import { json } from '@sveltejs/kit';
import { clients } from '$lib/db';

export async function GET({ request, cookies }: any) {
	const stream = new ReadableStream({
        start(controller) {
          // Convert controller to classic write API
          const encoder = new TextEncoder();
    
          function send(data: any) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }
    
          // Send initial state immediately
          send({ type: "init", positions: [] });
    
          // Add this controller to clients list
          const client = {
            write: (msg: string) => controller.enqueue(encoder.encode(msg)),
            close: () => controller.close(),
          };
    
          // Add to the global pool
          // (We store objects with classic write API for simplicity)
          clients.push(client as any);
    
          // Cleanup on disconnect
          request.signal.addEventListener("abort", () => {
            client.close();
            const idx = clients.indexOf(client as any);
            if (idx !== -1) clients.splice(idx, 1);
          });
        },
      });
    
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
}