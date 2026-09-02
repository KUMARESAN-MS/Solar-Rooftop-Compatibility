# How to Run the SolarPredict Project

This guide explains how to start both the backend and frontend servers, and how you can provide inputs to get the solar prediction results, either via the Frontend UI or the Backend API.

---

## 1. Prerequisites

Make sure you have the following installed on your system:
- **Python 3.9+**
- **Node.js 18+** & **npm**

---

## 2. Starting the Servers

The project is split into a **backend** (Python/FastAPI) and a **frontend** (React/Vite). You need to run both in separate terminal windows.

### Step 2.1: Start the Backend (Terminal 1)

1. Open a terminal and navigate to the `backend` folder:
   ```cmd
   cd c:\Users\kumar\OneDrive\Desktop\EVS\backend
   ```
2. Activate the virtual environment:
   ```cmd
   .\venv\Scripts\activate
   ```
3. Start the FastAPI server:
   ```cmd
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *The backend will now be running at `http://localhost:8000`.*

### Step 2.2: Start the Frontend (Terminal 2)

1. Open a second terminal and navigate to the `frontend` folder:
   ```cmd
   cd c:\Users\kumar\OneDrive\Desktop\EVS\frontend
   ```
2. Start the Vite development server:
   ```cmd
   npm run dev
   ```
   *The frontend will now be running at `http://localhost:5173`.*

---

## 3. How to Give Input and Get Output

Since the project is under active development, you have two ways to interact with the system:

### Method A: Using the Frontend (React UI)
1. Open your browser and go to `http://localhost:5173`.
2. You will see the **Landing Page**. Click on **Analyze Your Roof**.
3. **Step 1 (Location):** Drop a pin on the map for your house (e.g., somewhere in Hyderabad).
4. **Step 2 (Property Details):** Select your building type, rooftop area in square meters, and how much of it is usable.
5. **Step 3 (Electricity Usage):** Enter your average monthly electricity bill or units consumed (kWh).
6. **Submit:** The app will fetch solar data, run the physics engine and ML model, and then present your recommended system size, costs, savings, and CO2 offset on the results dashboard.

*(Note: If the frontend wizard is still being built, use Method B to test the core logic).*

### Method B: Using the Backend API directly (Swagger UI)
FastAPI provides a beautiful, auto-generated UI to test all the endpoints without writing any code.

1. Make sure your backend is running.
2. Open your browser and go to: `http://localhost:8000/docs`
3. Scroll down to the **Analysis** section and find the `POST /api/v1/analyze` endpoint.
4. Click on the endpoint to expand it, then click the **"Try it out"** button on the right.
5. You will see a text box containing a JSON payload. Replace it with your property details. 
   
   **Example Input:**
   ```json
   {
     "latitude": 17.3850,
     "longitude": 78.4867,
     "roof_area_sqm": 120,
     "monthly_bill": 2500
   }
   ```
   *(This represents a house in Hyderabad with a 120 sqm roof, with a monthly bill of $2500 (or INR 2500)).*

6. Click the large blue **"Execute"** button.
7. Scroll down slightly to see the **Server response**. You will get a detailed JSON output containing:
   - `recommended_system`: The ideal kW size for this roof.
   - `generation`: Annual and monthly kWh estimates (refined by the ML model).
   - `financials`: Installation cost, subsidy received, net cost, annual savings, and payback period.
   - `environmental`: CO2 avoided per year and trees equivalent.

---

## Troubleshooting

- **"ModuleNotFoundError" when running the backend:** Ensure you have activated the virtual environment (`.\venv\Scripts\activate`) before running the server.
- **Port already in use:** If port 8000 or 5173 is busy, stop any other running processes or restart your terminal.
- **API Offline on Frontend:** Make sure the backend server (Terminal 1) is running before you load the frontend page.
