'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  ArrowLeft,
  Share2,
  Download,
  Upload,
  Trash2,
  Copy,
  Check,
  ClipboardPaste,
  Layers,
  AlertCircle,
} from 'lucide-react';
import {
  getQuestionSets,
  deleteQuestionSet,
  saveQuestionSet,
  encodeShareCode,
  decodeShareCode,
  exportSetJson,
  importSetJson,
  type QuestionSet,
} from '@/lib/questionSets';

export default function QuestionSetsPage() {
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [shareCode, setShareCode] = useState<{ setId: string; code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // localStorage 는 렌더 중에 읽을 수 없다. 이 앱은 정적 export 라 빌드 시점에
  // 빈 목록으로 프리렌더되므로, 렌더 중에 읽으면 하이드레이션 불일치가 난다.
  // 따라서 마운트 후 effect 에서 한 번 읽는 것이 올바른 방법이다.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSets(getQuestionSets());
  }, []);

  const notify = (kind: 'ok' | 'error', text: string) => {
    setMessage({ kind, text });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const refresh = () => setSets(getQuestionSets());

  const handleShare = async (set: QuestionSet) => {
    try {
      const code = await encodeShareCode(set);
      setShareCode({ setId: set.id, code });
      setCopied(false);
    } catch {
      notify('error', '공유 코드를 만들지 못했습니다.');
    }
  };

  const handleCopy = async () => {
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(shareCode.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('error', '복사에 실패했습니다. 코드를 길게 눌러 직접 복사해 주세요.');
    }
  };

  const handleDownload = (set: QuestionSet) => {
    const blob = new Blob([exportSetJson(set)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `킹시커-${set.name.replace(/[^\p{L}\p{N}\-_ ]/gu, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const acceptImported = (result: ReturnType<typeof importSetJson>, origin: string) => {
    if (!result.set) {
      notify('error', result.error ?? '가져오지 못했습니다.');
      return;
    }
    try {
      saveQuestionSet(result.set);
      refresh();
      notify(
        'ok',
        `"${result.set.name}" ${result.set.questions.length}문항을 가져왔습니다.` +
          (result.skipped > 0 ? ` (형식이 맞지 않는 ${result.skipped}문항 제외)` : '') +
          ` — ${origin}`
      );
      setImportOpen(false);
      setImportText('');
    } catch (e) {
      notify('error', e instanceof Error ? e.message : '저장하지 못했습니다.');
    }
  };

  const handleImportCode = async () => {
    if (!importText.trim()) return;
    const result = await decodeShareCode(importText);
    acceptImported(result, '공유 코드');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => acceptImported(importSetJson(String(reader.result ?? '')), file.name);
    reader.onerror = () => notify('error', '파일을 읽지 못했습니다.');
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    deleteQuestionSet(id);
    setPendingDelete(null);
    refresh();
    notify('ok', '문제 세트를 삭제했습니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] to-[#0d0520]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <Crown className="w-7 h-7 text-yellow-400" />
          <span className="text-xl font-semibold text-white" data-display-font>
            킹시커
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/questions" className="text-gray-400 hover:text-white text-sm font-medium">
            문제 은행
          </Link>
          <Link href="/questions/create" className="text-gray-400 hover:text-white text-sm font-medium">
            내 문제 만들기
          </Link>
          <Link href="/game/setup" className="text-gray-400 hover:text-white text-sm font-medium">
            새 게임
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/questions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-4">
          <ArrowLeft className="w-4 h-4" /> 문제 은행으로
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3" data-display-font>
            <Layers className="w-8 h-8 text-purple-400" /> 문제 세트
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setImportOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
            >
              <ClipboardPaste className="w-4 h-4" /> 공유받은 문제 가져오기
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold transition-colors"
            >
              <Upload className="w-4 h-4" /> 파일에서
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImportFile} className="hidden" />
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          직접 고른 문제를 세트로 묶어 두고, 옆 반 선생님께 공유 코드 한 줄이나 파일로 넘길 수 있습니다.
        </p>

        {message && (
          <div
            role="status"
            className={`mb-5 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
              message.kind === 'ok'
                ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                : 'bg-red-500/10 text-red-300 border border-red-500/30'
            }`}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* 애니메이션으로 감싸지 않는다 — 백그라운드 탭에서 rAF가 멈추면
            height:0 / opacity:0 상태로 고착돼 입력창을 쓸 수 없게 된다. */}
        {importOpen && (
          <div className="mb-6">
            <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-5">
                <label htmlFor="share-code-input" className="block text-sm font-semibold text-gray-300 mb-2">
                  받은 공유 코드를 붙여넣으세요 (KS1. 으로 시작합니다)
                </label>
                <textarea
                  id="share-code-input"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="KS1.z.…"
                  rows={4}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl p-3 text-gray-200 text-xs font-mono outline-none focus:ring-1 focus:ring-purple-500 resize-y break-all"
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => { setImportOpen(false); setImportText(''); }}
                    className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleImportCode}
                    disabled={!importText.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold"
                  >
                    가져오기
                  </button>
                </div>
            </div>
          </div>
        )}

        {sets.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="mb-2">아직 만든 문제 세트가 없습니다.</p>
            <p className="text-sm">
              <Link href="/questions" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
                문제 은행
              </Link>
              에서 문제를 골라 세트로 저장해 보세요.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {sets.map((set) => (
              <li key={set.id} className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white">{set.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {set.questions.length}문항
                      {set.grade ? ` · ${set.grade}학년` : ''}
                      {set.subject ? ` · ${set.subject}` : ''}
                      {set.unit ? ` · ${set.unit}` : ''}
                      {set.author ? ` · 만든이 ${set.author}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleShare(set)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-semibold"
                    >
                      <Share2 className="w-3.5 h-3.5" /> 공유 코드
                    </button>
                    <button
                      onClick={() => handleDownload(set)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" /> 파일
                    </button>
                    <Link
                      href={`/game/setup?set=${encodeURIComponent(set.id)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/80 hover:bg-green-500 text-white text-xs font-semibold"
                    >
                      이 세트로 게임
                    </Link>
                    <button
                      onClick={() => setPendingDelete(set.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-red-600/70 text-gray-300 hover:text-white text-xs font-semibold"
                      aria-label={`${set.name} 삭제`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {pendingDelete === set.id && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
                    <span className="text-sm text-red-200 flex-1">
                      “{set.name}” 세트를 삭제할까요? 되돌릴 수 없습니다.
                    </span>
                    <button onClick={() => setPendingDelete(null)} className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 text-xs font-semibold">
                      취소
                    </button>
                    <button onClick={() => handleDelete(set.id)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold">
                      삭제
                    </button>
                  </div>
                )}

                {shareCode?.setId === set.id && (
                  <div className="mt-4 rounded-xl bg-gray-900/70 border border-purple-500/30 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-xs text-purple-300 font-semibold">
                        이 코드를 메신저로 보내면 상대 선생님이 “공유받은 문제 가져오기”에 붙여넣어 바로 씁니다.
                      </p>
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? '복사됨' : '복사'}
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-gray-400 break-all max-h-32 overflow-y-auto select-all">
                      {shareCode.code}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-2">코드 길이 {shareCode.code.length.toLocaleString()}자</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
