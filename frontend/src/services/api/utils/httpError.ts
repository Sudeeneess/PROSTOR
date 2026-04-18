export function createHttpError(status: number, message: string): Error & { status: number } {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error !== null && typeof error === 'object' && 'status' in error) {
    const s = (error as { status: unknown }).status;
    return typeof s === 'number' ? s : undefined;
  }
  return undefined;
}
