export function encodePcm(bytes) {
  const data=new Uint8Array(bytes);
  let binary='';
  for(let i=0;i<data.length;i++) binary+=String.fromCharCode(data[i]);
  return btoa(binary);
}

export function decodePcm(base64) {
  const binary=atob(base64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  const view=new DataView(bytes.buffer);
  const samples=new Float32Array(Math.floor(bytes.length/2));
  for(let i=0;i<samples.length;i++) samples[i]=view.getInt16(i*2,true)/32768;
  return samples;
}

export function audioRate(mimeType='') {
  const match=/rate=(\d+)/.exec(mimeType);
  const rate=match?Number(match[1]):24000;
  if(rate<8000||rate>96000) throw new Error('Unsupported audio sample rate.');
  return rate;
}
