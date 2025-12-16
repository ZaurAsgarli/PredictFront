import '../../../src/styles/globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default AdminApp;
