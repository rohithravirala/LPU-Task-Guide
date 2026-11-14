import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

const toastOptions = {
  duration: 3500,
  style: {
    background: '#173B35',
    color: '#F4F0E7',
    borderRadius: '4px',
    fontSize: '14px',
    padding: '10px 14px',
  },
  success: { iconTheme: { primary: '#C5CE75', secondary: '#173B35' } },
  error: { iconTheme: { primary: '#D65A3A', secondary: '#FFFEFA' } },
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-center" containerStyle={{ bottom: 88 }} toastOptions={toastOptions} />
      </AuthProvider>
    </BrowserRouter>
  )
}
