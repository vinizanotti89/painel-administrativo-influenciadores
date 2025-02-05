import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import '@/styles/components/ui/Accordion.css';

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item 
    ref={ref} 
    className={`accordion-item ${className || ''}`} 
    {...props} 
  />
))

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    className={`accordion-trigger ${className || ''}`}
    {...props}
  >
    {children}
  </AccordionPrimitive.Trigger>
))

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={`accordion-content ${className || ''}`}
    {...props}
  >
    <div className="accordion-content-inner">{children}</div>
  </AccordionPrimitive.Content>
))

AccordionItem.displayName = "AccordionItem"
AccordionTrigger.displayName = "AccordionTrigger"
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }