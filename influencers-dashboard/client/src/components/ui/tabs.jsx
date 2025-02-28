import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import '@/styles/components/ui/Tabs.css';

/**
 * Componente raiz das abas.
 * Fornece contexto para o sistema de abas e gerencia o estado ativo.
 */
const Tabs = TabsPrimitive.Root;
Tabs.displayName = TabsPrimitive.Root.displayName;

/**
 * Contêiner para os gatilhos das abas.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.className - Classes CSS adicionais
 * @returns {JSX.Element} Componente de lista de abas renderizado
 */
const TabsList = React.forwardRef(({ className = '', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`tabs-list ${className}`}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/**
 * Gatilho que alterna para a aba correspondente quando clicado.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.className - Classes CSS adicionais
 * @returns {JSX.Element} Componente gatilho de aba renderizado
 */
const TabsTrigger = React.forwardRef(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={`tabs-trigger ${className}`}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * Conteúdo da aba que é exibido quando a aba correspondente está ativa.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.className - Classes CSS adicionais
 * @returns {JSX.Element} Componente de conteúdo da aba renderizado
 */
const TabsContent = React.forwardRef(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`tabs-content ${className}`}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };