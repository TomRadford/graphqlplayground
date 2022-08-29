import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'
import Persons from './Person'
import PersonForm from './PersonForm'
import PhoneForm from './PhoneForm'
import LoginForm from './LoginForm'
import { ALL_PERSONS, PERSON_ADDED } from './queries'

export const updateCache = (cache, query, addedPerson) => {
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.name
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allPersons }) => {
    return {
      allPersons: uniqByName(allPersons.concat(addedPerson)),
    }
  })
}

const App = () => {
  // const result = useQuery(ALL_PERSONS, { pollInterval: 1000 })
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const result = useQuery(ALL_PERSONS)
  const client = useApolloClient()
  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  useSubscription(PERSON_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedPerson = subscriptionData.data.personAdded
      notify(`${addedPerson.name} added!`)
      updateCache(client.cache, { query: ALL_PERSONS }, addedPerson)
    },
  })

  useEffect(() => {
    const localToken = localStorage.getItem('phonenumbers-user-token')
    if (localToken) {
      setToken(localToken)
    }
  }, [])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm setToken={setToken} setError={notify} />
      </div>
    )
  }

  if (result.loading) {
    return <div>Loading....</div>
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <button onClick={logout}>Logout</button>
      <Persons persons={result.data.allPersons} />
      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
    </div>
  )
}

const Notify = ({ errorMessage }) => {
  if (!errorMessage) return null
  return <div style={{ color: 'red' }}>{errorMessage}</div>
}

export default App
