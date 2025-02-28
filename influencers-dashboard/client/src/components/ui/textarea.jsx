import * as React from "react";
import '@/styles/components/ui/Textarea.css';

/**
 * Componente de área de texto multilinhas.
 * Permite entrada de texto mais extensa e formatada em múltiplas linhas.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.placeholder - Texto de placeholder
 * @param {boolean} props.disabled - Se o componente está desabilitado
 * @param {Function} props.onChange - Função chamada quando o valor muda
 * @param {string} props.value - Valor atual do textarea
 * @param {string} props.name - Nome do campo para formulários
 * @param {number} props.rows - Número de linhas visíveis
 * @returns {JSX.Element} Componente de área de texto renderizado
 */
const Textarea = React.forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`textarea ${className}`}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Textarea };