# AeroDristi 🎯

**Automated Cadastral Mapping // Neural Core v2.0**

AeroDristi is a high-tech, automated web GIS prototype that ingests drone orthomosaics and deploys **SegFormer** machine learning models coupled with **Douglas-Peucker** geometric regularization. It instantly extracts, classifies, and assesses building footprints and land boundaries, outputting standardized GeoJSON ready for analysis. 

Featuring a highly responsive, sci-fi inspired "Neural Core" interface, AeroDristi provides users with real-time tactical mapping data, including computed area, perimeter, regularity indices, and automated tax assessments.

---

## 🚀 Features

- **Sci-Fi HUD Interface**: A sleek, dark-mode, tech-focused UI built with React, Tailwind CSS v4, and Framer Motion.
- **Dynamic Masking**: Uploaded drone imagery is rendered in a tactical grayscale, while detected parcels "punch through" in full raw color using dynamic SVG clipping paths.
- **Machine Learning Pipeline**: A Python/FastAPI backend utilizing OpenCV and Shapely to process imagery, detect structural contours, and apply orthogonal simplification.
- **Real-time Assessment**: Instantly computes spatial metrics (Area in Sq.M, Perimeter) and evaluates a tax assessment based on building classification.
- **GeoJSON Ready**: All detected parcels are packaged as standardized GeoJSON Feature Collections for easy export to QGIS, ArcGIS, or other GIS platforms.

---

## 🛠️ Tech Stack

**Frontend (Client)**
- React (Vite)
- Tailwind CSS v4
- Framer Motion (Animations)
- Lucide React (Icons)

**Backend (API Engine)**
- Python 3.10
- FastAPI & Uvicorn
- OpenCV (Computer Vision / Contour extraction)
- Shapely (Geometric processing)
- Docker

---

## 💻 Local Setup & Installation

### 1. The Frontend (React/Vite)

Navigate to the frontend directory:
```bash
cd frontend-react
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
*The frontend will be available at `http://localhost:5173`.*

---

### 2. The Backend (FastAPI)

The backend handles the OpenCV processing and requires Python. The easiest way to run it is via Docker.

**Option A: Using Docker (Recommended)**
Ensure Docker Desktop is running, then execute:
```bash
cd backend-fastapi
docker build -t aerodristi-api .
docker run -d -p 8000:8000 --name aerodristi-backend aerodristi-api
```

**Option B: Using Local Python**
If you have Python installed locally and prefer not to use Docker:
```bash
cd backend-fastapi
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*The backend API will be available at `http://localhost:8000`.*

---

## 🛸 Usage

1. Launch both the frontend and backend servers.
2. Open `http://localhost:5173` in your browser.
3. Click **"Initialize Neural Core"** on the landing page to enter the dashboard.
4. Drag and drop a drone orthomosaic image (JPG/PNG/TIF) into the Telemetry Input dropzone.
5. AeroDristi will transmit the image to the backend, extract the footprints, and project the tactical overlay directly onto your map canvas.

---

## 📄 License
This project was built as a prototype for the Smart India Hackathon (SIH). All rights reserved.
