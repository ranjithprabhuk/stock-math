# Stock Math

A simple web application for looking up stock information and performing basic calculations. This app utilizes the Alpha Vantage API to fetch real-time stock data.

**Live Demo:** https://ranjithprabhuk.github.io/stock-math/

**Tagline:** Empower Your Investments with Data-Driven Insights

## Features

- **Search for Stocks:** Quickly search for stocks by their symbol (e.g., AAPL, MSFT, GOOG). The application uses autocomplete to suggest matches as you type.
- **Stock Information:** View basic information about a selected stock (currently limited, more features planned).

## Technologies Used

- **React:** The core JavaScript library for building the user interface.
- **Mantine UI:** A React component library for styling and UI elements.
- **@tabler/icons-react:** Icon library.
- **Alpha Vantage API:** Provides real-time stock data.
- **React Router:** Handles client-side routing.

## Getting Started (For Developers)

This project was bootstrapped with Create React App.

**Prerequisites:**

- Node.js and npm (or yarn) installed on your system.

**Installation:**

1.  Clone the repository:
    ```bash
    git clone https://github.com/ranjithprabhuk/stock-math.git
    ```
2.  Navigate to the project directory:

    ```bash
    cd stock-math
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Set your Alpha Vantage API Key:

    - Add your Alpha Vantage API key to the `.env` file: `REACT_APP_ALPHA_VANTAGE_API_KEY=YOUR_API_KEY`
    - If you don't have an API key, obtain one for free from [Alpha Vantage](https://www.alphavantage.co/). The app will use the demo key by default if `.env` is not configured.

5.  Start the development server:

    ```bash
    npm start
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

Specify your license here, e.g., MIT License
