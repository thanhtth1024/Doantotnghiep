# Rasa shopping assistant

## Run locally

Install Rasa in a Python environment compatible with the chosen Rasa release, then run from this folder:

```bash
rasa train
rasa run actions
rasa run --enable-api --cors "*"
```

On Windows, use the project virtual environment without activating it:

```bat
.venv\Scripts\python.exe -m rasa train
.venv\Scripts\python.exe -m rasa run actions --port 5055
.venv\Scripts\python.exe -m rasa run --enable-api --cors "*"
```

The REST webhook used by the frontend is:

`POST http://localhost:5005/webhooks/rest/webhook`

The frontend defaults to that URL. To use another host, create `ecommerce-ui/.env`:

```env
VITE_RASA_URL=http://localhost:5005
```

The initial model covers greetings, product discovery, price, shipping, payment, orders, thanks, and fallback questions. Authenticated messages carry the user's JWT metadata to the custom action server: order questions call `/orders/my-orders`, while product and price questions call `/products`. Guests receive basic answers and are asked to log in before private order data is shown.
