'use client';
import { useSession } from 'next-auth/react';
function AuthStatus() {
    const { data: session, status } = useSession()
    if (status === 'loading') {
      return null;  // Return null or a loading spinner while the session is loading
    }

    return (
      <div>
        {/* Check if the user is signed in and the user object has an id property */}
        {session && session.user && session.user.id ? (
            <>
          {/* <div>User ID: {session.user.id}</div> */}
          <div>User Email: {session.user.email}</div>
          </>
        ) : (
          <div>No user ID available for : {session?.user?.name}</div>
        )}
      </div>
    );
  }
  
  export default AuthStatus;
  