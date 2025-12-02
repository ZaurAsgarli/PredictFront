import '../src/styles/globals.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import dynamic from 'next/dynamic';
import PageTransition from '../src/components/PageTransition';

// Dynamically import client-only components to avoid SSR hydration issues
const Loader = dynamic(() => import('../src/components/Loader'), {
  ssr: false,
});

const CustomCursor = dynamic(() => import('../src/components/CustomCursor'), {
  ssr: false,
});

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Loader variant="gradient-ring" />
      <CustomCursor />
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-grow pt-20 md:pt-24">
          <PageTransition>
            <Component {...pageProps} />
          </PageTransition>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default MyApp;

