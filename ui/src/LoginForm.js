import { useMutation } from '@apollo/client'
import { useState, useEffect } from 'react'
import { LOGIN } from './queries'

const LoginForm = ({ setToken, setError }) => {
  const [loginMessage, setLoginMessage] = useState('Login')
  const [login, result] = useMutation(LOGIN, {
    onError: (e) => setError(e.graphQLErrors[0].message),
  })

  useEffect(() => {
    if (result.loading) {
      setLoginMessage('Logging in')
    } else {
      setLoginMessage('Login')
    }
  }, [result.loading])

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('phonenumbers-user-token', token)
    }
  }, [result.data]) //eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault()
    login({
      variables: {
        username: e.target.username.value,
        password: e.target.password.value,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        Username <input name="username" />
      </div>
      <div>
        Password
        <input name="password" type="password" />
      </div>
      <button type="submit" title="login">
        {loginMessage}
      </button>
    </form>
  )
}

export default LoginForm
