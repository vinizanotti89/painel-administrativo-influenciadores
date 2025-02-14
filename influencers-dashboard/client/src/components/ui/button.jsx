import React from "react";
import '@/styles/components/ui/Button.css';

const Button = React.forwardRef(({ 
  className = '',
  variant = "primary",
  size = "medium",
  ...props 
}, ref) => {
  const getButtonClasses = () => {
    let classes = ['button'];
    
    // Add variant class
    classes.push(`button-${variant}`);
    
    // Add size class
    classes.push(`button-${size}`);
    
    // Add custom classes
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };

  return (
    <button
      ref={ref}
      className={getButtonClasses()}
      {...props}
    />
  );
});

const ButtonGroup = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <div 
      className={`button-group ${className}`}
      ref={ref} 
      {...props} 
    />
  );
});

Button.displayName = "Button";
ButtonGroup.displayName = "ButtonGroup";

export { Button, ButtonGroup };