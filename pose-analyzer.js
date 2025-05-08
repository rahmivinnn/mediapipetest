// DOM Elements
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output-canvas');
const startCameraButton = document.getElementById('start-camera');
const stopCameraButton = document.getElementById('stop-camera');
const trackingModeSelect = document.getElementById('tracking-mode');
const analysisTypeSelect = document.getElementById('analysis-type');
const exerciseTypeSelect = document.getElementById('exercise-type');
const shoulderAngleElement = document.getElementById('shoulder-angle');
const elbowAngleElement = document.getElementById('elbow-angle');
const kneeAngleElement = document.getElementById('knee-angle');
const repCountElement = document.getElementById('rep-count');
const postureQualityElement = document.getElementById('posture-quality');
const logContainerElement = document.getElementById('log-container');
const downloadCsvButton = document.getElementById('download-csv');
const statusMessageElement = document.getElementById('status-message');
const themeToggleButton = document.getElementById('theme-toggle');
const angleChartCanvas = document.getElementById('angle-chart');

// Global variables
let camera = null;
let mediaPipePose = null;
let posenetModel = null;
let currentTrackingMode = 'mediapipe';
let currentAnalysisType = 'posture';
let currentExerciseType = 'none';
let isTracking = false;
let videoStream = null;
let angleData = [];
let timeData = [];
let repCount = 0;
let lastRepState = false;
let startTime = null;
let angleChart = null;
let poseData = [];
let isPostureBad = false;
let badPostureTimeout = null;

// Initialize the application
function init() {
    // Set up event listeners
    startCameraButton.addEventListener('click', startCamera);
    stopCameraButton.addEventListener('click', stopCamera);
    trackingModeSelect.addEventListener('change', changeTrackingMode);
    analysisTypeSelect.addEventListener('change', changeAnalysisType);
    exerciseTypeSelect.addEventListener('change', changeExerciseType);
    downloadCsvButton.addEventListener('click', downloadCsv);
    themeToggleButton.addEventListener('click', toggleTheme);
    
    // Initialize chart
    initChart();
    
    // Log initialization
    updateLog('Application initialized. Ready to start.');
}

// Initialize Chart.js
function initChart() {
    const ctx = angleChartCanvas.getContext('2d');
    angleChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Primary Angle',
                data: [],
                borderColor: '#03dac6',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    },
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Angle (°)'
                    },
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

// Start camera and tracking
async function startCamera() {
    try {
        showStatus('Requesting camera access...', 'success');
        
        // Request camera access
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        webcamElement.srcObject = videoStream;
        
        // Wait for video to be ready
        webcamElement.onloadedmetadata = async () => {
            // Initialize canvas
            canvasElement.width = webcamElement.videoWidth;
            canvasElement.height = webcamElement.videoHeight;
            
            // Initialize tracking based on selected mode
            await initializeTracking();
            
            // Update UI
            startCameraButton.disabled = true;
            stopCameraButton.disabled = false;
            isTracking = true;
            startTime = Date.now();
            
            // Clear data
            angleData = [];
            timeData = [];
            repCount = 0;
            repCountElement.textContent = '0';
            
            // Update chart
            updateChart();
            
            showStatus('Camera started. Tracking pose...', 'success');
            updateLog('Camera started. Tracking in ' + currentTrackingMode + ' mode.');
        };
    } catch (error) {
        console.error('Error starting camera:', error);
        showStatus('Could not access camera: ' + error.message, 'error');
    }
}

// Stop camera and tracking
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        webcamElement.srcObject = null;
    }
    
    if (camera) {
        camera.stop();
    }
    
    // Clear canvas
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Update UI
    startCameraButton.disabled = false;
    stopCameraButton.disabled = true;
    isTracking = false;
    
    showStatus('Camera stopped', 'success');
    updateLog('Camera and tracking stopped.');
}

// Initialize tracking based on selected mode
async function initializeTracking() {
    currentTrackingMode = trackingModeSelect.value;
    
    if (currentTrackingMode === 'mediapipe' || currentTrackingMode === 'hybrid') {
        await initializeMediaPipe();
    }
    
    if (currentTrackingMode === 'openpose' || currentTrackingMode === 'hybrid') {
        await initializePoseNet();
    }
}

// Initialize MediaPipe Pose
async function initializeMediaPipe() {
    showStatus('Loading MediaPipe model...', 'success');
    
    mediaPipePose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });
    
    mediaPipePose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    mediaPipePose.onResults(onMediaPipeResults);
    
    camera = new Camera(webcamElement, {
        onFrame: async () => {
            if (isTracking && (currentTrackingMode === 'mediapipe' || currentTrackingMode === 'hybrid')) {
                await mediaPipePose.send({ image: webcamElement });
            }
        },
        width: 1280,
        height: 720
    });
    
    await camera.start();
    showStatus('MediaPipe model loaded', 'success');
}

// Initialize PoseNet (OpenPose alternative)
async function initializePoseNet() {
    showStatus('Loading PoseNet model...', 'success');
    
    try {
        posenetModel = await posenet.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75
        });
        
        if (currentTrackingMode === 'openpose') {
            // Start PoseNet detection loop
            detectPoseNetFrame();
        }
        
        showStatus('PoseNet model loaded', 'success');
    } catch (error) {
        console.error('Error loading PoseNet:', error);
        showStatus('Error loading PoseNet: ' + error.message, 'error');
    }
}

// Process MediaPipe results
function onMediaPipeResults(results) {
    if (!isTracking) return;
    
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the pose landmarks
    if (results.poseLandmarks) {
        // Draw pose connections
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        
        // Draw landmarks
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
        
        // Process pose data
        processPoseData(results.poseLandmarks, 'mediapipe');
    }
    
    canvasCtx.restore();
}

// Detect pose using PoseNet
async function detectPoseNetFrame() {
    if (!isTracking || !posenetModel || currentTrackingMode !== 'openpose') return;
    
    try {
        const pose = await posenetModel.estimateSinglePose(webcamElement, {
            flipHorizontal: false
        });
        
        if (pose.score > 0.2) {
            drawPoseNetResults(pose);
            processPoseData(pose.keypoints, 'posenet');
        }
        
        // Continue detection loop
        requestAnimationFrame(detectPoseNetFrame);
    } catch (error) {
        console.error('PoseNet detection error:', error);
    }
}

// Draw PoseNet results
function drawPoseNetResults(pose) {
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw keypoints
    pose.keypoints.forEach(keypoint => {
        if (keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#FF0000';
            ctx.fill();
        }
    });
    
    // Draw skeleton
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, 0.5);
    adjacentKeyPoints.forEach(keypoints => {
        ctx.beginPath();
        ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
        ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00FF00';
        ctx.stroke();
    });
}

// Process pose data from either model
function processPoseData(landmarks, source) {
    // Store pose data for CSV export
    const timestamp = (Date.now() - startTime) / 1000;
    
    // Calculate angles based on the source
    let shoulderAngle, elbowAngle, kneeAngle;
    
    if (source === 'mediapipe') {
        // MediaPipe landmarks
        shoulderAngle = calculateMediaPipeShoulderAngle(landmarks);
        elbowAngle = calculateMediaPipeElbowAngle(landmarks);
        kneeAngle = calculateMediaPipeKneeAngle(landmarks);
    } else {
        // PoseNet keypoints
        shoulderAngle = calculatePoseNetShoulderAngle(landmarks);
        elbowAngle = calculatePoseNetElbowAngle(landmarks);
        kneeAngle = calculatePoseNetKneeAngle(landmarks);
    }
    
    // Update UI with angles
    shoulderAngleElement.textContent = `${shoulderAngle.toFixed(1)}°`;
    elbowAngleElement.textContent = `${elbowAngle.toFixed(1)}°`;
    kneeAngleElement.textContent = `${kneeAngle.toFixed(1)}°`;
    
    // Store data for export
    poseData.push({
        timestamp,
        shoulderAngle,
        elbowAngle,
        kneeAngle,
        source
    });
    
    // Update chart with primary angle based on exercise type
    let primaryAngle;
    switch (currentExerciseType) {
        case 'squat':
            primaryAngle = kneeAngle;
            break;
        case 'pushup':
            primaryAngle = elbowAngle;
            break;
        case 'shoulderpress':
            primaryAngle = shoulderAngle;
            break;
        default:
            primaryAngle = shoulderAngle;
    }
    
    // Add data to chart
    timeData.push(timestamp);
    angleData.push(primaryAngle);
    
    // Keep only the last 100 data points for performance
    if (timeData.length > 100) {
        timeData.shift();
        angleData.shift();
    }
    
    // Update chart
    updateChart();
    
    // Check for repetitions
    countRepetitions(primaryAngle);
    
    // Check posture
    checkPosture(shoulderAngle, elbowAngle, kneeAngle);
}

// Calculate angles for MediaPipe landmarks
function calculateMediaPipeShoulderAngle(landmarks) {
    const shoulder = landmarks[11]; // Right shoulder
    const elbow = landmarks[13]; // Right elbow
    const hip = landmarks[23]; // Right hip
    
    return calculateAngleBetweenPoints(hip, shoulder, elbow);
}

function calculateMediaPipeElbowAngle(landmarks) {
    const shoulder = landmarks[11]; // Right shoulder
    const elbow = landmarks[13]; // Right elbow
    const wrist = landmarks[15]; // Right wrist
    
    return calculateAngleBetweenPoints(shoulder, elbow, wrist);
}

function calculateMediaPipeKneeAngle(landmarks) {
    const hip = landmarks[23]; // Right hip
    const knee = landmarks[25]; // Right knee
    const ankle = landmarks[27]; // Right ankle
    
    return calculateAngleBetweenPoints(hip, knee, ankle);
}

// Calculate angles for PoseNet keypoints
function calculatePoseNetShoulderAngle(keypoints) {
    const shoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const elbow = keypoints.find(kp => kp.part === 'rightElbow');
    const hip = keypoints.find(kp => kp.part === 'rightHip');
    
    if (shoulder && elbow && hip && shoulder.score > 0.5 && elbow.score > 0.5 && hip.score > 0.5) {
        return calculateAngleBetweenPoseNetPoints(hip.position, shoulder.position, elbow.position);
    }
    
    return 0;
}

function calculatePoseNetElbowAngle(keypoints) {
    const shoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const elbow = keypoints.find(kp => kp.part === 'rightElbow');
    const wrist = keypoints.find(kp => kp.part === 'rightWrist');
    
    if (shoulder && elbow && wrist && shoulder.score > 0.5 && elbow.score > 0.5 && wrist.score > 0.5) {
        return calculateAngleBetweenPoseNetPoints(shoulder.position, elbow.position, wrist.position);
    }
    
    return 0;
}

function calculatePoseNetKneeAngle(keypoints) {
    const hip = keypoints.find(kp => kp.part === 'rightHip');
    const knee = keypoints.find(kp => kp.part === 'rightKnee');
    const ankle = keypoints.find(kp => kp.part === 'rightAnkle');
    
    if (hip && knee && ankle && hip.score > 0.5 && knee.score > 0.5 && ankle.score > 0.5) {
        return calculateAngleBetweenPoseNetPoints(hip.position, knee.position, ankle.position);
    }
    
    return 0;
}

// Calculate angle between three points (MediaPipe)
function calculateAngleBetweenPoints(pointA, pointB, pointC) {
    const vectorAB = {
        x: pointB.x - pointA.x,
        y: pointB.y - pointA.y,
        z: (pointB.z || 0) - (pointA.z || 0)
    };
    
    const vectorBC = {
        x: pointC.x - pointB.x,
        y: pointC.y - pointB.y,
        z: (pointC.z || 0) - (pointB.z || 0)
    };
    
    // Calculate dot product
    const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y + vectorAB.z * vectorBC.z;
    
    // Calculate magnitudes
    const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y + vectorAB.z * vectorAB.z);
    const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y + vectorBC.z * vectorBC.z);
    
    // Calculate angle in radians
    const angleRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));
    
    // Convert to degrees
    return angleRadians * (180 / Math.PI);
}

// Calculate angle between three points (PoseNet)
function calculateAngleBetweenPoseNetPoints(pointA, pointB, pointC) {
    const vectorAB = {
        x: pointB.x - pointA.x,
        y: pointB.y - pointA.y
    };
    
    const vectorBC = {
        x: pointC.x - pointB.x,
        y: pointC.y - pointB.y
    };
    
    // Calculate dot product
    const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;
    
    // Calculate magnitudes
    const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y);
    const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);
    
    // Calculate angle in radians
    const angleRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));
    
    // Convert to degrees
    return angleRadians * (180 / Math.PI);
}

// Update chart with new data
function updateChart() {
    if (angleChart) {
        angleChart.data.labels = timeData;
        angleChart.data.datasets[0].data = angleData;
        angleChart.update();
    }
}

// Count repetitions based on angle thresholds
function countRepetitions(angle) {
    if (!isTracking || currentExerciseType === 'none') return;
    
    let repState = false;
    let threshold = 0;
    
    switch (currentExerciseType) {
        case 'squat':
            // Squat is counted when knee angle goes below 100 degrees
            repState = angle < 100;
            break;
        case 'pushup':
            // Pushup is counted when elbow angle goes below 90 degrees
            repState = angle < 90;
            break;
        case 'shoulderpress':
            // Shoulder press is counted when shoulder angle goes above 150 degrees
            repState = angle > 150;
            break;
        default:
            return;
    }
    
    // Count a rep when transitioning from rep state to non-rep state
    if (lastRepState && !repState) {
        repCount++;
        repCountElement.textContent = repCount;
        updateLog(`Repetition #${repCount} completed`);
        
        // Show notification
        showToast(`Repetition #${repCount} completed!`, 'success');
    }
    
    lastRepState = repState;
}

// Check posture based on analysis type
function checkPosture(shoulderAngle, elbowAngle, kneeAngle) {
    if (!isTracking || currentAnalysisType !== 'posture') return;
    
    let newPostureStatus = true; // true = good posture
    
    // Simple posture check based on shoulder angle (can be expanded)
    if (shoulderAngle < 80 || shoulderAngle > 110) {
        newPostureStatus = false;
    }
    
    // Update UI if posture status changed
    if (newPostureStatus !== isPostureBad) {
        isPostureBad = newPostureStatus;
        
        if (isPostureBad) {
            postureQualityElement.textContent = 'Poor';
            postureQualityElement.style.color = '#cf6679';
            
            // Clear previous timeout
            if (badPostureTimeout) {
                clearTimeout(badPostureTimeout);
            }
            
            // Show notification after 2 seconds of bad posture
            badPostureTimeout = setTimeout(() => {
                showToast('Poor posture detected! Please correct your position.', 'error');
                updateLog('Poor posture detected');
            }, 2000);
        } else {
            postureQualityElement.textContent = 'Good';
            postureQualityElement.style.color = '#03dac6';
            
            // Clear timeout if posture is corrected
            if (badPostureTimeout) {
                clearTimeout(badPostureTimeout);
                badPostureTimeout = null;
            }
        }
    }
}

// Change tracking mode
function changeTrackingMode() {
    currentTrackingMode = trackingModeSelect.value;
    updateLog(`Tracking mode changed to ${currentTrackingMode}`);
    
    if (isTracking) {
        // Restart tracking with new mode
        stopCamera();
        startCamera();
    }
}

// Change analysis type
function changeAnalysisType() {
    currentAnalysisType = analysisTypeSelect.value;
    updateLog(`Analysis type changed to ${currentAnalysisType}`);
}

// Change exercise type
function changeExerciseType() {
    currentExerciseType = exerciseTypeSelect.value;
    repCount = 0;
    repCountElement.textContent = '0';
    updateLog(`Exercise type changed to ${currentExerciseType}`);
    
    // Update chart label based on exercise
    if (angleChart) {
        let angleLabel = 'Shoulder Angle';
        
        switch (currentExerciseType) {
            case 'squat':
                angleLabel = 'Knee Angle';
                break;
            case 'pushup':
                angleLabel = 'Elbow Angle';
                break;
            case 'shoulderpress':
                angleLabel = 'Shoulder Angle';
                break;
        }
        
        angleChart.data.datasets[0].label = angleLabel;
        angleChart.update();
    }
}

// Download data as CSV
function downloadCsv() {
    if (poseData.length === 0) {
        showToast('No data available to download', 'error');
        return;
    }
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Timestamp,ShoulderAngle,ElbowAngle,KneeAngle,Source\n';
    
    poseData.forEach(data => {
        csvContent += `${data.timestamp},${data.shoulderAngle.toFixed(2)},${data.elbowAngle.toFixed(2)},${data.kneeAngle.toFixed(2)},${data.source}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pose_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    showToast('Data downloaded successfully', 'success');
    updateLog('Data exported to CSV');
}

// Toggle dark/light theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    themeToggleButton.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
}

// Update log message
function updateLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logContainerElement.textContent = `[${timestamp}] ${message}`;
}

// Show status message
function showStatus(message, type) {
    statusMessageElement.textContent = message;
    statusMessageElement.className = `alert alert-${type}`;
    statusMessageElement.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusMessageElement.style.display = 'none';
    }, 3000);
}

// Show toast notification
function showToast(message, type) {
    let backgroundColor = '#03dac6'; // success
    
    if (type === 'error') {
        backgroundColor = '#cf6679';
    } else if (type === 'warning') {
        backgroundColor = '#ffab40';
    }
    
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor,
        stopOnFocus: true
    }).showToast();
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', init);
