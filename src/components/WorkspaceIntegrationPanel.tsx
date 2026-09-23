import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Mail, CheckSquare, HardDrive, RefreshCw, LogOut } from 'lucide-react';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/tasks.readonly');

let cachedAccessToken: string | null = null;

export const WorkspaceIntegrationPanel: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setToken(credential.accessToken);
        setUser(result.user);
        await fetchData(credential.accessToken);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    cachedAccessToken = null;
    setToken(null);
    setUser(null);
    setDriveFiles([]);
    setEmails([]);
    setTasks([]);
  };

  const fetchData = async (accessToken: string) => {
    setIsLoading(true);
    try {
      // 1. Google Drive
      const driveRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType)', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const driveData = await driveRes.json();
      if (driveData.files) setDriveFiles(driveData.files);

      // 2. Google Tasks
      const tasksRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists/@default/tasks?maxResults=10', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const tasksData = await tasksRes.json();
      if (tasksData.items) setTasks(tasksData.items);

      // 3. Gmail
      const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=5', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const gmailData = await gmailRes.json();
      if (gmailData.threads) {
        const threadDetails = await Promise.all(gmailData.threads.map(async (t: any) => {
          const tRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${t.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const tData = await tRes.json();
          const subjectHeader = tData.messages[0]?.payload?.headers?.find((h: any) => h.name === 'Subject');
          return { id: t.id, snippet: tData.snippet, subject: subjectHeader?.value || 'No Subject' };
        }));
        setEmails(threadDetails);
      }
    } catch (err) {
      console.error('Data fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    if (token) fetchData(token);
    else if (cachedAccessToken) fetchData(cachedAccessToken);
  };

  return (
    <div className="mt-4 flex-1 flex flex-col space-y-4 font-mono text-xs overflow-y-auto pr-2">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#151922] border border-amber-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <img src={user?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"} alt="Google" className="w-8 h-8 rounded-full bg-white p-1" />
          <div>
            <h4 className="font-bold text-white text-xs">Google Workspace Link</h4>
            <p className="text-[10px] text-slate-400">{user ? user.email : 'Not connected'}</p>
          </div>
        </div>
        {!user || (!token && !cachedAccessToken) ? (
          <button 
            onClick={handleLogin} 
            disabled={isLoggingIn}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold font-sans rounded-xl flex items-center gap-2 hover:from-amber-400 hover:to-amber-600 transition-colors shadow-sm cursor-pointer"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-4 h-4" />
            {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={refreshData} className="p-2 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 rounded-xl flex items-center gap-1 cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button onClick={handleLogout} className="p-2 border border-amber-700/30 text-amber-500 hover:bg-amber-900/20 rounded-xl flex items-center gap-1 cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {(user && (token || cachedAccessToken)) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gmail */}
          <div className="flex flex-col border border-amber-500/20 bg-[#151922] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold uppercase tracking-wider text-[10px] pb-2 border-b border-amber-500/15">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Recent Gmail Threads</span>
            </div>
            <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {emails.length === 0 && !isLoading && <p className="text-slate-500 text-[10px] italic">No emails found.</p>}
              {emails.map((email, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0f1116] border border-amber-500/15">
                  <div className="font-semibold text-white truncate text-xs">{email.subject}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">{email.snippet}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Drive */}
          <div className="flex flex-col border border-amber-500/20 bg-[#151922] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold uppercase tracking-wider text-[10px] pb-2 border-b border-amber-500/15">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Linked Drive Files</span>
            </div>
            <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {driveFiles.length === 0 && !isLoading && <p className="text-slate-500 text-[10px] italic">No files found.</p>}
              {driveFiles.map((file, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0f1116] border border-amber-500/15 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></div>
                  <div className="truncate flex-1">
                    <div className="text-white text-xs truncate">{file.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="flex flex-col border border-amber-500/20 bg-[#151922] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-amber-300 font-bold uppercase tracking-wider text-[10px] pb-2 border-b border-amber-500/15">
              <CheckSquare className="w-4 h-4 text-amber-300" />
              <span>Upcoming Tasks</span>
            </div>
            <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {tasks.length === 0 && !isLoading && <p className="text-slate-500 text-[10px] italic">No tasks found.</p>}
              {tasks.map((task, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0f1116] border border-amber-500/15 flex items-start gap-2">
                  <div className={`w-3.5 h-3.5 border rounded shrink-0 mt-0.5 ${task.status === 'completed' ? 'bg-amber-500/20 border-amber-400 text-amber-400 flex items-center justify-center' : 'border-amber-500/30'}`}>
                    {task.status === 'completed' && <CheckSquare className="w-2.5 h-2.5" />}
                  </div>
                  <div className={`flex-1 truncate text-xs ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {task.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
