import { useEffect, useRef, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function InterviewInterface({ topic, onComplete }) {
  // interview state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState([]);

  // camera refs/state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // devices + preflight
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [preflightDone, setPreflightDone] = useState(false); // whether user completed camera selection and entered
  const [showPreflight, setShowPreflight] = useState(true);

  // draggable widget
  const [pos, setPos] = useState({ x: null, y: null });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  // fullscreen exit timer (30s)
  const EXIT_TIMEOUT = 30; // seconds
  const [exitSecondsLeft, setExitSecondsLeft] = useState(0);
  const exitTimerRef = useRef(null);

  // ----- enumerate devices on mount -----
  useEffect(() => {
    let mounted = true;
    const enumerate = async () => {
      try {
        // this won't prompt permissions, just returns labels only if already granted in some browsers.
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const v = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(v);
        if (v.length) setSelectedDeviceId((id) => id || v[0].deviceId);
      } catch (err) {
        console.warn('enumerateDevices failed', err);
      }
    };
    enumerate();
    return () => { mounted = false; };
  }, []);

  // ----- init interview questions (from localStorage or server) -----
  useEffect(() => {
    if (!topic) return;
    init();
    // cleanup when topic changes
    return () => {
      stopCamera();
      clearExitTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  const questionsKey = topic ? `questions_${topic.id || topic._id || topic.name || 'default'}` : 'questions_default';

  const init = async () => {
  setLoading(true);
  console.log('init topic:', topic);

  try {
    // 1) If topic has subtopics with questions, flatten and use them
    if (topic && Array.isArray(topic.subtopics) && topic.subtopics.length > 0) {
      const flattened = [];
      topic.subtopics.forEach((s, si) => {
        if (Array.isArray(s.questions)) {
          s.questions.forEach((q, qi) => {
            if (typeof q === 'string') {
              flattened.push({ id: `t${topic.id}_s${si}_q${qi}`, prompt: q });
            } else {
              flattened.push({
                id: q.id || `t${topic.id}_s${si}_q${qi}`,
                prompt: q.prompt || q.title || q.text || String(q),
                meta: q.meta || null,
              });
            }
          });
        }
      });

      if (flattened.length > 0) {
        setQuestions(flattened);
        setLoading(false);
        return;
      }
    }

    // 2) try localStorage fallback
    const rawLocal = localStorage.getItem(questionsKey);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const qs = parsed.map((q, i) => ({ id: q.id || `q-${i}`, prompt: q.prompt || `Q${i + 1}` }));
        setQuestions(qs);
        setLoading(false);
        return;
      }
    }
  } catch (err) {
    console.warn('init local/topic load failed', err);
    // continue to server fallback
  }

  // 3) server fallback (existing behavior)
  try {
    const createRes = await axios.post('https://smart-interviewer-8.onrender.com//api/sessions/create', {
      topicId: topic?.id || topic?._id,
      candidateId: null,
    });
    const session = createRes.data?.session;
    const sid = session?._id || session?.id;
    setSessionId(sid);

    const s = await axios.get(`https://smart-interviewer-8.onrender.com/api/sessions/${sid}`);
    const sessionData = s.data || {};
    const raw = sessionData.session?.questions || [];

    const qs = raw
      .map((q, i) => {
        if (!q) return null;
        if (typeof q === 'string' || typeof q === 'number') return { id: q, prompt: `Question ${i + 1}` };
        return {
          id: q.questionId || q.id || q._id || `q-${i}`,
          prompt: q.prompt || q.text || q.questionText || `Question ${i + 1}`,
          meta: q.meta || null,
        };
      })
      .filter(Boolean);

    setQuestions(qs.length ? qs : [{ id: 'no-q', prompt: 'No questions available for this topic.' }]);
  } catch (err) {
    console.error('init error', err);
    // final fallback
    if (topic?.questions?.length) {
      setQuestions(topic.questions.map((q, i) => ({ id: q.id || q._id || i, prompt: q.prompt || q.text || `Q${i + 1}` })));
    } else {
      setQuestions([{ id: 'fallback', prompt: 'No questions found.' }]);
    }
  } finally {
    setLoading(false);
  }
};


  // ---------- camera helpers ----------
  const startCameraWithDevice = async (deviceId) => {
    setCameraError(null);
    setAutoplayBlocked(false);
    setCameraReady(false);

    try {
      const constraints = deviceId
        ? { video: { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }
        : { video: { facingMode: { ideal: 'user' }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      attachStream(stream);
    } catch (err) {
      console.error('startCameraWithDevice error:', err);
      setCameraError(err.message || String(err));
      setCameraReady(false);
      streamRef.current = null;
    }
  };

  const attachStream = (stream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // user gesture usually available when called from a click handler, so play should succeed
      const p = videoRef.current.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          setCameraReady(true);
          setAutoplayBlocked(false);
        }).catch((playErr) => {
          console.warn('video play failed:', playErr);
          setAutoplayBlocked(true);
          setCameraReady(false);
        });
      } else {
        setCameraReady(true);
      }
    }
  };

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraReady(false);
      setAutoplayBlocked(false);
    } catch (e) {
      console.warn('stopCamera error', e);
    }
  };

  // ---------- enter interview (user gesture) ----------
  const enterInterview = async () => {
    try {
      // ensure fullscreen first (user gesture)
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('requestFullscreen failed', err);
    }

    // start selected camera (user gesture -> avoids autoplay block)
    await startCameraWithDevice(selectedDeviceId);
    setPreflightDone(true);
    setShowPreflight(false);

    // re-enumerate devices (labels may become available after permission)
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const v = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(v);
      if (v.length && !selectedDeviceId) setSelectedDeviceId(v[0].deviceId);
    } catch (e) {
      // ignore
    }
  };

  // ---------- fullscreen detection & exit timer ----------
  useEffect(() => {
    const onFs = () => onFullscreenChange();
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFullscreenChange = () => {
    const inFullscreen = !!document.fullscreenElement;
    if (!inFullscreen) {
      // user left fullscreen — start timer
      startExitTimer();
    } else {
      // returned — cancel
      clearExitTimer();
    }
  };

  const startExitTimer = () => {
    if (exitTimerRef.current) return;
    setExitSecondsLeft(EXIT_TIMEOUT);
    exitTimerRef.current = setInterval(() => {
      setExitSecondsLeft((s) => {
        if (s <= 1) {
          clearExitTimer();
          finishInterviewDueToExitTimer();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const clearExitTimer = () => {
    if (exitTimerRef.current) {
      clearInterval(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setExitSecondsLeft(0);
  };

  const finishInterviewDueToExitTimer = () => {
    const final = computeFinalScore();
    onComplete(final);
  };

  const computeFinalScore = () => {
    if (scores && scores.length > 0) {
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    const scoreForQ = answer && answer.length > 10 ? 100 : answer && answer.length > 3 ? 60 : 20;
    return Math.round(scoreForQ);
  };

  // allow Enter key to re-enter fullscreen when overlay active
  useEffect(() => {
    const onKey = async (e) => {
      if (e.key === 'Enter' && exitSecondsLeft > 0) {
        try {
          if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
          // when user re-enters, cancel exit timer
          clearExitTimer();
        } catch (err) {
          console.warn('enter fullscreen via Enter failed', err);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exitSecondsLeft]);

  // --------- dragging handlers (as before) ----------
  const onDragStart = (e) => {
    if (exitSecondsLeft > 0) return; // prevent dragging when locked
    const isTouch = e.type === 'touchstart';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const originX = pos.x != null ? pos.x : window.innerWidth - 280;
    const originY = pos.y != null ? pos.y : window.innerHeight - 170;
    dragRef.current = { dragging: true, startX: clientX, startY: clientY, originX, originY };
    if (isTouch) {
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    } else {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const nx = dragRef.current.originX + dx;
    const ny = dragRef.current.originY + dy;
    setPos(clampPos(nx, ny));
  };

  const onMouseUp = () => {
    dragRef.current.dragging = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  const onTouchMove = (e) => {
    if (!dragRef.current.dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - dragRef.current.startX;
    const dy = t.clientY - dragRef.current.startY;
    const nx = dragRef.current.originX + dx;
    const ny = dragRef.current.originY + dy;
    setPos(clampPos(nx, ny));
  };

  const onTouchEnd = () => {
    dragRef.current.dragging = false;
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  };

  const clampPos = (nx, ny) => {
    const margin = 8;
    const w = Math.min(320, window.innerWidth * 0.35);
    const h = 160;
    const clampedX = Math.max(margin, Math.min(window.innerWidth - w - margin, nx));
    const clampedY = Math.max(margin, Math.min(window.innerHeight - h - margin, ny));
    return { x: clampedX, y: clampedY };
  };

  // --------- submit answer ----------
  const submitAnswer = async () => {
    if (exitSecondsLeft > 0) return; // blocked while overlay active
    setSubmitting(true);
    try {
      const scoreForQ = answer && answer.length > 10 ? 100 : answer && answer.length > 3 ? 60 : 20;
      setScores((p) => [...p, scoreForQ]);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((i) => i + 1);
        setAnswer('');
      } else {
        const all = [...scores, scoreForQ];
        const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
        onComplete(avg);
      }
    } catch (err) {
      console.error('submit error', err);
    } finally {
      setSubmitting(false);
    }
  };

  // loading screen
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const current = questions[currentQuestionIndex] || { prompt: 'No question' };
  const widgetStyle = pos.x == null || pos.y == null
    ? { position: 'fixed', right: 20, bottom: 20, width: Math.min(320, window.innerWidth * 0.33) }
    : { position: 'fixed', left: pos.x, top: pos.y, width: Math.min(320, window.innerWidth * 0.33) };

  return (
    <div className="w-screen h-screen flex bg-slate-900 overflow-hidden relative">
      {/* Preflight: camera selection and preview — shown until user clicks "Enter Interview" */}
      {showPreflight && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative z-70 w-full max-w-2xl p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl text-white font-semibold mb-3">Prepare your camera</h2>

              <div className="mb-3">
                <label className="text-sm text-slate-300 block mb-1">Select camera</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full p-2 bg-slate-900 text-white rounded"
                >
                  {videoDevices.length ? (
                    videoDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId}`}</option>
                    ))
                  ) : (
                    <option value="">No cameras found</option>
                  )}
                </select>
              </div>

              <div className="mb-3">
                <div className="w-full h-48 bg-black/70 rounded overflow-hidden flex items-center justify-center">
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                </div>
                <div className="mt-2 text-sm text-slate-400">Preview — allow camera when prompted. If you can't see yourself, try a different camera from the dropdown and click <strong>Enter Interview</strong>.</div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => { setShowPreflight(false); }}
                  className="px-4 py-2 bg-slate-700 text-white rounded"
                >
                  Skip (no camera)
                </button>
                <button
                  onClick={enterInterview}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Enter Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* left 1/3 */}
      <aside className="w-1/3 h-full bg-slate-800/70 border-r border-slate-700 p-6 overflow-auto">
        <div className="sticky top-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">{topic?.name || 'Topic'}</h3>
              <p className="text-slate-400 text-sm">{topic?.description || ''}</p>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white font-mono text-sm">00:10</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-white mb-2">Question {currentQuestionIndex + 1}</h2>
            <p className="text-slate-300 whitespace-pre-wrap">{current.prompt}</p>
          </div>

          <div className="mt-6 text-slate-400 text-sm space-y-2">
            <div><strong>Hints:</strong> Think about time & space.</div>
            <div><strong>Constraints:</strong> Check input sizes.</div>
            <div><strong>Examples:</strong> {current.example || '—'}</div>
          </div>
        </div>
      </aside>

      {/* right 2/3 */}
      <main className="w-2/3 h-full p-6 flex flex-col">
        <div className="flex-1 bg-slate-900/60 border border-slate-700 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md text-slate-300">Code / Explanation</h3>
            <div className="text-slate-400 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</div>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your approach, pseudo-code or actual code here..."
            className="flex-1 w-full bg-slate-900/80 text-slate-100 font-mono p-4 resize-none rounded-md focus:outline-none"
            style={{ minHeight: 0 }}
            disabled={exitSecondsLeft > 0}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={submitAnswer}
              disabled={submitting || exitSecondsLeft > 0}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : (currentQuestionIndex < questions.length - 1 ? 'Submit & Next' : 'Submit & Finish')}
            </button>
          </div>

          {/* show a small indicator about camera status */}
          <div className="mt-4 text-sm text-slate-400">
            Camera status: <span className="text-white">{cameraReady ? 'Ready' : cameraError ? `Error: ${cameraError}` : (preflightDone ? 'Starting...' : 'Not started')}</span>
            {autoplayBlocked && <span className="text-yellow-300 ml-2"> (Autoplay blocked — video may require user gesture)</span>}
          </div>
        </div>
      </main>

      {/* draggable camera widget */}
      <div
        style={{
          zIndex: 60,
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 6px 30px rgba(2,6,23,0.6)',
          ...widgetStyle,
        }}
        className="bg-black/60 border border-slate-700 relative"
      >
        {/* handle (drag start) */}
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          className={`flex items-center justify-between px-3 py-2 bg-slate-800/70 ${exitSecondsLeft > 0 ? 'cursor-not-allowed' : 'cursor-grab'}`}
          style={{ userSelect: 'none' }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-sm text-white">Camera</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* camera select during session */}
            <select
              value={selectedDeviceId}
              onChange={async (e) => {
                const id = e.target.value;
                setSelectedDeviceId(id);
                // restart camera with new device (user gesture required in some browsers; this is triggered by change event so usually allowed)
                await startCameraWithDevice(id);
              }}
              className="bg-slate-800 text-xs text-white p-1 rounded"
            >
              {videoDevices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId}`}</option>)}
            </select>
            <div className="text-xs text-slate-400">Drag</div>
          </div>
        </div>

        <div style={{ width: '100%', height: 160, background: '#05060a', position: 'relative' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
          />

          {/* overlay controls / messages when camera not ready */}
          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
              {cameraError ? (
                <div className="text-sm text-red-300 bg-black/50 p-2 rounded">{cameraError}</div>
              ) : autoplayBlocked ? (
                <div className="text-sm text-slate-300">Autoplay blocked — user gesture may be required</div>
              ) : (
                <div className="text-sm text-slate-400">Starting camera...</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* fullscreen-exit 30s full-screen blocking overlay */}
      {exitSecondsLeft > 0 && (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center"
          style={{ zIndex: 9999, pointerEvents: 'auto' }}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-90 max-w-3xl mx-4">
            <div className="bg-yellow-500 text-black px-8 py-12 rounded-lg shadow-2xl text-center">
              <h2 className="text-2xl font-bold mb-2">You left fullscreen</h2>
              <p className="mb-4">The interview will end in <span className="font-mono">{exitSecondsLeft}</span> second{exitSecondsLeft > 1 ? 's' : ''} unless you return to fullscreen.</p>
              <p className="text-sm text-black/80">Press <strong>Enter</strong> to return to fullscreen. While this countdown is active the interface is locked and you cannot edit answers.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
