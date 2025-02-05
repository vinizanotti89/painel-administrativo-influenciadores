import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import '@/styles/components/ui/Label.css';

const Label = React.forwardRef(({ className, required, disabled, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={`label ${required ? 'required' : ''} ${disabled ? 'disabled' : ''} ${className || ''}`}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };