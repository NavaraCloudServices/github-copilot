import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy, Check, QrCode, UserPlus } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

const QRCodeJoin = ({ leaderboardId, accessCode, leaderboardName }) => {
  const [copiedAccessCode, setCopiedAccessCode] = useState(false);
  const [copiedJoinUrl, setCopiedJoinUrl] = useState(false);

  // Create join URL that includes the leaderboard ID and access code
  const joinUrl = `${window.location.origin}/join/${leaderboardId}?access=${accessCode}`;

  const copyAccessCode = async () => {
    try {
      await navigator.clipboard.writeText(accessCode);
      setCopiedAccessCode(true);
      toast.success('Access code copied!');
      setTimeout(() => setCopiedAccessCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy access code');
    }
  };

  const copyJoinUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedJoinUrl(true);
      toast.success('Join URL copied!');
      setTimeout(() => setCopiedJoinUrl(false), 2000);
    } catch (error) {
      toast.error('Failed to copy join URL');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Join This Competition
          </h3>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mx-auto mb-6 w-fit">
          <QRCode
            size={160}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={joinUrl}
            viewBox={`0 0 160 160`}
            level="M"
          />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Scan with your phone camera to join {leaderboardName}
        </p>

        {/* Access Code Display */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Access Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 font-mono text-xl font-bold text-center text-gray-900 dark:text-white">
              {accessCode}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAccessCode}
              className="shrink-0"
            >
              {copiedAccessCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Share this code for manual entry
          </p>
        </div>

        {/* Join URL for sharing */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={copyJoinUrl}
            className="w-full flex items-center justify-center gap-2"
          >
            {copiedJoinUrl ? <Check className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
            {copiedJoinUrl ? 'Join URL Copied!' : 'Copy Join URL'}
          </Button>
        </div>

        {/* Manual join link */}
        <div className="text-center">
          <a
            href={`/join/${leaderboardId}?access=${accessCode}`}
            className="text-sm text-primary hover:text-primary-600 underline"
          >
            Or click here to join manually
          </a>
        </div>
      </div>
    </div>
  );
};

export default QRCodeJoin;