'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, Gamepad2, History, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-mesh bg-mesh-animated noise-overlay">
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Crown className="w-7 h-7 text-yellow-400" style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.3))' }} />
          <span
            className="text-xl font-semibold text-white" data-display-font
          >
            킹시커
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/game/setup" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
            새 게임
          </Link>
          <Link href="/questions" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
            문제 관리
          </Link>
        </nav>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <motion.h1
          className="text-3xl font-extrabold text-white mb-8" data-display-font
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          대시보드
        </motion.h1>

        {/* Start game banner */}
        <Link href="/game/setup">
          <motion.div
            className="w-full p-8 glass-strong border-gradient rounded-2xl flex items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.06] transition-all mb-8 group relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Gamepad2 className="w-10 h-10 text-purple-400 relative z-10" />
            <span
              className="text-2xl font-extrabold text-white relative z-10" data-display-font
            >
              새 게임 시작
            </span>
            <ArrowRight className="w-6 h-6 text-gray-500 relative z-10 transition-transform group-hover:translate-x-2" />
          </motion.div>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: <Gamepad2 className="w-6 h-6 text-purple-400" />,
              title: '총 게임',
              value: '0',
              desc: 'Supabase 연동 후 표시됩니다',
              color: 'text-purple-400',
              glow: 'group-hover:glow-purple',
            },
            {
              icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
              title: '문제 은행',
              value: '500+',
              desc: '2022 개정 교육과정 기반',
              color: 'text-emerald-400',
              glow: 'group-hover:glow-green',
            },
            {
              icon: <History className="w-6 h-6 text-blue-400" />,
              title: '평균 정답률',
              value: '--%',
              desc: '게임 진행 후 표시됩니다',
              color: 'text-blue-400',
              glow: 'group-hover:glow-blue',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              className={`group glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all cursor-default ${stat.glow}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {stat.icon}
                <h3 className="text-base font-semibold text-white">{stat.title}</h3>
              </div>
              <p className={`text-4xl font-extrabold ${stat.color} score-badge`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1.5">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent games */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">최근 게임</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mb-3 opacity-20" />
            <p>아직 진행한 게임이 없습니다</p>
            <Link href="/game/setup" className="text-purple-400 hover:text-purple-300 text-sm mt-2 transition-colors">
              첫 게임을 시작해보세요!
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
