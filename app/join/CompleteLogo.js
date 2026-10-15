import s from './complete-logo.module.css';
// Exact authorized raster; the viewport excludes only its blank outer margins.
export default function CompleteLogo({className=''}) {
 return <svg className={`${s.logo} ${className}`} viewBox="230 295 1100 430" role="img" aria-label="INFIXO — Apno Se Judne Ka Naya Tarika"><image href="/images/infixo-complete-logo.png" x="0" y="0" width="1536" height="1024"/></svg>;
}
