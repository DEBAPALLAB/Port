import { PcmEncoder } from './pcm.js';

class PortfolioPcmCapture extends AudioWorkletProcessor {
  constructor() {super();this.encoder=new PcmEncoder(sampleRate);}
  process(inputs,outputs) {
    // The capture graph is silent; the microphone never feeds the speakers.
    for(const channel of outputs[0]||[]) channel.fill(0);
    const mono=inputs[0]?.[0];
    if(mono) this.encoder.push(mono,(pcm,level)=>this.port.postMessage({pcm,level},[pcm]));
    return true;
  }
}
registerProcessor('portfolio-pcm-capture',PortfolioPcmCapture);
