import React from "react";
import '@/styles/components/ui/TablePagination.css';


const TablePagination = React.forwardRef(({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
    className = '',
    ...props
}, ref) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Gerar array de páginas a serem exibidas
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Mostrar todas as páginas se forem poucas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar páginas específicas
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            // Ajustar se estiver no final
            if (endPage === totalPages) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            // Adicionar primeira página
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
            }

            // Adicionar páginas intermediárias
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Adicionar última página
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div ref={ref} className={`table-pagination ${className}`} {...props}>
            <div className="table-pagination-info">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
            </div>

            <div className="table-pagination-controls">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="table-pagination-button"
                >
                    Anterior
                </button>

                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                        className={`table-pagination-button ${page === currentPage
                            ? 'table-pagination-button-active'
                            : typeof page === 'number'
                                ? ''
                                : 'table-pagination-button-disabled'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="table-pagination-button"
                >
                    Próxima
                </button>
            </div>
        </div>
    );
});

TablePagination.displayName = "TablePagination";

export default TablePagination;