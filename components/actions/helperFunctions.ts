

export const downloadTextFile = (text: string, filename: string): void => {
    const blob = new Blob([text], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(anchor.href);
};

/**
 * Copies the provided text to the clipboard.
 * @param {string} text - The text to be copied to the clipboard.
 * @param {Function} onSuccess - Function to call on successful copying.
 * @param {Function} onError - Function to call on error.
 */
export const copyToClipboard = (
    text: string,
    onSuccess: () => void,
    onError: (err: Error) => void
) => {
    navigator.clipboard.writeText(text)
        .then(() => {
            onSuccess();
        })
        .catch(err => {
            onError(err);
        });
};