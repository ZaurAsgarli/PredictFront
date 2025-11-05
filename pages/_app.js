import '../src/styles/globals.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { ThemeProvider } from '../src/contexts/ThemeContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default MyApp;

