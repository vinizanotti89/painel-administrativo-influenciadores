export const handleApiError = (error, platform) => {
    console.error(`${platform} API Error:`, error);
    
    if (error.response) {
      // Error response from the API
      switch (error.response.status) {
        case 429:
          return { error: 'Limite de requisições atingido. Tente novamente mais tarde.' };
        case 403:
          return { error: 'Erro de autenticação. Verifique as credenciais da API.' };
        case 404:
          return { error: 'Influenciador não encontrado.' };
        default:
          return { error: `Erro ao buscar dados do ${platform}. Tente novamente.` };
      }
    }
    
    if (error.request) {
      // Request made but no response received
      return { error: 'Erro de conexão. Verifique sua internet.' };
    }
    
    // Something else went wrong
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' };
  };
  
  export const formatNumberToK = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };
  
  export const calculateEngagementRate = (interactions, followers) => {
    if (!followers || followers === 0) return 0;
    return ((interactions / followers) * 100).toFixed(2);
  };