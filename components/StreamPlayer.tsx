interface StreamPlayerProps {
  youtubeUrl: string | null;
  searchUrl: string;
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const v = u.searchParams.get('v') ?? u.pathname.split('/').pop();
    if (!v) return null;
    return `https://www.youtube.com/embed/${v}?autoplay=1&mute=1`;
  } catch {
    return null;
  }
}

export default function StreamPlayer({ youtubeUrl, searchUrl }: StreamPlayerProps) {
  const embedUrl = youtubeUrl ? getEmbedUrl(youtubeUrl) : null;

  if (embedUrl) {
    return (
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full rounded-xl"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Cricket Live Stream"
        />
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-xl flex flex-col items-center justify-center gap-4 py-16"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-4xl">🏏</p>
      <p style={{ color: 'var(--muted)' }}>No stream linked for this match</p>
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ backgroundColor: 'var(--accent)', color: '#000' }}
      >
        Search on YouTube
      </a>
    </div>
  );
}
