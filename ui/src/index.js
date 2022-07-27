import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql,
} from '@apollo/client'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
})

const query = gql`
  query {
    allPersons {
      name
      phone
      address {
        street
        city
      }
    }
  }
`

client.query({ query }).then((res) => {
  console.log(res.data)
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)
