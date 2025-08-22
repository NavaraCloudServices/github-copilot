import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-8xl font-bold text-primary/20 dark:text-primary/30 mb-4">
              404
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-gray-600 dark:text-gray-400 mb-8"
          >
            The leaderboard you're looking for doesn't exist or may have been removed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              as={Link}
              to="/"
              variant="primary"
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full"
            />
            <motion.div
              animate={{ 
                y: [10, -10, 10],
                rotate: [0, -5, 0, 5, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-40 right-20 w-6 h-6 bg-secondary/20 rounded-full"
            />
            <motion.div
              animate={{ 
                y: [-5, 15, -5],
                rotate: [0, 10, 0, -10, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-40 left-20 w-3 h-3 bg-accent/20 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;