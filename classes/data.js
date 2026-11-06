export const PAL = {
  skyTop: 0x5FA6DE,
  skyHaze: 0xCFE2EF,
  sun: 0xFFF6E2,
  ground: 0xB4AC9B,
  groundDim: 0x9C947F,
  road: 0x4A4742,
  curb: 0xB0A897,
  facadeA: 0x7B7060,
  facadeB: 0x655C4F,
  facadeC: 0x877860,
  rust: 0x8C5A3C,
  signBlue: 0x3E6B84,
  signRed: 0xA5432F,
  signYellow: 0xC9A227,
  metal: 0x6E6A63,
  darkMetal: 0x3A3733,
  wood: 0x6B5641,
  glassTint: 0x8FB6CE
};

export const FLOCK_PERCH_KINDS = new Set(['ledge', 'awning', 'ac', 'sign', 'banner', 'lamp', 'bench', 'stall', 'tree', 'bin', 'wire']);

export const FOLD_UP = [
  [0.018,  0.062,  0.078],
  [0.036,  0.060,  0.020],
  [0.044,  0.050, -0.052],
  [0.040,  0.030, -0.124],
  [0.028,  0.012, -0.190]
];
export const FOLD_LO = [
  [0.030, -0.010,  0.060],
  [0.056, -0.026,  0.008],
  [0.062, -0.038, -0.058],
  [0.053, -0.040, -0.122],
  [0.035, -0.030, -0.180]
];