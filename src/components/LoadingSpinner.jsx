import React from 'react';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  let spinnerSizeClasses = '';
  let wrapperPaddingClasses = '';
  // The spinner itself will have a base color (gray-text) and a contrasting spinning segment (accent).

  switch (size) {
    case 'small':
      spinnerSizeClasses = 'h-5 w-5'; // Smaller for buttons
      wrapperPaddingClasses = 'p-0'; // No extra padding for button context
      break;
    case 'large':
      spinnerSizeClasses = 'h-16 w-16';
      wrapperPaddingClasses = 'py-12';
      break;
    case 'medium':
    default:
      spinnerSizeClasses = 'h-12 w-12';
      wrapperPaddingClasses = 'py-8';
      break;
  }

  return (
    <div className={`flex justify-center items-center ${wrapperPaddingClasses} ${className}`}>
      {/* Spinner circle: border-solid border-2 for the base ring, border-t-accent for the visible spinning segment */}
      <div className={`animate-spin rounded-full ${spinnerSizeClasses} border-2 border-solid border-gray-text border-t-accent`}></div>
    </div>
  );
};

export default LoadingSpinner;