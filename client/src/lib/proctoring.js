// Capture camera, mic, and screen; run light TF.js checks; emit via STOMP
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const DEFAULT_INTERVAL_MS = 3000;

export class ProctoringSession {
  constructor({ testId, stompClient, onEvent }) {
    this.testId = testId;
    this.client = stompClient;
    this.onEvent = onEvent;
    this.mediaStreams = { camera: null, mic: null, screen: null };
    this.videoEl = document.createElement('video');
    this.videoEl.playsInline = true;
    this.videoEl.muted = true;
    this.model = null;
    this.timer = null;
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
    await this.loadModel();
    await this.startCameraAndMic();
    // screen is optional; may require user gesture; call startScreen() from UI
    this.timer = setInterval(() => this.sampleAndEmit(), DEFAULT_INTERVAL_MS);
  }

  async loadModel() {
    if (!this.model) {
      this.model = await blazeface.load();
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
    try {
      const frameTensor = tf.tidy(() => tf.browser.fromPixels(this.videoEl));
      const predictions = await this.model.estimateFaces(frameTensor, false);
      frameTensor.dispose();

      const facesDetected = predictions.length;
      const multipleFaces = facesDetected > 1;

      this.emit({ type: 'VISION_SAMPLE', facesDetected, multipleFaces });
      this.emit({ type: 'FOCUS', visibilityState: document.visibilityState });
    } catch (e) {
      this.emit({ type: 'ERROR', message: e?.message || 'sample failed' });
    }
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


