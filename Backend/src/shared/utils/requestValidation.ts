import { Static, TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import mongoose from 'mongoose';

type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      message: string;
    };

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const hasForbiddenMongoKeys = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(hasForbiddenMongoKeys);
  }

  if (!isPlainObject(value)) {
    return false;
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    if (key.startsWith('$') || key.includes('.')) {
      return true;
    }

    return hasForbiddenMongoKeys(nestedValue);
  });
};

export const validateRequestBody = <T extends TSchema>(
  schema: T,
  payload: unknown
): ValidationResult<Static<T>> => {
  if (!isPlainObject(payload)) {
    return { success: false, message: 'Invalid request body' };
  }

  if (hasForbiddenMongoKeys(payload)) {
    return { success: false, message: 'Invalid request body' };
  }

  if (!Value.Check(schema, payload)) {
    return { success: false, message: 'Invalid request body' };
  }

  return {
    success: true,
    data: Value.Parse(schema, payload),
  };
};

export const isValidObjectId = (value: string): boolean => {
  return mongoose.Types.ObjectId.isValid(value);
};
