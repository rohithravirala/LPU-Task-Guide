import { categories, faqs, portals, tasks } from '@/data/store';

// The student app (the API itself lives under /api)
const APP_URL = process.env.APP_URL || 'https://lpu-task-guide.vercel.app';

const endpoints = [
  ['POST', '/api/auth/login', 'Sign in'],
  ['POST', '/api/auth/demo', 'Try demo'],
  ['GET', '/api/tasks', 'Task catalogue (public)'],
  ['GET', '/api/journeys/:taskId', 'Step-by-step guide'],
  ['GET', '/api/updates', 'Your updates (sample data)'],
  ['GET', '/api/faqs', 'FAQs'],
  ['GET', '/api/services', 'Portals and offices'],
];

// GET /  ->  a small page saying the API is running, instead of a 404
export function GET() {
  const rows = endpoints
    .map(([method, path, what]) => `<tr><td><b>${method}</b></td><td><code>${path}</code></td><td>${what}</td></tr>`)
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LPU Task Guide API</title>
<style>
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f8f8f8; color: #2b2f36; }
  main { max-width: 680px; margin: 48px auto; padding: 0 16px; }
  h1 { margin: 0; color: #16181d; } h1 span { color: #ea580b; }
  .ok { display: inline-block; margin-top: 12px; padding: 4px 12px; border-radius: 999px; background: #e9f6ee; color: #23874a; font-weight: 600; }
  .card { margin-top: 24px; background: #fff; border: 1px solid #ebe5e0; border-radius: 16px; padding: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; } td { padding: 6px 8px; border-top: 1px solid #ebe5e0; }
  code { color: #c2410c; } a.btn { display: inline-block; margin-top: 20px; background: #ea580b; color: #fff; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
<main>
  <h1>LPU <span>Task Guide</span> API</h1>
  <p class="ok">● Running</p>
  <p>${tasks.length} tasks from ${portals.length} portals, ${categories.length} categories and ${faqs.length} FAQs are loaded.</p>
  <div class="card"><table>${rows}</table></div>
  <a class="btn" href="${APP_URL}">Open the app →</a>
</main>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
