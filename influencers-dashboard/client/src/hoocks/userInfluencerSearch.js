import { useState, useCallback, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar o estado de busca de influenciadores
 * com suporte para diferentes APIs e parâmetros de filtragem
 * 
 * @param {Object} options Opções de configuração do hook
 * @param {Function} options.fetchFunction Função que realiza a busca na API
 * @param {Object} options.initialFilters Filtros iniciais
 * @param {number} options.defaultLimit Limite padrão de resultados por página
 * @returns {Object} Estado e funções para gerenciar a busca
 */
const useInfluencerSearch = ({
    fetchFunction,
    initialFilters = {},
    defaultLimit = 10
}) => {
    const [filters, setFilters] = useState({
        search: '',
        page: 1,
        limit: defaultLimit,
        ...initialFilters
    });

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // Função para atualizar filtros preservando os valores existentes
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            // Se o termo de busca mudar, resetamos para a primeira página
            ...(newFilters.search !== undefined && prev.search !== newFilters.search ? { page: 1 } : {})
        }));
    }, []);

    // Função para buscar a próxima página de resultados
    const loadMoreResults = useCallback(() => {
        if (!loading && hasMore) {
            updateFilters({ page: filters.page + 1 });
        }
    }, [loading, hasMore, filters.page, updateFilters]);

    // Função principal de busca
    const searchInfluencers = useCallback(async (append = false) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchFunction(filters);

            if (response && response.data) {
                setResults(prev => append ? [...prev, ...response.data] : response.data);
                setTotalResults(response.total || response.data.length);
                setHasMore(response.hasMore || response.data.length === filters.limit);
            }
        } catch (err) {
            setError(err.message || 'Erro ao buscar influenciadores');
            console.error('Erro na busca de influenciadores:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, fetchFunction]);

    // Efeito para realizar a busca quando os filtros mudam
    useEffect(() => {
        // Se estamos na página 1, substituímos os resultados
        // Caso contrário, acrescentamos à lista existente
        const shouldAppend = filters.page > 1;
        searchInfluencers(shouldAppend);
    }, [filters, searchInfluencers]);

    // Função para limpar os filtros
    const resetFilters = useCallback(() => {
        setFilters({
            search: '',
            page: 1,
            limit: defaultLimit,
            ...initialFilters
        });
    }, [defaultLimit, initialFilters]);

    return {
        filters,
        results,
        loading,
        error,
        totalResults,
        hasMore,
        updateFilters,
        loadMoreResults,
        resetFilters
    };
};

export default useInfluencerSearch;