import '../styles/globals.css'
import { UserProvider } from '../lib/context'
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast'
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import { ReactQueryDevtools } from "react-query/devtools";
function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient()

  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Component {...pageProps} />
        {/* <ReactQueryDevtools/> */}
        <Navbar />
      </QueryClientProvider>
    </UserProvider>
  );
}

export default MyApp
