import { createContext, useState } from 'react'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const [userID, setUserID] = useState()
  const [username, setUserName] = useState()
  return (
    <DataContext.Provider value={{userID,setUserID,username,setUserName}}>
      <Component {...pageProps} />
    </DataContext.Provider>
  )
}

export default MyApp

export const DataContext = createContext()