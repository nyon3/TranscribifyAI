'use client'
 
import { useState } from 'react'
 

export default function ClientList({ children, fileName}: {fileName: number, children: React.ReactNode }) {
    const [showChildren, setShowChildren] = useState(true)
  
    const handleClick = () => {
      setShowChildren((prevState) => !prevState)
    }
  
    return (
        <div className='mb-5'>
        <button
          onClick={handleClick}
          className={`px-4 py-2 rounded shadow-md text-white ${showChildren ? 'bg-blue-600' : 'bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 relative`}
        >
         {`View Transcription : Transcribe File # ${fileName}`}      
        </button>
        <ul>
          {showChildren && children}
        </ul>
      </div>
    )
  }