import { useState, useEffect } from 'react';
import './index.css';
import Login from './components/Login';
import Register from './components/Register';
import TopicSelection from './components/TopicSelection';
import PermissionModal from './components/PermissionModal';
import InterviewInterface from './components/InterviewInterface';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [interviewScore, setInterviewScore] = useState(null);

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
      setView('topics');
    }
  }, []);

  function onAuthSuccess(userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setView('topics');
  }

  function handleTopicSelect(topic) {
    setSelectedTopic(topic);
    setView('permissions');
  }

  function handlePermissionsGranted() {
    setView('interview');
  }

  function handleInterviewComplete(score) {
    setInterviewScore(score);
    setView('results');
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('user');
    setView('login');
  }

  if (view === 'login') {
    return <Login onAuthSuccess={onAuthSuccess} switchToRegister={() => setView('register')} />;
  }
  if (view === 'register') {
    return <Register onAuthSuccess={onAuthSuccess} switchToLogin={() => setView('login')} />;
  }
  if (view === 'topics') {
    return (
      <>
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-slate-700 text-white px-4 py-2 rounded-lg">Logout</button>
        <TopicSelection onTopicSelect={handleTopicSelect} />
      </>
    );
  }
  if (view === 'permissions') {
    return <PermissionModal onPermissionsGranted={handlePermissionsGranted} topicName={selectedTopic?.name} />;
  }
  if (view === 'interview') {
    return <InterviewInterface topic={selectedTopic} onComplete={handleInterviewComplete} />;
  }
  if (view === 'results') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Interview Complete!</h1>
          <p className="text-lg text-slate-300 mb-4">Your Score: <span className="font-bold text-blue-400">{interviewScore}</span></p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg" onClick={() => setView('topics')}>Try Another Topic</button>
        </div>
      </div>
    );
  }
  return null;
}

export default App;