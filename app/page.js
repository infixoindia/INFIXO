import NavigationTabs from './components/NavigationTabs/NavigationTabs';
import Header from './components/Header/Header';
import WorkerIdentityCard from './components/WorkerIdentityCard/WorkerIdentityCard';
import dummyWorker from './data/dummyWorker';

export default function HomePage() {
  return (
    <main>
      <Header />
      <div style={{ padding: '2rem 1rem' }}>
       
  <WorkerIdentityCard worker={dummyWorker} />
  <NavigationTabs />
      </div>
    </main>
  );
}
