import React from 'react';

const CardWrapper = ({ children, className = '' }) => {
  return (
    <div
      className={`flex-1 overflow-y-auto w-full mt-px ${className}`}
      style={{ paddingTop: 0 }} // Consistent internal top padding for the content
    >
      {children}
    </div>
  );
};

export default CardWrapper; 