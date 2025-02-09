import ClientWrapper from './components/ClientWrapper';
import HomeContent from './components/HomeContent';
import { AIServicesProvider } from './contexts/AIServicesContext';

export default function Home() {
  return (
    <ClientWrapper>
      <AIServicesProvider>
        <HomeContent />
      </AIServicesProvider>
    </ClientWrapper>
  );
} 