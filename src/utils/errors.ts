export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const record = error as {
      message?: string;
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return record.response?.data?.message ?? record.message ?? fallback;
  }

  return fallback;
};
