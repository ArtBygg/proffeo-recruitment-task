export const readAsDataURL = (file: File, removeDataInormation = false): Promise<string | ArrayBuffer | null> =>
  // Return a new promise
  new Promise((resolve, reject) => {
    // Create a new reader
    const reader = new FileReader();
    // Resolve the promise on success
    reader.onload = (): void => {
      if (removeDataInormation) {
        resolve((reader.result as string).split(',')[1]);
      } else {
        resolve(reader.result);
      }
    };
    // Reject the promise on error
    reader.onerror = (e): void => {
      reject(e);
    };
    // Read the file as the
    reader.readAsDataURL(file);
  });
