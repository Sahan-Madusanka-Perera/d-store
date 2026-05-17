'use client';

import { motion } from 'framer-motion';

export default function AnimatedHeroText({ 
  text, 
  className 
}: { 
  text: string; 
  className?: string;
}) {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.3 },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
      filter: 'blur(10px)',
      scale: 1.1,
    },
  };

  return (
    <motion.h1 
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child} className="inline-block">
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
}
