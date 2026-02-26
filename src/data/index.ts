// Import existing files with error handling
let mathQuestions = [];
let scienceQuestions = [];
let historyQuestions = [];
let geographyQuestions = [];
let physicsQuestions = [];
let chemistryQuestions = [];
let biologyQuestions = [];

// Try to import from existing files
try {
  const mathModule = await import('./math');
  mathQuestions = mathModule.mathQuestions || [];
} catch (e) {
  console.warn('math.ts not found, using empty array');
}



try {
  const scienceModule = await import('./science');
  scienceQuestions = scienceModule.scienceQuestions || [];
} catch (e) {
  console.warn('science.ts not found, using empty array');
}

try {
  const historyModule = await import('./history');
  historyQuestions = historyModule.historyQuestions || [];
} catch (e) {
  console.warn('history.ts not found, using empty array');
}

try {
  const geographyModule = await import('./geography');
  geographyQuestions = geographyModule.geographyQuestions || [];
} catch (e) {
  console.warn('geography.ts not found, using empty array');
}

try {
  const physicsModule = await import('./physics');
  physicsQuestions = physicsModule.physicsQuestions || [];
} catch (e) {
  console.warn('physics.ts not found, using empty array');
}

try {
  const chemistryModule = await import('./chemistry');
  chemistryQuestions = chemistryModule.chemistryQuestions || [];
} catch (e) {
  console.warn('chemistry.ts not found, using empty array');
}

try {
  const biologyModule = await import('./biology');
  biologyQuestions = biologyModule.biologyQuestions || [];
} catch (e) {
  console.warn('biology.ts not found, using empty array');
}

// Export all question arrays
export { 
  mathQuestions,
  scienceQuestions,
  historyQuestions,
  geographyQuestions,
  physicsQuestions,
  chemistryQuestions,
  biologyQuestions
};

// Create combined array with unique IDs
let currentId = 1;
export const ALL_QUESTIONS = [
  ...mathQuestions.map(q => ({ ...q, id: currentId++ })),
  ...arabicQuestions.map(q => ({ ...q, id: currentId++ })),
  ...scienceQuestions.map(q => ({ ...q, id: currentId++ })),
  ...historyQuestions.map(q => ({ ...q, id: currentId++ })),
  ...geographyQuestions.map(q => ({ ...q, id: currentId++ })),
  ...physicsQuestions.map(q => ({ ...q, id: currentId++ })),
  ...chemistryQuestions.map(q => ({ ...q, id: currentId++ })),
  ...biologyQuestions.map(q => ({ ...q, id: currentId++ }))
];