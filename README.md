# Clone and run
```bash
git clone https://github.com/devu5-6/aimonk-labs.git
```

In backend - Go to its integrated terminal and run 
```bash
pip install -r requirements.txt
```
To run backend
```bash
uvicorn main:app --reload
```
In frontend - Go to its integrated terminal and run 
```bash
npm install
```
```bash
npm run dev
```
# Backend Setup (FastAPI)

## 1. Navigate to the backend directory (or create one)

```bash
mkdir backend
cd backend
```

## 2. Create a virtual environment

```bash
python -m venv .venv
```

## 3. Activate the virtual environment

* **Windows:**

```bash
.venv\\Scripts\\activate
```

* **Mac/Linux:**

```bash
source .venv/bin/activate
```

## 4. Install dependencies

Create a `requirements.txt` file with the necessary packages and run:

```bash
pip install -r requirements.txt
```

## 5. Configure Environment Variables

Create a `.env` file in the root of the backend folder:

```env
# Format: postgresql://<username>:<password>@localhost/<database_name>
DATABASE_URL=postgresql://postgres:root@localhost/tree_db
```

## 6. Run the server

```bash
uvicorn main:app --reload
```

* Server will start at: http://127.0.0.1:8000
* API docs available at: http://127.0.0.1:8000/docs

---

# Frontend Setup (React + Vite + Tailwind)

## 1. Navigate to frontend directory

```bash
cd frontend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

> Ensure:
>
> * `tailwind.config.js` scans: `src/**/*.{js,jsx}`
> * Tailwind directives are added in `index.css`

## 4. Configure Environment Variables

Create a `.env` file in the root of the frontend folder (next to `package.json`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 5. Run the React application

```bash
npm run dev
```

* Frontend usually starts at: http://localhost:5173
