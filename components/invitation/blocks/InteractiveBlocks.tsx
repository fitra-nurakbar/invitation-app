'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Copy, Send, Tv } from 'lucide-react';
import type { BlockType, Invitation, Message } from '@/types';
import styles from '@/app/[slug]/page.module.css';
import type { InvitationInteraction } from '../InvitationRenderer';

type Props = {
  type: BlockType;
  invitation: Partial<Invitation>;
  interaction?: InvitationInteraction;
  guestName?: string;
  messages?: Message[];
  rsvpSubmitting?: boolean;
  rsvpError?: string | null;
  rsvpSuccess?: boolean;
};

function RsvpSection({
  invitation,
  interaction,
  guestName,
  messages,
  rsvpSubmitting = false,
  rsvpError = null,
  rsvpSuccess = false,
}: Omit<Props, 'type'>) {
  const initialName = guestName && guestName !== 'Tamu Undangan' ? guestName : '';
  const [name, setName] = useState(initialName);
  const [attendance, setAttendance] = useState('hadir');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (guestName && guestName !== 'Tamu Undangan') setName(guestName);
  }, [guestName]);

  const list = messages ?? invitation.messages ?? [];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    interaction?.onSubmitRsvp?.({
      name: name.trim(),
      attendance,
      message: message.trim(),
    });
    setMessage('');
  };

  return (
    <section className={styles.section} data-shared-block="rsvp">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>Buku Tamu</span>
        <h2 className={styles.sectionTitle}>Doa &amp; Ucapan Restu</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.rsvpForm}>
        {rsvpError && (
          <div className={styles.rsvpAlertError}>
            <AlertCircle size={14} strokeWidth={1.75} />
            <span>{rsvpError}</span>
          </div>
        )}
        {rsvpSuccess && (
          <div className={styles.rsvpAlertSuccess}>
            <CheckCircle2 size={14} strokeWidth={1.75} />
            <span>Terima kasih. Doa restu Anda telah terkirim.</span>
          </div>
        )}
        <div className={styles.formGroup}>
          <label className={styles.label}>Nama Tamu</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Nama Anda"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Konfirmasi Kehadiran</label>
          <select
            className={styles.select}
            value={attendance}
            onChange={e => setAttendance(e.target.value)}
          >
            <option value="hadir">Hadir</option>
            <option value="tidak_hadir">Tidak Hadir</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Ucapan &amp; Doa Restu</label>
          <textarea
            className={styles.textarea}
            placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            required
          />
        </div>
        <button type="submit" className={styles.submitRsvp} disabled={rsvpSubmitting}>
          <Send size={14} strokeWidth={1.75} />
          <span>{rsvpSubmitting ? 'Mengirim...' : 'Kirim Ucapan & Doa'}</span>
        </button>
      </form>
      <div className={styles.messageList}>
        {list.length === 0 ? (
          <p className={styles.emptyMessageText}>
            Belum ada ucapan. Jadilah yang pertama memberikan doa restu.
          </p>
        ) : (
          list.map(msg => {
            const isTidak = msg.attendance === 'tidak_hadir';
            const badgeClass = isTidak ? styles.attendanceTidak : styles.attendanceHadir;
            return (
              <div key={msg.id} className={styles.messageCard}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageAuthor}>{msg.name}</span>
                  <span className={`${styles.attendanceBadge} ${badgeClass}`}>
                    {isTidak ? 'Tidak Hadir' : 'Hadir'}
                  </span>
                </div>
                <p className={styles.messageContent}>{msg.message}</p>
                <span className={styles.messageTime}>
                  {new Date(msg.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export function InteractiveBlock(props: Props) {
  const { type, invitation } = props;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const detail = invitation.detail;

  if (type === 'gift' && detail?.wedding_gift?.length) {
    return (
      <section className={styles.section} data-shared-block="gift">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Tanda Kasih</span>
          <h2 className={styles.sectionTitle}>Amplop Digital</h2>
          <p className={styles.giftSubtitle}>
            Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberi
            tanda kasih, dapat mengirimkan melalui tautan berikut:
          </p>
        </div>
        <div className={styles.giftList}>
          {detail.wedding_gift.map((gift, index) => {
            const isQris = gift.platform?.toUpperCase().includes('QRIS');
            const qrisSrc = gift.qris_image || (gift.id?.startsWith('http') ? gift.id : '');
            return (
              <div className={styles.giftCard} key={`${gift.platform}-${index}`}>
                <div className={styles.giftBank}>{gift.platform}</div>
                {qrisSrc && (
                  <div className={styles.giftQrisWrap}>
                    <img src={qrisSrc} alt={`QRIS ${gift.name}`} className={styles.giftQrisImg} />
                  </div>
                )}
                <div className={styles.giftNumber}>{gift.id}</div>
                <div className={styles.giftHolder}>a.n {gift.name}</div>
                <button
                  className={styles.copyBtn}
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(gift.id);
                    setCopiedIndex(index);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check size={13} strokeWidth={2} />
                      <span>Tersalin ke Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} strokeWidth={1.75} />
                      <span>{isQris ? 'Salin Kode / NMID QRIS' : 'Salin Nomor Rekening'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
  if (type === 'streaming' && detail?.streaming_platform) {
    return (
      <section className={styles.section} data-shared-block="streaming">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Virtual Event</span>
          <h2 className={styles.sectionTitle}>Siaran Langsung</h2>
        </div>
        <div className={styles.streamingCard}>
          <Tv
            size={28}
            strokeWidth={1.5}
            style={{ color: 'var(--accent-classic, #8a704c)', marginBottom: '12px' }}
          />
          <p className={styles.streamingDesc}>
            Bagi keluarga dan kerabat yang berhalangan hadir secara langsung, Anda dapat menyaksikan
            prosesi pernikahan kami secara virtual melalui tautan berikut:
          </p>
          <div>
            <a
              href={detail.streaming_platform}
              target="_blank"
              rel="noreferrer"
              className={styles.streamingBtn}
            >
              <Tv size={14} strokeWidth={1.75} />
              <span>Tonton Siaran Langsung</span>
            </a>
          </div>
        </div>
      </section>
    );
  }
  if (type === 'rsvp') return <RsvpSection {...props} />;
  return null;
}
