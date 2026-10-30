import type { Invitation, InvitationDetail, UserTemplate } from '@/types';

export type PreviewFormInput = {
  groom?: string;
  bride?: string;
  date?: string;
};

const PREVIEW_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
];

/** Builds a complete, non-persisted invitation for editor preview only. */
export function createPreviewInvitation(input: PreviewFormInput): Partial<Invitation> {
  const eventDate = input.date || '2027-01-01';
  const detail: InvitationDetail = {
    groom: {
      name: input.groom || 'Budi Santoso',
      place_of_birth: 'Bogor',
      birth_date: '20 Januari 1996',
      parent: 'Slamet dan Ningsih',
    },
    bride: {
      name: input.bride || 'Ani Wijaya',
      place_of_birth: 'Jakarta',
      birth_date: '12 Mei 1997',
      parent: 'Hendra dan Siti',
    },
    quotes: {
      quote: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan untukmu.',
      attribution: 'QS. Ar-Rum: 21',
    },
    wedding_event: [
      {
        name: 'Akad Nikah',
        date: eventDate,
        time: '08:00 - 10:00 WIB',
        place: 'Masjid Raya Al-Bina',
        address: 'Jl. Pintu Satu Senayan, Jakarta',
        maps_url: 'https://maps.google.com',
      },
      {
        name: 'Resepsi Pernikahan',
        date: eventDate,
        time: '19:00 - 22:00 WIB',
        place: 'Grand Ballroom',
        address: 'Jakarta Convention Center',
        maps_url: 'https://maps.google.com',
      },
    ],
    love_story: {
      title: 'Kisah Cinta',
      story: 'Semoga perjalanan kami menjadi awal dari keluarga yang penuh kasih dan keberkahan.',
    },
    gallery: { photos: PREVIEW_PHOTOS },
    wedding_gift: [{ platform: 'Bank BCA', name: 'Budi Santoso', id: '8830192841' }],
    music: 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-562.mp3',
    streaming_platform: 'https://youtube.com/live',
  };
  return { event_date: eventDate, detail };
}

export function templateToTheme(template?: UserTemplate['template']) {
  return template?.theme_config || null;
}
