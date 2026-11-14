import mongoose from 'mongoose';

// Registers a Mongoose model once.
// In development, `next dev` re-runs a model file after every edit but keeps the old model in
// memory, so a changed schema (e.g. a new field) would be ignored until a restart. Replacing the
// old model makes schema changes apply straight away. In production a model file runs only once.
export function defineModel(name, schema) {
  if (mongoose.models[name] && process.env.NODE_ENV !== 'production') mongoose.deleteModel(name);
  return mongoose.models[name] || mongoose.model(name, schema);
}
