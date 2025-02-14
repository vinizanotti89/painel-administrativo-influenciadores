import * as React from "react"
import '@/styles/components/ui/Textarea.css';

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`textarea ${className || ''}`}
    {...props}
  />
))

Textarea.displayName = "Textarea"

export { Textarea }