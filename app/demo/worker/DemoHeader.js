import styles from "../../components/Header/Header.module.css";
import CompleteLogo from '../../join/CompleteLogo';
import s from './demo.module.css';
export default function Header() {
 return <header className={styles.header}><CompleteLogo className={s.completeLogo}/></header>;
}
