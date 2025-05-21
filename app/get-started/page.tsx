'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function GetStartedPage() {
  const router = useRouter();

  return (
    <div className="get-started-container">
      <div className="get-started-box">
        <h1 className="get-started-title">Welcome to Heritageife Insurance</h1>
        <p className="get-started-subtitle">
          Secure your family's future with HeritageLife Insurance. Enjoy peace of mind, reliable claims, flexible policies, and support when you need it most. Your journey to financial protection starts here.
        </p>

        <div className="get-started-section">
          <motion.h2
            className="get-started-role-text"
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
            }}
          >
            If you're a policyholder, click below to log in or sign up.
          </motion.h2>

          <button onClick={() => router.push('./policyholder')} className="role-button">
            Continue as Policyholder
          </button>

          {/* ✅ Back to Home Button */}
          <div className="mt-4">
            <button
              onClick={() => router.push('/')}
              className="role-button"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
