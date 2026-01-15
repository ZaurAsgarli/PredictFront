import '../src/styles/globals.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import dynamic from 'next/dynamic';
import PageTransition from '../src/components/PageTransition';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';

// Dynamically import client-only components to avoid SSR hydration issues
const Loader = dynamic(() => import('../src/components/Loader'), {
  ssr: false,
});

const CustomCursor = dynamic(() => import('../src/components/CustomCursor'), {
  ssr: false,
});

const TargetCursor = dynamic(() => import('../components/TargetCursor'), {
  ssr: false,
});

function CursorManager() {
  const router = useRouter();
  const [isLoginOrSignup, setIsLoginOrSignup] = useState(false);

  useEffect(() => {
    const path = router.pathname;
    setIsLoginOrSignup(path === '/login' || path === '/signup');
  }, [router.pathname]);

  if (isLoginOrSignup) {
    return <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />;
  }

  return <CustomCursor />;
}

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Loader variant="gradient-ring" />
      <CursorManager />
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

