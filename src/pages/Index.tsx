import { useParams } from 'react-router-dom';
import Home from './Home';

const Index = () => {
  const { sessionCode } = useParams();

  if (!sessionCode) {
    return <Home />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">NEMESIS - Game Loading...</h1>
        <p className="text-xl text-muted-foreground">Session: {sessionCode}</p>
        <p className="text-sm text-muted-foreground mt-4">Zone de jeu en construction</p>
      </div>
    </div>
  );
};

export default Index;
