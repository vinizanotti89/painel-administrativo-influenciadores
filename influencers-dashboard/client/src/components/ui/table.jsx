import React, { useState, useEffect } from "react";
import '@/styles/components/ui/Table.css';

// Componente Spinner
const Spinner = ({ className = "" }) => (
  <div className={`spinner ${className}`}>
    <div className="spinner-icon"></div>
  </div>
);

// Componente Table principal com suporte a loading
const Table = React.forwardRef(({ 
  className,
  data,
  fetchData,
  isLoading: controlledLoading,
  error: controlledError,
  onRetry,
  loadingComponent,
  errorComponent,
  ...props 
}, ref) => {
  // Estado interno se não for controlado externamente
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalData, setInternalData] = useState([]);
  const [internalError, setInternalError] = useState(null);

  // Determine se usamos estado controlado ou interno
  const loading = controlledLoading !== undefined ? controlledLoading : internalLoading;
  const error = controlledError !== undefined ? controlledError : internalError;

  useEffect(() => {
    // Se fetchData for fornecido e não estamos usando loading controlado externamente
    if (fetchData && controlledLoading === undefined) {
      const loadData = async () => {
        setInternalLoading(true);
        setInternalError(null);
        try {
          const result = await fetchData();
          setInternalData(result);
        } catch (err) {
          setInternalError(err.message || 'Erro ao carregar dados');
        } finally {
          setInternalLoading(false);
        }
      };
      
      loadData();
    }
  }, [fetchData, controlledLoading]);

  // Renderização de loading
  if (loading) {
    return loadingComponent || (
      <div className="table-loading-container">
        <Spinner />
        <p>Carregando dados...</p>
      </div>
    );
  }

  // Renderização de erro
  if (error) {
    const handleRetry = () => {
      if (onRetry) {
        onRetry();
      } else if (fetchData && controlledLoading === undefined) {
        // Tenta novamente se estamos gerenciando internamente
        const loadData = async () => {
          setInternalLoading(true);
          setInternalError(null);
          try {
            const result = await fetchData();
            setInternalData(result);
          } catch (err) {
            setInternalError(err.message || 'Erro ao carregar dados');
          } finally {
            setInternalLoading(false);
          }
        };
        
        loadData();
      }
    };

    return errorComponent || (
      <div className="table-error-container">
        <p className="table-error-message">Erro ao carregar os dados: {error}</p>
        <button 
          onClick={handleRetry}
          className="table-retry-button"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Renderização normal da tabela
  return (
    <div className="table-container">
      <table
        ref={ref}
        className={`table ${className || ''}`}
        {...props}
      />
    </div>
  );
});

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={`table-header ${className || ''}`} {...props} />
));

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={`table-body ${className || ''}`} {...props} />
));

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={`table-footer ${className || ''}`} {...props} />
));

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={`table-row ${className || ''}`} {...props} />
));

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th ref={ref} className={`table-head ${className || ''}`} {...props} />
));

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={`table-cell ${className || ''}`} {...props} />
));

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={`table-caption ${className || ''}`} {...props} />
));

Table.displayName = "Table";
TableHeader.displayName = "TableHeader";
TableBody.displayName = "TableBody";
TableFooter.displayName = "TableFooter";
TableHead.displayName = "TableHead";
TableRow.displayName = "TableRow";
TableCell.displayName = "TableCell";
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  Spinner
};