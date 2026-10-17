// Streaming box-filter resampling keeps sample boundaries across worklet blocks.
// AudioContext may run at 44.1/48 kHz; Gemini receives mono 16 kHz PCM16 LE.
export class PcmEncoder {
  constructor(inputRate, outputRate=16000, chunkSize=320) {
    this.ratio=inputRate/outputRate;
    this.chunkSize=chunkSize;
    this.samples=new Int16Array(chunkSize);
    this.index=0;this.sum=0;this.weight=0;this.energy=0;
  }
  push(input,emit) {
    for(const sample of input) {
      let remaining=1;
      while(remaining>1e-7) {
        const taken=Math.min(remaining,this.ratio-this.weight);
        this.sum+=sample*taken;this.weight+=taken;remaining-=taken;
        if(this.weight>=this.ratio-1e-7) {
          const value=Math.max(-1,Math.min(1,this.sum/this.ratio));
          this.samples[this.index++]=Math.round(value*(value<0?32768:32767));
          this.energy+=value*value;this.sum=0;this.weight=0;
          if(this.index===this.chunkSize) {
            const bytes=new ArrayBuffer(this.chunkSize*2),view=new DataView(bytes);
            for(let i=0;i<this.chunkSize;i++) view.setInt16(i*2,this.samples[i],true);
            emit(bytes,Math.sqrt(this.energy/this.chunkSize));
            this.index=0;this.energy=0;
          }
        }
      }
    }
  }
}
