import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TopNavBar from '../../components/TopNavBar';
import MegaFooter from '../../components/MegaFooter';

const AdminPage: React.FC = () => {
  const { user, isAdmin, login, logout, loading } = useAuth();

  return (
    <div className="bg-background min-h-screen font-body flex flex-col text-on-background selection:bg-primary/30">
      <TopNavBar />
      
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 md:px-8 xl:px-margin-desktop">
        <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-outline">
          <h1 className="font-headline-md text-3xl mb-6 text-center text-on-surface uppercase tracking-tight">Admin Portal</h1>
          
          {loading ? (
            <div className="text-center text-on-surface-variant">Loading...</div>
          ) : user ? (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="text-on-surface-variant mb-2">Signed in as</p>
                <p className="font-bold text-on-surface">{user.email}</p>
              </div>
              
              {isAdmin ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl text-center w-full">
                  <span className="material-symbols-outlined block mb-2 text-3xl">verified_user</span>
                  <p className="font-bold mb-1">Access Granted</p>
                  <p className="text-sm">Welcome, Admin.</p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center w-full">
                  <span className="material-symbols-outlined block mb-2 text-3xl">gpp_bad</span>
                  <p className="font-bold mb-1">Access Denied</p>
                  <p className="text-sm">You do not have administrative privileges.</p>
                </div>
              )}

              <button 
                onClick={logout}
                className="w-full bg-surface-variant text-on-surface px-6 py-3 rounded-full font-label-caps tracking-widest hover:bg-outline transition-colors uppercase text-sm font-bold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p className="text-center text-on-surface-variant mb-4">
                Please sign in with your Google account to access the admin portal.
              </p>
              <button 
                onClick={login}
                className="w-full bg-primary text-on-primary px-6 py-4 rounded-full font-label-caps tracking-widest hover:opacity-90 transition-opacity uppercase text-sm font-bold flex items-center justify-center gap-3 shadow-lg"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </main>

      <MegaFooter />
    </div>
  );
};

export default AdminPage;
