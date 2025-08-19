import React from 'react';

/**
 * Converts URLs in text to clickable links
 * @param {string} text - The text to process
 * @returns {React.ReactNode} - JSX with clickable links
 */
export function convertUrlsToLinks(text) {
  if (!text || typeof text !== 'string') return text;

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2 hover:underline-offset-4 transition-all duration-200"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

/**
 * Renders text with clickable links as a React component
 * @param {Object} props - Component props
 * @param {string} props.text - The text to render with links
 * @param {string} props.className - CSS classes to apply
 * @returns {React.ReactElement} - Rendered component
 */
export function TextWithLinks({ text, className = '' }) {
  const content = convertUrlsToLinks(text);
  
  return (
    <span className={className}>
      {content}
    </span>
  );
}