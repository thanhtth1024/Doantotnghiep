const RASA_URL = import.meta.env.VITE_RASA_URL || 'http://localhost:5005';

export const rasaService = {
  async sendMessage(sender, message, metadata = {}) {
    const response = await fetch(`${RASA_URL}/webhooks/rest/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, message, metadata }),
    });

    if (!response.ok) {
      throw new Error(`Rasa responded with ${response.status}`);
    }

    return response.json();
  },
};
