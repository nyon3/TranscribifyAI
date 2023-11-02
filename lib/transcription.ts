export const transcribeAudio = async (audioURL: string) => {
    const apiUrl = process.env.NEXT_DEVELOP_API_URL || " ";
    const formData = new FormData();
    formData.append('audioUrl', audioURL);

    const response = await fetch(`${apiUrl}/api/transcribe`, 
    { method: 'POST', body: formData });

    const data = await response.json();
    console.log(data);
    return data.transcription;
}
