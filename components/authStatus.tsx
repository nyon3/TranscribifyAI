'use client';
import { useSession } from 'next-auth/react';

interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;  // Added id here
}

function AuthStatus() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return null;  // Return null or a loading spinner while the session is loading
  }

  const user = session?.user as CustomUser; // Type assertion

  return (
    <div>
      {/* Check if the user is signed in and the user object has an id property */}
      {user && user.id ? (
        <>
          {/* <div>User ID: {user.id}</div> */}
          <div>User Email: {user.email}</div>
        </>
      ) : (
        <div>No user ID available for : {user?.name}</div>
      )}
    </div>
  );
}

export default AuthStatus;
