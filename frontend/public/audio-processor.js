/**
 * AudioWorklet processor that converts browser mic audio to 16-bit PCM.
 *
 * The browser captures audio as Float32 samples (values between -1.0 and 1.0).
 * Gemini expects 16-bit signed integers (values between -32768 and 32767).
 * This processor does that conversion and sends the result to the main thread,
 * which then forwards it to the backend over WebSocket as binary data.
 *
 * Loaded via: audioContext.audioWorklet.addModule('/audio-processor.js')
 */
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];     // first input source (the mic)
    const channel = input[0];    // first channel (mono)

    if (channel && channel.length > 0) {
      // Convert Float32 [-1.0, 1.0] → Int16 [-32768, 32767]
      const int16 = new Int16Array(channel.length);
      for (let i = 0; i < channel.length; i++) {
        const sample = Math.max(-1, Math.min(1, channel[i]));
        int16[i] = sample < 0 ? sample * 32768 : sample * 32767;
      }

      // Send the PCM buffer to the main thread
      this.port.postMessage(int16.buffer, [int16.buffer]);
    }

    // Return true to keep the processor alive
    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
