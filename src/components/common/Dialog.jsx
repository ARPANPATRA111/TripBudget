import React from 'react';

export const Dialog = ({ isOpen, onClose, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} my-8`}>
        <div className="p-4 sm:p-5 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};