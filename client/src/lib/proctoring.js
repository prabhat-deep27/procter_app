// Enhanced proctoring with advanced TensorFlow.js features
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import * as handpose from '@tensorflow-models/handpose';
import * as posenet from '@tensorflow-models/posenet';

const DEFAULT_INTERVAL_MS = 3000;
const FACE_DETECTION_THRESHOLD = 0.7;
const EYE_CLOSURE_THRESHOLD = 0.3;
const HEAD_TURN_THRESHOLD = 0.5;

export class ProctoringSession {
  constructor({ testId, stompClient, onEvent }) {
    this.testId = testId;
    this.client = stompClient;
    this.onEvent = onEvent;
    this.mediaStreams = { camera: null, mic: null, screen: null };
    this.videoEl = document.createElement('video');
    this.videoEl.playsInline = true;
    this.videoEl.muted = true;
    this.models = {
      face: null,
      hand: null,
      pose: null
    };
    this.timer = null;
    this.proctoringData = {
      facesDetected: 0,
      eyeClosure: 0,
      headTurn: 0,
      handsDetected: 0,
      suspiciousActivity: []
    };
  }

  // Best-effort single-display check. Uses Window Management API when available.
  // Returns true if a single display is detected, false if multiple are detected.
  // Throws an error if a definitive check cannot be performed.
  static async verifySingleDisplayOrThrow() {
    try {
      if (typeof window !== 'undefined' && typeof window.getScreenDetails === 'function') {
        const details = await window.getScreenDetails();
        const numScreens = (details?.screens?.length) || 1;
        if (numScreens > 1) {
          return false;
        }
        return true;
      }
    } catch (err) {
      // Fall through to throw below if API errors unexpectedly
    }
    // If the API is not available, we cannot reliably verify single-display.
    // Signal the caller to block start and inform the user to disconnect extra displays.
    throw new Error('Single-display verification is not supported by this browser');
  }

  async start() {
    await this.loadModels();
    await this.startCameraAndMic();
    // screen is optional; may require user gesture; call startScreen() from UI
    this.timer = setInterval(() => this.sampleAndEmit(), DEFAULT_INTERVAL_MS);
  }

  async loadModels() {
    try {
      // Load face detection model
      if (!this.models.face) {
        this.models.face = await blazeface.load();
      }
      
      // Load hand detection model (with error handling for compatibility)
      if (!this.models.hand) {
        try {
          this.models.hand = await handpose.load();
        } catch (handError) {
          console.warn('HandPose model failed to load:', handError);
          this.models.hand = null;
        }
      }
      
      // Load pose detection model (with error handling for compatibility)
      if (!this.models.pose) {
        try {
          this.models.pose = await posenet.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75
          });
        } catch (poseError) {
          console.warn('PoseNet model failed to load:', poseError);
          this.models.pose = null;
        }
      }
    } catch (error) {
      console.error('Error loading TensorFlow models:', error);
      // Don't throw error, continue with basic face detection only
      console.warn('Continuing with basic proctoring (face detection only)');
    }
  }

  async startCameraAndMic() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.mediaStreams.camera = stream;
    this.mediaStreams.mic = stream;
    this.videoEl.srcObject = stream;
    await this.videoEl.play();
  }

  async startScreen() {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    this.mediaStreams.screen = screen;
    return screen;
  }

  async sampleAndEmit() {
    if (!this.mediaStreams.camera) return;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.videoEl.videoWidth || 640;
      canvas.height = this.videoEl.videoHeight || 480;
      ctx.drawImage(this.videoEl, 0, 0);
      
      // Run all AI analyses in parallel
      const [faceAnalysis, handAnalysis, poseAnalysis] = await Promise.all([
        this.analyzeFaces(canvas),
        this.analyzeHands(canvas),
        this.analyzePose(canvas)
      ]);
      
      // Update proctoring data
      this.proctoringData = {
        ...this.proctoringData,
        ...faceAnalysis,
        ...handAnalysis,
        ...poseAnalysis
      };
      
      // Check for suspicious activities
      this.checkSuspiciousActivity();
      
      // Emit comprehensive data
      this.emit({ 
        type: 'COMPREHENSIVE_ANALYSIS',
        ...this.proctoringData,
        timestamp: Date.now()
      });
      
      this.emit({ type: 'FOCUS', visibilityState: document.visibilityState });
    } catch (error) {
      console.error('Error in proctoring analysis:', error);
      this.emit({ type: 'ERROR', message: error?.message || 'Analysis failed' });
    }
  }

  async analyzeFaces(canvas) {
    try {
      if (!this.models.face) return { facesDetected: 0, eyeClosure: 0, headTurn: 0 };
      
      const predictions = await this.models.face.estimateFaces(canvas);
      const facesDetected = predictions.length;
      
      let eyeClosure = 0;
      let headTurn = 0;
      
      if (facesDetected > 0) {
        const face = predictions[0];
        // Analyze eye closure (simplified)
        if (face.landmarks) {
          const leftEye = face.landmarks.slice(0, 6);
          const rightEye = face.landmarks.slice(6, 12);
          eyeClosure = this.calculateEyeClosure(leftEye, rightEye);
        }
        
        // Analyze head turn (simplified)
        if (face.topLeft && face.bottomRight) {
          const faceWidth = face.bottomRight[0] - face.topLeft[0];
          const faceCenter = face.topLeft[0] + faceWidth / 2;
          const imageCenter = canvas.width / 2;
          headTurn = Math.abs(faceCenter - imageCenter) / (canvas.width / 2);
        }
      }
      
      return { facesDetected, eyeClosure, headTurn };
    } catch (error) {
      console.error('Error analyzing faces:', error);
      return { facesDetected: 0, eyeClosure: 0, headTurn: 0 };
    }
  }

  async analyzeHands(canvas) {
    try {
      if (!this.models.hand) return { handsDetected: 0 };
      
      const predictions = await this.models.hand.estimateHands(canvas);
      const handsDetected = predictions.length;
      
      return { handsDetected };
    } catch (error) {
      console.warn('Hand analysis failed:', error);
      return { handsDetected: 0 };
    }
  }

  async analyzePose(canvas) {
    try {
      if (!this.models.pose) return { poseDetected: false, poseScore: 0 };
      
      const pose = await this.models.pose.estimateSinglePose(canvas);
      const poseDetected = pose.score > 0.3;
      
      return { poseDetected, poseScore: pose.score };
    } catch (error) {
      console.warn('Pose analysis failed:', error);
      return { poseDetected: false, poseScore: 0 };
    }
  }

  calculateEyeClosure(leftEye, rightEye) {
    // Simplified eye closure calculation
    // In a real implementation, you'd use more sophisticated algorithms
    const leftEyeHeight = Math.abs(leftEye[1] - leftEye[4]);
    const rightEyeHeight = Math.abs(rightEye[1] - rightEye[4]);
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
    
    // Normalize based on typical eye dimensions
    return Math.max(0, Math.min(1, 1 - (avgEyeHeight / 20)));
  }

  checkSuspiciousActivity() {
    const activities = [];
    
    // Check for multiple faces (potential cheating)
    if (this.proctoringData.facesDetected > 1) {
      activities.push('Multiple faces detected');
    }
    
    // Check for no face (student left)
    if (this.proctoringData.facesDetected === 0) {
      activities.push('No face detected - student may have left');
    }
    
    // Check for excessive eye closure (sleeping/distracted)
    if (this.proctoringData.eyeClosure > EYE_CLOSURE_THRESHOLD) {
      activities.push('Excessive eye closure detected');
    }
    
    // Check for head turning (looking away)
    if (this.proctoringData.headTurn > HEAD_TURN_THRESHOLD) {
      activities.push('Head turning detected - looking away from screen');
    }
    
    // Check for hand detection (potential phone/notes)
    if (this.proctoringData.handsDetected > 0) {
      activities.push('Hands detected near face - potential phone usage');
    }
    
    this.proctoringData.suspiciousActivity = activities;
  }

  emit(payload) {
    if (this.onEvent) this.onEvent(payload);
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: `/app/test/${this.testId}/activity`,
        body: JSON.stringify(payload)
      });
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    Object.values(this.mediaStreams).forEach(stream => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    });
  }
}


