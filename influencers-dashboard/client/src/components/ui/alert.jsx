import * as React from "react"
import '@/styles/components/ui/Alert.css';

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={`alert alert-${variant} ${className || ''}`}
    {...props}
  />
))

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 
    ref={ref} 
    className={`alert-title ${className || ''}`} 
    {...props} 
  />
))

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={`alert-description ${className || ''}`} 
    {...props} 
  />
))

Alert.displayName = "Alert"
AlertTitle.displayName = "AlertTitle"
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }