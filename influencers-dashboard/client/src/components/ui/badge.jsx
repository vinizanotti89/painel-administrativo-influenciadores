import React from "react";
import '@/styles/components/ui/Badge.css';

function Badge({ className, variant = 'default', ...props }) {
  return (
    <div 
      className={`badge badge-${variant} ${className || ''}`} 
      {...props} 
    />
  );
}

export { Badge }