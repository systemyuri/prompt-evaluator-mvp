import type { BuilderRequest, FreeRequest, ValidationResponse } from '../types/validation';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function validateBuilder(req: BuilderRequest): Promise<ValidationResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/builder/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Builder validation failed: ${res.status}`);
  return res.json();
}

export async function validateFree(req: FreeRequest): Promise<ValidationResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/validator/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Free validation failed: ${res.status}`);
  return res.json();
}