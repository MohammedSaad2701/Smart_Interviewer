import { useState } from 'react';
import { Video, Mic, Maximize, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PermissionsModal({ onPermissionsGranted, topicName }) {
  const [videoPermission, setVideoPermission] = useState(null);
  const [audioPermission, setAudioPermission] = useState(null);
  const [fullscreenEnabled, setFullscreenEnabled] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    setLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setVideoPermission(true);
      setAudioPermission(true);
    } catch (error) {
      console.error('Media permissions error:', error);
      setVideoPermission(false);
      setAudioPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenEnabled(true);
    } catch (error) {
      console.error('Fullscreen error:', error);
      setFullscreenEnabled(false);
    }
  };

  const handleStart = () => {
    if (videoPermission && audioPermission && fullscreenEnabled) {
      onPermissionsGranted();
    }
  };

  const allPermissionsGranted = videoPermission && audioPermission && fullscreenEnabled;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Setup Interview Environment</h2>
          <p className="text-slate-400">
            Topic: <span className="text-blue-400 font-semibold">{topicName}</span>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Camera Permission */}
          <div
            className={`flex items-center justify-between p-4 rounded-lg border ${
              videoPermission === null
                ? 'bg-slate-700/30 border-slate-600'
                : videoPermission
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-red-500/10 border-red-500/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Video
                className={`w-5 h-5 ${
                  videoPermission === null
                    ? 'text-slate-400'
                    : videoPermission
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              />
              <span className="text-white font-medium">Camera Access</span>
            </div>
            {videoPermission === null ? (
              <AlertCircle className="w-5 h-5 text-slate-400" />
            ) : videoPermission ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>

          {/* Microphone Permission */}
          <div
            className={`flex items-center justify-between p-4 rounded-lg border ${
              audioPermission === null
                ? 'bg-slate-700/30 border-slate-600'
                : audioPermission
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-red-500/10 border-red-500/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Mic
                className={`w-5 h-5 ${
                  audioPermission === null
                    ? 'text-slate-400'
                    : audioPermission
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              />
              <span className="text-white font-medium">Microphone Access</span>
            </div>
            {audioPermission === null ? (
              <AlertCircle className="w-5 h-5 text-slate-400" />
            ) : audioPermission ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>

          {/* Fullscreen Permission */}
          <div
            className={`flex items-center justify-between p-4 rounded-lg border ${
              fullscreenEnabled === null
                ? 'bg-slate-700/30 border-slate-600'
                : fullscreenEnabled
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-red-500/10 border-red-500/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Maximize
                className={`w-5 h-5 ${
                  fullscreenEnabled === null
                    ? 'text-slate-400'
                    : fullscreenEnabled
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              />
              <span className="text-white font-medium">Fullscreen Mode</span>
            </div>
            {fullscreenEnabled === null ? (
              <AlertCircle className="w-5 h-5 text-slate-400" />
            ) : fullscreenEnabled ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {!videoPermission && !audioPermission && (
            <button
              onClick={requestPermissions}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Requesting...' : 'Enable Camera & Microphone'}
            </button>
          )}

          {videoPermission && audioPermission && !fullscreenEnabled && (
            <button
              onClick={requestFullscreen}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Enable Fullscreen
            </button>
          )}

          {allPermissionsGranted && (
            <button
              onClick={handleStart}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Start Interview
            </button>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300 leading-relaxed">
            <strong>Note:</strong> Camera and microphone will be used to monitor your
            interview session. Fullscreen mode ensures you remain focused.
          </p>
        </div>
      </div>
    </div>
  );
}
