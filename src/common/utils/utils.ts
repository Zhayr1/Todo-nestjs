export const uniqueConstrainValidatorMessage = (e: any) => {
  const dbError: string = e.detail;
  if (dbError && dbError.includes('already exists')) {
    const message = dbError
      .replace('Key ', '')
      .replace(')=(', ' ')
      .replace('(', '')
      .replace(')', '');
    return message;
  } else {
    return 'Something went wrong';
  }
};
