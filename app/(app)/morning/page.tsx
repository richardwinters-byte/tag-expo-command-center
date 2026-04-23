import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { todayInVegas } from '@/lib/utils';
import { RegenerateButton } from './RegenerateButton';

export const dynamic = 'force-dynamic';

export default async function MorningPage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const today = todayInVegas();

  const { data: brief, error: briefError } = await supabase
    .from('morning_briefs')
    .select('*')
    .eq('brief_date', today)
    .maybeSingle();

  if (briefError) {
    // eslint-disable-next-line no-console
    console.error('[morning] fetch error', briefError);
  }

  return (
    <>
      <TopBar title="Morning Brief" subtitle={today} />
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8">
        {briefError && <div className="mb-4"><DataFetchError message="Couldn't load today's brief. If one exists, refreshing usually fixes it." /></div>}
        {me.role === 'admin' && (
          <div className="flex justify-end mb-4">
            <RegenerateButton date={today} />
          </div>
        )}
        {brief ? (
          <article className="card card-p prose-content">
            <MarkdownRender text={brief.content_markdown} />
          </article>
        ) : !briefError ? (
          <div className="card card-p text-center py-12">
            <p className="text-sm text-tag-cold mb-4">No brief compiled yet for today.</p>
            {me.role === 'admin' && <RegenerateButton date={today} />}
          </div>
        ) : null}
      </div>
    </>
  );
}

// Simple markdown renderer: headers, bullets, bold
function MarkdownRender({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1 text-sm my-2">
          {listBuffer.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={elements.length} className="text-2xl font-semibold mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={elements.length} className="text-sm uppercase tracking-wider font-semibold text-tag-700 mt-6 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('- ')) {
      listBuffer.push(line.slice(2));
    } else if (line.startsWith('**') && line.endsWith('**')) {
      flushList();
      elements.push(<div key={elements.length} className="font-semibold text-sm mt-3">{line.slice(2, -2)}</div>);
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      elements.push(<p key={elements.length} className="text-sm my-1" dangerouslySetInnerHTML={{ __html: renderInline(line) }} />);
    }
  }
  flushList();
  return <div>{elements}</div>;
}

function renderInline(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>');
}
