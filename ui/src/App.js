import { gql, useQuery } from '@apollo/client'

const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`

const App = () => {
  const result = useQuery(ALL_PERSONS)
  if (result.loading) {
    return <div>Loading....</div>
  }

  return <Persons persons={result.data.allPersons} />
}

const Persons = ({ persons }) => (
  <div>
    <h2>Persons</h2>
    {persons.map((p) => (
      <div key={p.id}>
        {p.name} {p.phone}
      </div>
    ))}
  </div>
)

export default App
