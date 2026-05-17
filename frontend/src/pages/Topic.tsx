import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getTopicById, topics } from '../data/topics';
import { TopBar } from '../components/TopBar';
import { Icon, type IconName } from '../components/Icon';

const SECTION_ICONS: Record<number, IconName> = {
  1: 'HandHeart',
  2: 'ClipboardList',
  3: 'Thermometer',
  4: 'UtensilsCrossed',
  5: 'Hand',
  6: 'CupSoda',
  7: 'Trash2',
};

export function Topic() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = Number(params.id);
  const topic = getTopicById(id);

  if (!topic) {
    return (
      <div className="screen">
        <div className="learn-body">
          <p className="text-slate-700">Thema nicht gefunden.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-ghost btn-block"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  const total = topics.length;
  const hasNext = id < total;
  const iconName = SECTION_ICONS[id] ?? 'ClipboardList';

  function onPrev() {
    if (id > 1) {
      navigate(`/learn/${id - 1}`);
    } else {
      navigate('/start');
    }
  }

  function onNext() {
    if (hasNext) {
      navigate(`/learn/${id + 1}`);
    } else {
      navigate('/quiz');
    }
  }

  return (
    <div className="screen" key={topic.id}>
      <TopBar
        label={`${topic.id} / ${total}`}
        progress={topic.id / (total + 1)}
        onBack={onPrev}
        showBack
      />
      <article className="learn-body">
        <div className="learn-icon-chip">
          <Icon name={iconName} size={28} />
        </div>
        <div className="learn-eyebrow eyebrow">
          Thema {topic.id} von {total}
        </div>
        <h2 className="learn-title">{topic.title}</h2>
        <p className="learn-lead">{topic.subtitle}</p>

        <div className="text-slate-800 leading-relaxed flex flex-col gap-3">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h3: ({ children }) => (
                <h3 className="subsection-title mt-2">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="bullet-list">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="bullet">
                  <span className="bullet-dot" aria-hidden>
                    <Icon name="Check" size={14} strokeWidth={3} />
                  </span>
                  <span>{children}</span>
                </li>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 text-[15px] text-slate-700">
                  {children}
                </ol>
              ),
              blockquote: ({ children }) => (
                <div className="note">
                  <Icon name="Lightbulb" size={18} />
                  <span>{children}</span>
                </div>
              ),
              table: ({ children }) => (
                <div className="subsection overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-slate-300 px-2 py-1 text-left font-semibold text-slate-900">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-slate-100 px-2 py-1 text-slate-700">
                  {children}
                </td>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-slate-900">
                  {children}
                </strong>
              ),
              p: ({ children }) => (
                <p className="text-slate-700 leading-relaxed text-[15px] m-0">
                  {children}
                </p>
              ),
            }}
          >
            {topic.summary}
          </ReactMarkdown>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Quelle: BW-Leitfaden Januar 2025, Seite {topic.sources.join(', ')}.
        </p>
      </article>
      <div className="cta-wrap">
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary btn-block"
        >
          {hasNext ? 'Verstanden, weiter' : 'Zum Quiz'}
          <Icon name="ArrowRight" size={20} />
        </button>
      </div>
    </div>
  );
}
