'use client';

import { motion } from 'framer-motion';
import { Crown, Swords, BookOpen, Users, Sparkles, Shield, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: 5 + (i * 2.4 + (i * 7) % 23) % 90,
        y: 3 + (i * 3.1 + (i * 11) % 29) % 94,
        size: 1 + (i % 3),
        delay: (i % 7) * 0.3,
        duration: 2 + (i % 4),
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: star.size > 2
              ? 'radial-gradient(circle, rgba(250,204,21,0.8), rgba(250,204,21,0))'
              : 'rgba(250,204,21,0.4)',
            boxShadow: star.size > 2 ? '0 0 6px rgba(250,204,21,0.4)' : undefined,
          }}
          animate={{
            opacity: [0.1, 0.9, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

function FloatingOrb({ color, size, x, y, duration }: { color: string; size: number; x: string; y: string; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -25, 15, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function LandingPage() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: '팀 배틀',
      desc: '학급을 두 팀으로 나누고 가위바위보로 선공을 결정!',
      gradient: 'from-blue-500/20 via-blue-600/10 to-transparent',
      iconColor: 'text-blue-400',
      glowColor: 'group-hover:shadow-blue-500/20',
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: '숨겨진 왕',
      desc: '상대팀의 왕을 찾아라! 비밀 선택 시스템으로 스릴 만점!',
      gradient: 'from-yellow-500/20 via-amber-600/10 to-transparent',
      iconColor: 'text-yellow-400',
      glowColor: 'group-hover:shadow-yellow-500/20',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: '학습 퀴즈',
      desc: '2022 개정 교육과정 기반 500+ 문제 은행!',
      gradient: 'from-emerald-500/20 via-green-600/10 to-transparent',
      iconColor: 'text-emerald-400',
      glowColor: 'group-hover:shadow-emerald-500/20',
    },
  ];

  const stats = [
    { icon: <Zap className="w-5 h-5" />, value: '500+', label: '퀴즈 문제' },
    { icon: <Shield className="w-5 h-5" />, value: '4개', label: '학년 지원' },
    { icon: <Sparkles className="w-5 h-5" />, value: '6개', label: '교과목' },
  ];

  return (
    <div className="min-h-screen bg-mesh bg-mesh-animated overflow-x-hidden relative noise-overlay">
      <StarField />

      {/* Floating ambient orbs */}
      <FloatingOrb color="rgba(147,51,234,0.15)" size={300} x="10%" y="20%" duration={15} />
      <FloatingOrb color="rgba(59,130,246,0.1)" size={250} x="70%" y="10%" duration={18} />
      <FloatingOrb color="rgba(236,72,153,0.08)" size={200} x="50%" y="60%" duration={20} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <motion.div
          className="flex items-center gap-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-400" />
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ boxShadow: ['0 0 8px rgba(250,204,21,0.3)', '0 0 20px rgba(250,204,21,0.6)', '0 0 8px rgba(250,204,21,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">KingSeeker</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/questions/create">
            <motion.button
              className="px-4 py-2.5 glass rounded-xl font-semibold text-sm text-purple-200 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ 내 문제 만들기
            </motion.button>
          </Link>
          <Link href="/game/setup">
            <motion.button
              className="px-6 py-2.5 glass-strong rounded-xl font-semibold text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              게임 시작
            </motion.button>
          </Link>
        </motion.div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-6 md:pt-10 pb-24">
        <motion.div
          className="flex flex-col items-center gap-4 md:gap-6 text-center"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Crown with glow */}
          <div className="relative">
            <motion.span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl block animate-crown"
              style={{ filter: 'drop-shadow(0 0 30px rgba(250,204,21,0.4))' }}
            >
              👑
            </motion.span>
            <motion.div
              className="absolute -inset-6 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.15), transparent 70%)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gradient-gold tracking-tight" data-display-font
            >
              킹시커
            </h1>

            <motion.p
              className="text-base sm:text-lg md:text-2xl text-purple-200/90 font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              왕을 찾아라! 교실 퀴즈 배틀
            </motion.p>
          </div>

          <motion.p
            className="hidden sm:block text-gray-400/90 max-w-lg text-base md:text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            전자칠판 하나로 교실이 흥미진진한 퀴즈 배틀장으로!
            <br />
            팀을 나누고, 비밀 왕을 선택하고, 퀴즈를 풀어 왕을 찾아보세요.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link href="/game/setup">
              <motion.button
                className="group relative mt-1 px-8 md:px-12 py-3 md:py-5 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white rounded-2xl font-extrabold text-xl md:text-2xl overflow-hidden" data-display-font
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative flex items-center gap-3">
                  게임 시작하기
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(147,51,234,0.3), 0 0 60px rgba(147,51,234,0.1)',
                      '0 0 30px rgba(147,51,234,0.5), 0 0 80px rgba(147,51,234,0.2)',
                      '0 0 20px rgba(147,51,234,0.3), 0 0 60px rgba(147,51,234,0.1)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center gap-4 md:gap-8 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-2 text-gray-400"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 + i * 0.1 }}
              >
                <span className="text-purple-400">{stat.icon}</span>
                <span className="text-white font-semibold">{stat.value}</span>
                <span className="text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 md:mt-20 max-w-5xl w-full px-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={`group relative glass rounded-2xl p-7 text-center transition-all duration-300 hover:bg-white/[0.06] cursor-default overflow-hidden ${feature.glowColor} hover:shadow-lg`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />

              <div className="relative z-10">
                <div className={`flex justify-center mb-5 ${feature.iconColor}`}>
                  <motion.div
                    className="p-3 rounded-xl bg-white/5"
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <h3
                  className="text-xl font-semibold text-white mb-3" data-display-font
                >
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          className="mt-24 max-w-4xl w-full px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h2
            className="text-3xl font-extrabold text-center text-white mb-12" data-display-font
          >
            이렇게 진행돼요
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: '팀 나누기', desc: '학생들을 두 팀으로 나눠요', emoji: '👥' },
              { step: '02', title: '왕 선택', desc: '상대팀 중 비밀 왕을 골라요', emoji: '👑' },
              { step: '03', title: '퀴즈 풀기', desc: '문제를 맞춰야 왕을 지목!', emoji: '📝' },
              { step: '04', title: '왕 찾기', desc: '왕을 찾으면 점수 획득!', emoji: '🎯' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative glass rounded-xl p-5 text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4 + i * 0.1 }}
              >
                <span className="text-4xl mb-3 block">{item.emoji}</span>
                <span className="text-xs font-semibold text-purple-400 tracking-widest">STEP {item.step}</span>
                <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-600 z-10">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-24 flex items-center gap-2 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <Swords className="w-4 h-4" />
          <span className="text-sm">선생님을 위한 교실 학습 게임</span>
        </motion.div>
      </main>
    </div>
  );
}
