# 3D Human Pose Estimation with MediaPipe

A web-based application for 3D human pose estimation using MediaPipe, designed for musculoskeletal telerehabilitation.

## Live Demo

You can access the live demo at:
- GitHub Pages: https://rahmivinnn.github.io/mediapipetest/
- Or directly open the [fixed_demo.html](fixed_demo.html) file in your browser

## Features

- **Real-time Pose Tracking**: Track human pose in real-time using your webcam
- **Exercise Selection**: Choose from 8 different exercises to track specific joint angles:
  1. Shoulder Flexion/Extension
  2. Shoulder Abduction/Adduction
  3. Elbow Flexion/Extension
  4. Shoulder Press
  5. Hip Abduction/Adduction
  6. Squat
  7. March
  8. Seated Knee Flexion/Extension
- **3D Visualization**: View a 3D representation of the detected pose
- **Angle Measurement**: Real-time calculation and display of joint angles
- **Recording**: Record sessions and download the videos
- **Data Analysis**: View angle measurements over time and download the data as CSV
- **Responsive Design**: Works on both desktop and mobile devices

## How to Use

1. Open the demo in your browser
2. Click "Start Webcam" to begin pose tracking
3. Allow camera permissions when prompted
4. Select an exercise from the dropdown menu
5. Perform the exercise and see the angle measurements update in real-time
6. Use the recording features to capture your session
7. Download the data for further analysis

## Technical Details

This application uses:
- MediaPipe Pose for real-time pose estimation
- HTML5 Canvas for rendering
- Chart.js for data visualization
- Browser APIs for webcam access and recording

## Deployment

This application can be deployed to:
- GitHub Pages (current deployment)
- Vercel (configuration included)
- Any static web hosting service

## License

This project is based on the [3D-HPE-MediaPipe-Pose](https://github.com/carolinaclemente00/3D-HPE-MediaPipe-Pose) repository and is released under BSD 3-clause License.

## Disclaimer

This program is distributed in the hope it will be useful and provided to you "as is", but WITHOUT ANY WARRANTY, without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. This program is NOT intended for medical diagnosis.
