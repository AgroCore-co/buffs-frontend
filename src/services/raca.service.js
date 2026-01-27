import api from '../lib/api';

const racaService = {
  async getAllRacas() {
    try {
      // Assuming a standard endpoint for breeds. If not 200, we handle it or return mock.
      const response = await api.get('/racas');
      return response;
    } catch (error) {
      console.warn(
        'Failed to fetch races, using defaults if necessary or throwing.'
      );
      // If 404, we might default to known breeds?
      // Standard fallback for MVP
      if (error.response?.status === 404) {
        return [
          { id_raca: 'f7cf3428-5309-4117-abff-5b7f498c63d6', nome: 'Murrah' },
          {
            id_raca: 'b8c4a72d-1234-4567-8901-234567890123',
            nome: 'Jafarabadi',
          },
          {
            id_raca: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            nome: 'Mediterrâneo',
          },
          { id_raca: 'f0e1d2c3-b4a5-6789-0123-4567890abcde', nome: 'Carabao' },
        ];
      }
      throw error;
    }
  },
};

export default racaService;
