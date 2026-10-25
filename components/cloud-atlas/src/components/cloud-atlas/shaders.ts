export const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = 0.5 + aPosition * 0.5;
  gl_Position = vec4(aPosition, 0., 1.);
}`;

export const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform vec2 uSize;
uniform float uTime, uHeight, uCoverage, uDensity, uScale, uTowers;
uniform float uOpacity, uWind, uBillow, uRise, uSeed, uAnchor, uRadius;
uniform vec3 uLight, uShade;
uniform vec4 uTrail[6];

float hash(vec3 p) {
  p = fract(p * vec3(.1031, .1030, .0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x+p.y)*p.z);
}
float noise(vec3 p) {
  vec3 i=floor(p), f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(
    mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p) {
  float sum=0., amplitude=.52;
  for(int i=0;i<6;i++) {
    sum+=noise(p)*amplitude;
    p=mat3(.8,.6,0., -.6,.8,0., 0.,0.,1.)*p*2.07+vec3(4.3,7.1,2.8);
    amplitude*=.48;
  }
  return sum;
}
vec4 cloudAt(vec2 uv) {
  float aspect=uSize.x/uSize.y;
  vec2 position=vec2((uv.x-.5)*aspect,uv.y);
  float t=uTime*.085;
  vec3 p=vec3(position*3.1/max(.2,uScale),uSeed*5.31+t*.27*uBillow);
  p.x+=uTime*uWind*.09;
  p.y*=mix(1.,.66,clamp(uRise,0.,1.));
  p.y-=uTime*(.0102+uRise*.38)*uBillow;
  p.x+=sin(position.y*5.8-uTime*.9*uBillow+uSeed)*position.y*.24*uRise;
  vec2 warp=vec2(fbm(p*.85+vec3(1.7,9.2,3.1)),fbm(p*.85+vec3(8.3,2.1,5.4)));
  float broad=fbm(vec3(p.x*.58,0.8,p.z*.45+uTime*.16*uRise*uBillow));
  vec3 curled=p*1.65+vec3((warp-.5)*.95,0.);
  float billows=fbm(curled);
  float detail=fbm(curled*2.1+vec3(7.3,4.8,2.));
  float roof=.11+uHeight*(.25+.23*uRise)
    +(broad-.45)*(.65+.85*uRise)*uTowers+(billows-.48)*.68;
  roof=min(roof,max(.05,uHeight*.95));
  float envelope=1.-smoothstep(roof-.14,roof+.12,uv.y);
  float pockets=billows*.78+detail*.22;
  float threshold=.60-uCoverage*.22;
  float substance=smoothstep(threshold-.10,threshold+.15,pockets+(roof-uv.y)*.25);
  float cloud=envelope*substance;
  cloud*=1.-smoothstep(max(.05,uHeight*.65),max(.1,uHeight*1.1),uv.y)*clamp(uRise,0.,1.);
  float wisps=(1.-smoothstep(roof-.03,roof+.22,uv.y))*smoothstep(.50,.68,detail)*.12;
  float extinction=(cloud+wisps)*(.65+uDensity*1.45);
  float alpha=(1.-exp(-extinction*2.9))*uOpacity;
  float shade=smoothstep(.34,.66,pockets);
  vec3 color=mix(uShade,uLight,.28+.72*shade);
  color*=1.02+.12*detail;
  return vec4(color*alpha,alpha);
}
void main() {
  vec2 uv=vUv;
  if(uAnchor>.5) uv.y=1.-uv.y;
  gl_FragColor=cloudAt(uv);
}`;
export const FLOW_FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrevious;
uniform vec2 uSize;
uniform float uDelta, uInjectDelta, uRadius, uCarry;
uniform vec4 uTrail[6];
vec2 decode(vec4 v) { return (v.rg*65280.+v.ba*255.-32768.)/32767.*uCarry; }
void main() {
  float aspect=uSize.x/uSize.y;
  vec2 velocity=decode(texture2D(uPrevious,vUv));
  vec2 departure=vUv-vec2(velocity.x/aspect,velocity.y)*uDelta*.13;
  vec2 texel=vec2(1./256.,1./128.);
  vec2 center=decode(texture2D(uPrevious,departure));
  vec2 neighbours=(decode(texture2D(uPrevious,departure+vec2(texel.x,0.)))
    +decode(texture2D(uPrevious,departure-vec2(texel.x,0.)))
    +decode(texture2D(uPrevious,departure+vec2(0.,texel.y)))
    +decode(texture2D(uPrevious,departure-vec2(0.,texel.y))))*.25;
  velocity=mix(center,neighbours,min(.48,uDelta*20.))*exp(-uDelta*.8);
  velocity=sign(velocity)*max(abs(velocity)-vec2(uDelta*.008),vec2(0.));
  for(int i=0;i<6;i++) {
    vec2 distance=(vUv-uTrail[i].xy)*vec2(aspect,1.);
    float brush=exp(-dot(distance,distance)/max(.0001,uRadius*uRadius*.8));
    velocity+=uTrail[i].zw*vec2(aspect,1.)*brush*uInjectDelta*55.;
  }
  velocity=clamp(velocity,vec2(-.98),vec2(.98));
  vec2 encoded=floor(velocity*32767.+32768.+.5);
  gl_FragColor=vec4(floor(encoded/256.),mod(encoded,256.))/255.;
}`;
export const BLUR_FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uCloud, uFlow;
uniform vec2 uSize;
uniform float uEnabled;
void main() {
  float aspect=uSize.x/uSize.y;
  vec4 encodedFlow=texture2D(uFlow,vUv);
  vec2 flow=(encodedFlow.rg*65280.+encodedFlow.ba*255.-32768.)/32767.*uEnabled;
  vec2 displacement=vec2(flow.x/aspect,flow.y)*.48;
  vec2 source=vUv-displacement;
  vec2 smear=displacement*.075;
  vec4 color=texture2D(uCloud,source)*.4;
  color+=texture2D(uCloud,source+smear)*.24;
  color+=texture2D(uCloud,source-smear)*.24;
  color+=texture2D(uCloud,source+smear*2.)*.06;
  color+=texture2D(uCloud,source-smear*2.)*.06;
  gl_FragColor=vec4(color.rgb/max(color.a,.00001),color.a);
}`;
