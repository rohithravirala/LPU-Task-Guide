// This Next.js app is an API backend only. The single page below is a status note;
// the student-facing interface lives in ../frontend (React + Vite).
export const metadata = {
  title: 'LPU-Uni-Path API',
  description: 'REST API for the LPU-Uni-Path student guidance platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F4F0E7', color: '#252823' }}>
        {children}
      </body>
    </html>
  );
}
