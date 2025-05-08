# AI Body Pose Analyzer

A modern, responsive web application for AI-based body pose analysis using MediaPipe and OpenPose (PoseNet).

## Features

### Frontend
- Live camera feed with real-time pose tracking
- Support for multiple tracking modes:
  - MediaPipe
  - OpenPose (PoseNet)
  - Hybrid (both)
- Analysis types:
  - Posture analysis
  - Fitness tracking
  - Dance movement
  - Custom analysis
- Exercise tracking:
  - Squats
  - Push-ups
  - Shoulder press
  - Lunges
- Real-time statistics:
  - Joint angles (shoulder, elbow, knee)
  - Repetition counting
  - Posture quality detection
- Data visualization with Chart.js
- CSV export for collected data
- Dark mode
- Mobile responsive design
- Toast notifications for posture alerts

### Backend
- Express.js server for serving the application
- API endpoints for:
  - Pose analysis
  - Repetition counting
  - Posture checking
- File upload handling with Multer

## Technologies Used

- **Frontend**:
  - HTML5, CSS3, JavaScript
  - MediaPipe Pose (via JavaScript API)
  - TensorFlow.js with PoseNet
  - Chart.js for data visualization
  - Toastify for notifications

- **Backend**:
  - Node.js with Express
  - Multer for file handling
  - CORS for cross-origin requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-body-pose-analyzer.git
   cd ai-body-pose-analyzer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Running without a server

You can also run the application without a server by simply opening the `pose-analyzer.html` file in your browser. However, some features like backend pose analysis will not be available.

## Usage

1. Click "Start Camera" to begin pose tracking
2. Select your preferred tracking mode (MediaPipe, OpenPose, or Hybrid)
3. Choose an analysis type and exercise
4. Perform exercises and see real-time feedback
5. Download your data as CSV for further analysis

## Deployment

### Vercel

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```

### Heroku

1. Install Heroku CLI and login:
   ```
   npm install -g heroku
   heroku login
   ```

2. Create a new Heroku app:
   ```
   heroku create
   ```

3. Deploy to Heroku:
   ```
   git push heroku main
   ```

## Customization

### Adding New Exercises

To add new exercises, modify the `exercise-type` select options in the HTML and add corresponding angle calculation and repetition counting logic in the JavaScript file.

### Extending Backend Analysis

The backend server includes placeholder endpoints that can be extended with more sophisticated pose analysis using Python libraries like MediaPipe or OpenPose.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MediaPipe team for their excellent pose estimation library
- TensorFlow.js team for PoseNet
- Chart.js for data visualization
- All contributors to the open-source libraries used in this project
