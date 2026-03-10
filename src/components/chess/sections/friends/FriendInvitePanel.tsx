import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { SITE_URL } from './FriendTypes';

interface FriendInvitePanelProps {
  userCode: string;
  friendCode: string;
  setFriendCode: (code: string) => void;
  showAddFriend: boolean;
  setShowAddFriend: (show: boolean) => void;
  addError: string;
  setAddError: (error: string) => void;
  addSuccess: string;
  onAddFriend: (code?: string) => void;
  isMobile: boolean;
}

export const FriendInvitePanel = ({
  userCode,
  friendCode,
  setFriendCode,
  showAddFriend,
  setShowAddFriend,
  addError,
  setAddError,
  addSuccess,
  onAddFriend,
  isMobile,
}: FriendInvitePanelProps) => {
  const [copied, setCopied] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const fallbackCopy = (text: string) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };

  const copyInviteLink = () => {
    const link = `${SITE_URL}?invite=${userCode}`;
    const doCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(doCopy).catch(() => { fallbackCopy(link); doCopy(); });
    } else {
      fallbackCopy(link); doCopy();
    }
  };

  const startScanner = async () => {
    setShowScanner(true);
    setTimeout(async () => {
      if (!scannerRef.current) return;
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode(scannerRef.current.id);
        html5QrCodeRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            let code = decodedText;
            try { const url = new URL(decodedText); const invite = url.searchParams.get('invite'); if (invite) code = invite; } catch { /* not url */ }
            setFriendCode(code);
            setShowScanner(false);
            setShowAddFriend(true);
            scanner.stop().catch(() => {});
          },
          () => {}
        );
      } catch {
        alert('Не удалось запустить камеру.');
        setShowScanner(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) html5QrCodeRef.current.stop().catch(() => {});
    setShowScanner(false);
  };

  const qrCodeUrl = userCode ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${SITE_URL}?invite=${userCode}`)}` : '';

  return (
    <>
      <div
        onClick={copyInviteLink}
        className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/60 dark:border-blue-500/20 cursor-pointer hover:border-blue-400 dark:hover:border-blue-400/50 active:scale-[0.99] transition-all"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5 flex items-center gap-1.5">
              <Icon name="Fingerprint" size={14} /> Ваш уникальный ID
            </div>
            <div className="flex items-center gap-2 max-w-full">
              <code className="text-sm sm:text-lg md:text-xl font-mono font-bold text-slate-900 dark:text-white bg-white/70 dark:bg-slate-800/70 px-2 sm:px-3 py-1.5 rounded-lg tracking-wider truncate">
                {userCode || '...'}
              </code>
              <span className={`text-xs transition-all flex-shrink-0 ${copied ? 'text-green-500' : 'text-blue-400'}`}>
                {copied ? <span className="flex items-center gap-1"><Icon name="Check" size={14} /> Скопировано!</span> : <Icon name="Copy" size={14} />}
              </span>
            </div>
            <p className="text-[11px] text-blue-500/70 dark:text-blue-400/50 mt-1.5">Нажмите в любое место — скопируется ссылка</p>
          </div>
          {qrCodeUrl && (
            <div className="flex-shrink-0 bg-white rounded-lg p-1 sm:p-1.5 shadow-sm" onClick={(e) => e.stopPropagation()}>
              <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 sm:w-24 sm:h-24 rounded" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => { setShowAddFriend(!showAddFriend); setShowScanner(false); setAddError(''); }} className="bg-blue-600 hover:bg-blue-700 text-white border-0 w-full sm:w-auto">
          <Icon name="UserPlus" size={18} className="mr-2" /> Ввести ID друга
        </Button>
        {isMobile && (
          <Button onClick={showScanner ? stopScanner : startScanner} variant="outline" className="border-blue-300 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 w-full sm:w-auto">
            <Icon name={showScanner ? 'X' : 'ScanLine'} size={18} className="mr-2" />
            {showScanner ? 'Закрыть сканер' : 'Сканировать QR'}
          </Button>
        )}
      </div>

      {showScanner && (
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 animate-scale-in">
          <div id="qr-scanner-region" ref={scannerRef} className="w-full" />
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">Наведите камеру на QR-код друга</p>
        </div>
      )}

      {showAddFriend && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 animate-scale-in">
          <div className="flex gap-2">
            <input
              type="text"
              value={friendCode}
              onChange={(e) => { setFriendCode(e.target.value); setAddError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && onAddFriend()}
              placeholder="Введите ID друга (USER-...)"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              autoFocus
            />
            <Button onClick={() => onAddFriend()} disabled={!friendCode.trim()} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white border-0">
              <Icon name="Plus" size={18} />
            </Button>
          </div>
          {addError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><Icon name="AlertCircle" size={12} /> {addError}</p>}
          {addSuccess && <p className="text-xs text-green-500 mt-2 flex items-center gap-1"><Icon name="Check" size={12} /> {addSuccess}</p>}
        </div>
      )}
    </>
  );
};

export default FriendInvitePanel;