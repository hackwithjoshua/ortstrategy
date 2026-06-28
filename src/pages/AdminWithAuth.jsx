import { AuthProvider } from '../context/AuthContext'
import Admin from './Admin'

export default function AdminWithAuth() {
  return (
    <AuthProvider>
      <Admin />
    </AuthProvider>
  )
}
