import type { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  try {
    const res = await fetch(`${apiUrl}/invitations/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        title: 'Undangan Pernikahan Digital',
        description: 'Undangan pernikahan digital online elegan dan eksklusif.',
      };
    }

    const data = await res.json();
    const invitation = data?.data;
    if (!invitation) {
      return {
        title: 'Undangan Pernikahan Digital',
        description: 'Undangan pernikahan digital online elegan dan eksklusif.',
      };
    }

    const groom =
      typeof invitation.detail?.groom === 'object'
        ? invitation.detail.groom.name
        : invitation.detail?.groom || 'Mempelai Pria';

    const bride =
      typeof invitation.detail?.bride === 'object'
        ? invitation.detail.bride.name
        : invitation.detail?.bride || 'Mempelai Wanita';

    const groomPhoto =
      typeof invitation.detail?.groom === 'object' ? invitation.detail.groom.photo : null;

    const bridePhoto =
      typeof invitation.detail?.bride === 'object' ? invitation.detail.bride.photo : null;

    const coverPhoto = invitation.detail?.gallery?.photos?.[0] || groomPhoto || bridePhoto;

    const eventDateStr = invitation.event_date
      ? new Date(invitation.event_date).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

    const title = `Pernikahan ${groom} & ${bride} | Undangan Digital`;
    const description = `Kami mengundang Anda untuk menghadiri pernikahan ${groom} & ${bride}${eventDateStr ? ` pada hari ${eventDateStr}` : ''}. Buka undangan digital untuk rincian jadwal, lokasi, dan konfirmasi kehadiran.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        ...(coverPhoto
          ? { images: [{ url: coverPhoto, width: 1200, height: 630, alt: title }] }
          : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(coverPhoto ? { images: [coverPhoto] } : {}),
      },
    };
  } catch {
    return {
      title: 'Undangan Pernikahan Digital',
      description: 'Undangan pernikahan digital online elegan dan eksklusif.',
    };
  }
}

export default function InvitationSlugLayout({ children }: LayoutProps) {
  return children;
}
