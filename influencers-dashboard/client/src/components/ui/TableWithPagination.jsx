import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./EnhancedTable";
import TablePagination from "./TablePagination";
import { normalizeApiError } from "@/lib/errorMessages";
import useAsyncState from "@/hooks/useAsyncState";

/**
 * Componente de tabela com paginação que integra o gerenciamento de
 * estados assíncronos e tratamento padronizado de erros
 */
const TableWithPagination = ({
    data = [],
    columns = [],
    fetchData = null,
    itemsPerPage = 10,
    initialPage = 1,
    totalItems = null,
    loading: externalLoading = false,
    error: externalError = null,
    className = '',
    emptyMessage = 'Nenhum dado encontrado',
    onRowClick = null,
    sortable = false,
    defaultSortColumn = null,
    defaultSortDirection = 'asc',
}) => {
    // Estado de paginação
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sortColumn, setSortColumn] = useState(defaultSortColumn);
    const [sortDirection, setSortDirection] = useState(defaultSortDirection);

    // Usando o hook useAsyncState para gerenciar estados da tabela
    const {
        data: tableData,
        loading: asyncLoading,
        error: asyncError,
        execute,
        clearError
    } = useAsyncState(data);

    // Combina loading e error externos com os estados assíncronos internos
    const isLoading = externalLoading || asyncLoading;
    const error = externalError || asyncError;

    // Calcula o número total de páginas
    const totalPages = totalItems
        ? Math.ceil(totalItems / itemsPerPage)
        : Math.ceil(tableData.length / itemsPerPage);

    // Calcula os itens a serem exibidos na página atual
    const displayItems = () => {
        // Se temos fetchData, assumimos que a paginação é controlada externamente
        if (fetchData) {
            return tableData || [];
        }

        // Caso contrário, fazemos a paginação no cliente
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return tableData.slice(startIndex, endIndex);
    };

    // Função para lidar com a mudança de página
    const handlePageChange = async (page) => {
        if (page === currentPage) return;

        setCurrentPage(page);

        // Se temos uma função fetchData, executamos para obter dados da nova página
        if (fetchData) {
            try {
                await execute(() =>
                    fetchData({ page, itemsPerPage, sortColumn, sortDirection })
                );
            } catch (err) {
                // O erro já é tratado pelo hook useAsyncState
                console.error("Erro ao buscar dados para a página", page, err);
            }
        }
    };

    // Função para lidar com a ordenação de colunas
    const handleSort = async (column) => {
        if (!sortable) return;

        // Determina a nova direção de ordenação
        const newDirection =
            column === sortColumn
                ? sortDirection === 'asc' ? 'desc' : 'asc'
                : 'asc';

        setSortColumn(column);
        setSortDirection(newDirection);

        // Se temos fetchData, buscamos dados com a nova ordenação
        if (fetchData) {
            try {
                await execute(() =>
                    fetchData({
                        page: currentPage,
                        itemsPerPage,
                        sortColumn: column,
                        sortDirection: newDirection
                    })
                );
            } catch (err) {
                console.error("Erro ao ordenar dados", err);
            }
        } else {
            // Ordenação local se não temos fetchData
            const sortedData = [...tableData].sort((a, b) => {
                if (a[column] < b[column]) return newDirection === 'asc' ? -1 : 1;
                if (a[column] > b[column]) return newDirection === 'asc' ? 1 : -1;
                return 0;
            });

            // Atualiza os dados da tabela com os dados ordenados
            setTableData(sortedData);
        }
    };

    // Efeito para buscar dados quando componente monta ou parâmetros mudam
    useEffect(() => {
        if (fetchData) {
            execute(() =>
                fetchData({
                    page: currentPage,
                    itemsPerPage,
                    sortColumn,
                    sortDirection
                })
            );
        }
    }, []);

    // Tentativa de nova requisição em caso de erro
    const handleRetry = () => {
        clearError();
        if (fetchData) {
            execute(() =>
                fetchData({
                    page: currentPage,
                    itemsPerPage,
                    sortColumn,
                    sortDirection
                })
            );
        }
    };

    // Renderização dos itens atuais
    const currentItems = displayItems();

    return (
        <div className={`table-with-pagination ${className}`}>
            <Table className="table-responsive">
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                sortable={sortable && column.sortable}
                                sorted={sortColumn === column.key}
                                sortDirection={sortColumn === column.key ? sortDirection : null}
                                onSort={column.sortable ? () => handleSort(column.key) : null}
                            >
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody
                    loading={isLoading}
                    error={error ? normalizeApiError(error) : null}
                    emptyMessage={emptyMessage}
                    colSpan={columns.length}
                    onRetry={handleRetry}
                >
                    {currentItems.map((item, index) => (
                        <TableRow
                            key={item.id || index}
                            clickable={!!onRowClick}
                            onClick={onRowClick ? () => onRowClick(item) : undefined}
                        >
                            {columns.map((column) => (
                                <TableCell key={column.key}>
                                    {column.render ? column.render(item) : item[column.key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <TablePagination
                    currentPage={currentPage}
                    totalItems={totalItems || tableData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    disabled={isLoading}
                />
            )}
        </div>
    );
};

export default TableWithPagination;