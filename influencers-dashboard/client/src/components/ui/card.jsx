import * as React from "react"
import '@/styles/components/ui/Card.css';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={`card ${className || ''}`} 
    {...props} 
  />
))

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={`card-header ${className || ''}`} 
    {...props} 
  />
))

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={`card-content ${className || ''}`} 
    {...props} 
  />
))

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 
    ref={ref} 
    className={`card-title ${className || ''}`} 
    {...props} 
  />
))

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardContent.displayName = "CardContent"
CardTitle.displayName = "CardTitle"

// Export default e nomeados juntos
export { Card, CardHeader, CardContent, CardTitle };

