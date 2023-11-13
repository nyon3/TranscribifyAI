// create a new client component with the command: onClick={() => alert('test')}    
'use client'

import { deleteFile } from '@/lib/delete'
import { dataProps } from '@/lib/db'

type Props = {
  data: dataProps
}

export const DeleteTest = ({ data }: Props) => {
  const handleDelete = async () => {
    const formData = new FormData();
    formData.append('url', data.url);
    if (!formData) alert('No file to delete');

    try {
      // assuming deleteFile is a fetch call to your API endpoint
      await deleteFile(formData as any);
      alert('File deleted successfully');
    } catch (error) {
      alert('Error deleting file');
    }
  };

  return (
    <button onClick={handleDelete}>
      Delete test
    </button>
  );
};
