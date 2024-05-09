const SHR3 = 1;
const LCG = 2;
 
 //https://github.com/processing/p5.js/blob/1.1.9/src/math/noise.js
 var PERLIN_YWRAPB = 4; var PERLIN_YWRAP = 1<<PERLIN_YWRAPB;
 var PERLIN_ZWRAPB = 8; var PERLIN_ZWRAP = 1<<PERLIN_ZWRAPB;
 var PERLIN_SIZE = 4095;
 var perlin_octaves = 4;var perlin_amp_falloff = 0.5;
 var scaled_cosine = function(i) {return 0.5*(1.0-Math.cos(i*Math.PI));};
 var p_perlin;

function noise(x, y, z) {
   y = y || 0; z = z || 0;
   if (p_perlin == null) {
     p_perlin = new Array(PERLIN_SIZE + 1);
     for (var i = 0; i < PERLIN_SIZE + 1; i++) {
       p_perlin[i] = Math.random();
     }
   }
   if (x<0) { x=-x; } if (y<0) { y=-y; } if (z<0) { z=-z; }
   var xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
   var xf = x - xi; var yf = y - yi; var zf = z - zi;
   var rxf, ryf;
   var r=0; var ampl=0.5;
   var n1,n2,n3;
   for (var o=0; o<perlin_octaves; o++) {
     var of=xi+(yi<<PERLIN_YWRAPB)+(zi<<PERLIN_ZWRAPB);
     rxf = scaled_cosine(xf); ryf = scaled_cosine(yf);
     n1  = p_perlin[of&PERLIN_SIZE];
     n1 += rxf*(p_perlin[(of+1)&PERLIN_SIZE]-n1);
     n2  = p_perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
     n2 += rxf*(p_perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n2);
     n1 += ryf*(n2-n1);
     of += PERLIN_ZWRAP;
     n2  = p_perlin[of&PERLIN_SIZE];
     n2 += rxf*(p_perlin[(of+1)&PERLIN_SIZE]-n2);
     n3  = p_perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
     n3 += rxf*(p_perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n3);
     n2 += ryf*(n3-n2);
     n1 += scaled_cosine(zf)*(n2-n1);
     r += n1*ampl;
     ampl *= perlin_amp_falloff;
     xi<<=1; xf*=2; yi<<=1; yf*=2; zi<<=1; zf*=2;
     if (xf>=1.0) { xi++; xf--; }
     if (yf>=1.0) { yi++; yf--; }
     if (zf>=1.0) { zi++; zf--; }
   }
   return r;
 };

function noiseDetail(lod, falloff) {
   if (lod>0)     { perlin_octaves=lod; }
   if (falloff>0) { perlin_amp_falloff=falloff; }
 };
 const Lcg = function(){
   const m = 4294967296;
   const a = 1664525;
   const c = 1013904223;
   let seed, z;
   return {
     setSeed(val) {
       z = seed = (val == null ? Math.random() * m : val) >>> 0;
     },
     getSeed() {
       return seed;
     },
     rand() {
       z = (a * z + c) % m;
       return z / m;
     }
   };
 };
 const Shr3 = function(){
   let jsr, seed;
   let m = 4294967295;
   return {
     setSeed(val){
       jsr = seed = (val == null ? Math.random() * m : val) >>> 0;
     },
     getSeed() {
       return seed;
     },
     rand() {
       jsr^=(jsr<<17);
       jsr^=(jsr>>13);
       jsr^=(jsr<<5);
       return (jsr>>>0)/m;
     }
   }
 }
 let rng1 = Shr3();
 rng1.setSeed();

function noiseSeed(seed) {
   let jsr = (seed == undefined) ? (Math.random()*4294967295) : seed;
   if (!p_perlin){
     p_perlin = new Float32Array(PERLIN_SIZE + 1);
   }
   for (var i = 0; i < PERLIN_SIZE + 1; i++) {
     jsr^=(jsr<<17);
     jsr^=(jsr>>13);
     jsr^=(jsr<<5);
     p_perlin[i] = (jsr>>>0)/4294967295;
   }
 };

 function randomSeed(seed){
   rng1.setSeed(seed);
 }
 
 function random(a, b) {
   if (a == undefined){
     return rng1.rand();
   }
   if (typeof a == 'number'){
     if (b != undefined){
       return rng1.rand()*(b-a)+a;
     }else{
       return rng1.rand()*a;
     }
   }else{
     return a[~~(a.length*rng1.rand())];
   }
 }

function randomGenerator(method) {
   if (method == LCG){
     rng1 = Lcg();
   }else if (method == SHR3){
     rng1 = Shr3();
   }
   rng1.setSeed();
 }

function ziggurat() {
   //http://ziggurat.glitch.me/
   var iz;
   var jz;
   var kn = new Array(128);
   var ke = new Array(256);
   var hz;
   var wn = new Array(128);
   var fn = new Array(128);
   var we = new Array(256);
   var fe = new Array(256);
   var SHR3 = function() {
     return rng1.rand()*4294967296-2147483648;
   };
   var UNI = function() {
     return 0.5 + (SHR3()<<0) * 0.2328306e-9;
   };

   var RNOR = function() {
     hz = SHR3();
     iz = hz & 127;
     return Math.abs(hz) < kn[iz] ? hz * wn[iz] : nfix();
   };
   var REXP = function() {
     jz = SHR3()>>>0;
     iz = jz & 255;
     return jz < kn[iz] ? jz * we[iz] : efix();
   };
   var nfix = function() {
     var r = 3.44262;
     var x, y;
     var u1, u2;
     for (;;) {
       x = hz * wn[iz];
       if (iz == 0) {
         do {
           u1 = UNI();
           u2 = UNI();
           x = -Math.log(u1) * 0.2904764;
           y = -Math.log(u2);
         } while (y + y < x * x);
         return (hz > 0) ? (r + x) : (- r - x);
       }

       if (fn[iz] + UNI() * (fn[iz - 1] - fn[iz]) < Math.exp(-0.5 * x * x)) {
         return x;
       }
       hz = SHR3();
       iz = hz & 127;
       if (Math.abs(hz) < kn[iz]) {
         return hz * wn[iz];
       }
     }

   };
   var efix = function() {
     var x;
     for (;;) {
       if (iz == 0) {
         return 7.69711 - Math.log(UNI());
       }
       x = jz * we[iz];
       if (fe[iz] + UNI() * (fe[iz - 1] - fe[iz]) < Math.exp(-x)) {
         return x;
       }
       jz = SHR3();
       iz = jz & 255;
       if (jz < ke[iz]) {
         return jz * we[iz];
       }
     }
   };

   var zigset = function() {
     var m1 = 2147483648;
     var m2 = 4294967296;
     var dn = 3.442619855899;
     var tn = dn;
     var vn = 9.91256303526217e-3;
     var q;
     var de = 7.697117470131487;
     var te = de;
     var ve = 3.949659822581572e-3;
     var i;

     /* Tables for RNOR */
     q = vn / Math.exp(-0.5 * dn * dn);
     kn[0] = Math.floor((dn / q) * m1);
     kn[1] = 0;
     wn[0] = q / m1;
     wn[127] = dn / m1;
     fn[0] = 1;
     fn[127] = Math.exp(-0.5 * dn * dn);
     for (i = 126; i >= 1; i--) {
       dn = Math.sqrt(-2 * Math.log(vn / dn + Math.exp(-0.5 * dn * dn)));
       kn[i + 1] = Math.floor((dn / tn) * m1);
       tn = dn;
       fn[i] = Math.exp(-0.5 * dn * dn);
       wn[i] = dn / m1;
     }
     /*Tables for REXP */
     q = ve / Math.exp(-de);
     ke[0] = Math.floor((de / q) * m2);
     ke[1] = 0;
     we[0] = q / m2;
     we[255] = de / m2;
     fe[0] = 1;
     fe[255] = Math.exp(-de);
     for (i = 254; i >= 1; i--) {
       de = -Math.log(ve / de + Math.exp(-de));
       ke[i + 1] = Math.floor((de / te) * m2);
       te = de;
       fe[i] = Math.exp(-de);
       we[i] = de / m2;
     }
   };
   this.SHR3 = SHR3;
   this.UNI = UNI;
   this.RNOR = RNOR;
   this.REXP = REXP;
   this.zigset = zigset;
 }
 ziggurat.hasInit = false;

 function randomGaussian(mean, std) {
   if (!ziggurat.hasInit){
     ziggurat.zigset();
     ziggurat.hasInit = true;
   }
   return ziggurat.RNOR()*std+mean;
 }

function randomExponential() {
   if (!ziggurat.hasInit){
     ziggurat.zigset();
     ziggurat.hasInit = true;
   }
   return ziggurat.REXP();
 }


export { noise, noiseDetail, noiseSeed, random, randomSeed, randomGaussian, randomExponential, randomGenerator }