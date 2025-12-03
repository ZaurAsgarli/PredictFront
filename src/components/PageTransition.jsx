import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
  const router = useRouter();
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.asPath}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.4,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        {displayChildren}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;


