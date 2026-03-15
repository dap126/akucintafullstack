import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()
  const username = ref('')
  const password = ref('')
  const errorMessage = ref('')
  const isLoading = ref(false)

  async function login() {
    errorMessage.value = ''
    isLoading.value = true
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        errorMessage.value = data.message || 'Login failed'
        return
      }
      
      // Save token to localStorage 
      localStorage.setItem('token', data.token)
      
      // Save user info just in case
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      errorMessage.value = 'Failed to connect to the server'
    } finally {
      isLoading.value = false
    }
  }

  return {
    username,
    password,
    errorMessage,
    isLoading,
    login
  }
}