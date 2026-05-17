import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getTopicById, topics } from '../data/topics';

export function Topic() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = Number(params.id);
  const topic = getTopicById(id);
  if (!topic) {
    return (
      <div className="space-y-4">
        <p>Thema nicht gefunden.</p>
        <Link to="/" className="btn-secondary">
          Zur Uebersicht
        </Link>
      </div>
    );
  }

  const nextId = id + 1;
  const hasNext = topics.some((t) => t.id === nextId);

  return (
    <article className="space-y-5">
      <p className="text-xs uppercase tracking-wider text-kjg-primary font-semibold">
        Thema {topic.id} von {topics.length}
      </p>
      <h1 className="text-2xl font-bold">{topic.title}</h1>
      <p className="text-slate-600">{topic.subtitle}</p>

      <div className="prose-content card space-y-3 text-slate-800 leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mt-3">{children}</h3>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1">{children}</ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-kjg-primary/60 bg-slate-50 px-3 py-2 italic text-sm">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border-b border-slate-300 px-2 py-1 text-left font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-slate-200 px-2 py-1">{children}</td>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900">{children}</strong>
            ),
          }}
        >
          {topic.summary}
        </ReactMarkdown>
      </div>

      <p className="text-xs text-slate-500">
        Quelle: BW-Leitfaden Januar 2025, Seite {topic.sources.join(', ')}.
      </p>

      <nav className="flex gap-2">
        <Link to="/" className="btn-secondary flex-1">
          Zur Uebersicht
        </Link>
        {hasNext ? (
          <button
            type="button"
            onClick={() => navigate(`/topics/${nextId}`)}
            className="btn-primary flex-1"
          >
            Weiter
          </button>
        ) : (
          <Link to="/quiz/start" className="btn-primary flex-1">
            Quiz starten
          </Link>
        )}
      </nav>
    </article>
  );
}
