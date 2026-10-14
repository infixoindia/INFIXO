import JoinPage from './JoinPage';
export const metadata = {
 title: 'INFIXO | Indore mein apni professional profile banwayein',
 description: 'Indore ke Painter, Plumber, Electrician, Technician aur Pandit ke liye professional digital identity. FREE aur PRO profile plans.',
};
export default function Page() { return <JoinPage serverNow={Date.now()} />; }
export const dynamic = 'force-dynamic';
