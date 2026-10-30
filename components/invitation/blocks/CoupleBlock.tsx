'use client';

import { User } from 'lucide-react';
import type { Invitation, PersonDetail } from '@/types';
import styles from '@/app/[slug]/page.module.css';

type CoupleBlockProps = { invitation: Partial<Invitation> };
type PersonValue = (PersonDetail & { birth_date?: string }) | string | undefined;

function normalizePerson(value: PersonValue, fallback: string, legacyParents?: string) {
  if (typeof value === 'string') return { name: value, parent: legacyParents };
  if (!value) return { name: fallback, parent: legacyParents };
  return { ...value, parent: value.parent || legacyParents };
}

function formatParents(raw?: string) {
  if (!raw) return '';
  if (/^(putra|putri|anak)/i.test(raw.trim())) return raw;
  return `Putra/Putri dari ${raw}`;
}

function PersonCard({
  value,
  fallback,
  legacyParents,
}: {
  value: PersonValue;
  fallback: string;
  legacyParents?: string;
}) {
  const detail = normalizePerson(value, fallback, legacyParents);
  const birth =
    detail.birth_date && detail.place_of_birth
      ? `${detail.place_of_birth}, ${detail.birth_date}`
      : detail.place_of_birth || detail.birth_date || '';
  const parents = formatParents(detail.parent);

  return (
    <div className={styles.coupleCard} data-person-card>
      {detail.photo ? (
        <img src={detail.photo} alt={detail.name} className={styles.couplePhoto} />
      ) : (
        <div className={styles.coupleAvatar} aria-hidden="true">
          <User size={24} strokeWidth={1.5} />
        </div>
      )}
      <h3 className={styles.coupleName}>{detail.name}</h3>
      {birth && <div className={styles.coupleOrigin}>{birth}</div>}
      {parents && <p className={styles.coupleParents}>{parents}</p>}
    </div>
  );
}

export function CoupleBlock({ invitation }: CoupleBlockProps) {
  const detail = invitation.detail;
  return (
    <section className={styles.section} data-shared-block="couple">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>Kedua Mempelai</span>
        <h2 className={styles.sectionTitle}>Mempelai Bahagia</h2>
      </div>
      <div className={styles.coupleGrid}>
        <PersonCard
          value={detail?.groom}
          fallback="Mempelai Pria"
          legacyParents={detail?.groom_parents}
        />
        <div className={styles.coupleDivider}>
          <span>&amp;</span>
        </div>
        <PersonCard
          value={detail?.bride}
          fallback="Mempelai Wanita"
          legacyParents={detail?.bride_parents}
        />
      </div>
    </section>
  );
}
