import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function Home() {
  return (
    <div className="screen ob-hero">
      <div className="ob-hero-bg" />
      <div className="ob-hero-content">
        <img
          src="/kjg-logo-white.png"
          alt="KjG Pfaffenweiler"
          className="h-14 w-auto self-start opacity-95"
        />
        <div className="ob-eyebrow">Hygiene-Schulung</div>
        <h1 className="ob-title">Bevor's losgeht.</h1>
        <p className="ob-lede">
          Kurze Pflicht-Belehrung fürs <strong>Dorffest 2026</strong>. Dauert etwa
          10 Minuten. Am Ende gibt's ein Quiz und ein Zertifikat — ohne das geht
          nichts am Stand.
        </p>
        <div className="ob-meta">
          <div className="ob-meta-row">
            <span className="ob-meta-key">Veranstaltung</span>
            <span className="ob-meta-val">Dorffest Pfaffenweiler</span>
          </div>
          <div className="ob-meta-row">
            <span className="ob-meta-key">Datum</span>
            <span className="ob-meta-val">20.–21. Juni 2026</span>
          </div>
          <div className="ob-meta-row">
            <span className="ob-meta-key">Bereich</span>
            <span className="ob-meta-val">Speisen- &amp; Getränkeverkauf</span>
          </div>
        </div>
      </div>
      <div className="cta-wrap cta-wrap-dark relative z-[1]">
        <Link to="/start" className="btn btn-primary btn-block">
          Los geht&apos;s
          <Icon name="ArrowRight" size={20} />
        </Link>
      </div>
    </div>
  );
}
