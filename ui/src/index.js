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

import { setContext } from '@apollo/client/link/context'

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('phonenumbers-user-token')
  console.log(token)
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null,
    },
  }
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
})

// const client = new ApolloClient({
//   cache: new InMemoryCache(),
//   link: new HttpLink({
//     uri: 'http://localhost:4000',
//   }),
// })

// const query = gql`
//   query {
//     allPersons {
//       name
//       phone
//       address {
//         street
//         city
//       }
//     }
//   }
// `

// client.query({ query }).then((res) => {
//   console.log(res.data)
// })

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)
