import { useQuery } from '@apollo/client'
import { useState } from 'react'
import Persons from './Person'
import PersonForm from './PersonForm'
import PhoneForm from './PhoneForm'
import { ALL_PERSONS } from './queries'

const App = () => {
  // const result = useQuery(ALL_PERSONS, { pollInterval: 1000 })
  const [errorMessage, setErrorMessage] = useState(null)
  const result = useQuery(ALL_PERSONS)
  if (result.loading) {
    return <div>Loading....</div>
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />
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
