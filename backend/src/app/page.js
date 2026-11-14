export default function ApiStatusPage() {
  return (
    <main style={{ maxWidth: 560, margin: '64px auto', padding: '0 16px', lineHeight: 1.6 }}>
      <p style={{ fontFamily: 'monospace', letterSpacing: '0.08em', color: '#5F5E57' }}>LPU-UNI-PATH / API</p>
      <h1 style={{ color: '#173B35', margin: '8px 0 16px' }}>The API is running.</h1>
      <p>
        This service only exposes JSON endpoints under <code>/api</code>. Open the student app from
        the <code>frontend</code> project instead. Health check: <code>GET /api/db-test</code>.
      </p>
    </main>
  );
}
