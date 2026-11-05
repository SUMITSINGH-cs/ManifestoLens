
import { promises } from "./promises.js";
import { manifestos } from "./manifestos.js";

export function validatePromises() {
  const errors = [];
  const promiseIds = new Set();
  const manifestoIds = new Set(manifestos.map(item => item.id));

  promises.forEach((promise, index) => {
    const label = `Promise ${index + 1}`;

    if (!promise.id) {
      errors.push(`${label}: Missing ID`);
    } else if (promiseIds.has(promise.id)) {
      errors.push(`${label}: Duplicate ID — ${promise.id}`);
    } else {
      promiseIds.add(promise.id);
    }

    if (!manifestoIds.has(promise.manifestoId)) {
      errors.push(`${label}: Invalid manifesto ID`);
    }

    if (!promise.title) {
      errors.push(`${label}: Missing title`);
    }

    if (!promise.category) {
      errors.push(`${label}: Missing category`);
    }

    if (!promise.originalText) {
      errors.push(`${label}: Missing source text`);
    }

    if (!Number.isInteger(promise.sourcePage) || promise.sourcePage < 1) {
      errors.push(`${label}: Invalid source page`);
    }
  });

  return {
    valid: errors.length === 0,
    totalPromises: promises.length,
    errors
  };
}
