import { Suspense } from 'react';
import CallbackContent from './CallbackContent';
import styles from './callback.module.css';

// Page utama — wajib export default, bungkus dengan Suspense
export default function CallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CallbackContent />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <p className={styles.text}>Memuat...</p>
      </div>
    </div>
  );
}
