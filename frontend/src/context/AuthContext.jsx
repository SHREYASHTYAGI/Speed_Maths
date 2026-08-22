import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (payload) => {
    const response = await api.post('/auth/login', payload)
    const { accessToken: nextAccessToken, user: nextUser } = response.data
    localStorage.setItem('accessToken', nextAccessToken)
    localStorage.setItem('user', JSON.stringify(nextUser))
    setAccessToken(nextAccessToken)
    setUser(nextUser)
    return response.data
  }

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload)
    const { accessToken: nextAccessToken, user: nextUser } = response.data
    localStorage.setItem('accessToken', nextAccessToken)
    localStorage.setItem('user', JSON.stringify(nextUser))
    setAccessToken(nextAccessToken)
    setUser(nextUser)
    return response.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setAccessToken(null)
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      setAccessToken,
      loading,
      login,
      register,
      logout,
    }),
    [user, accessToken, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export default AuthContext
