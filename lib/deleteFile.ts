const deleteFile = async (path: { [key: string]: boolean}) => {  // Ensure the function is async
        
    try {
       const url = Object.keys(path)[0];
        if (!url) {  // Check for path before creating the URL object
            alert('Please enter a file path');
            return;
        }
        // Use template literals for dynamic values
        const apiUrl = process.env.NEXT_DEVELOP_API_URL || " ";

        const response = await fetch(`${apiUrl}/api/delete?url=${url}`, {
            method: 'DELETE',
            body: JSON.stringify({ url }),
        });
        console.log(response);

        if (response.ok) {
            alert('File deleted successfully');
        } else {
            const error = await response.json();
            console.log(error);
        }
    } catch (error) {  // Remove semicolon from before catch
        console.log(error);
    }
}

export default deleteFile;
