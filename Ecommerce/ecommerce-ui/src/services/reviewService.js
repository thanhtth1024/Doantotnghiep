import api from './api';

export const reviewService = {
  async getProductReviews(productId) {
    const response = await api.get('/reviews', { params: { productId } });
    return response.data;
  },

  async getAllReviews() {
    const response = await api.get('/reviews');
    return response.data;
  },

  async createReview(productId, rating, comment) {
    const response = await api.post('/reviews', { productId, rating, comment });
    return response.data;
  },

  async updateReview(id, rating, comment) {
    const response = await api.patch(`/reviews/${id}`, { rating, comment });
    return response.data;
  },

  async deleteReview(id) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};
