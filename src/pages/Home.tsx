import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useGameSession } from '@/hooks/useGameSession';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [pseudo, setPseudo] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { createSession, joinSession } = useGameSession(null);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!pseudo.trim()) return;
    
    setIsCreating(true);
    try {
      const { code, player } = await createSession(pseudo);
      localStorage.setItem('nemesis_session', JSON.stringify({ code, pseudo, playerId: player.id }));
      navigate(`/game/${code}`);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de créer la session", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!pseudo.trim() || !joinCode.trim()) return;
    
    setIsJoining(true);
    try {
      const { session, player } = await joinSession(joinCode.toUpperCase(), pseudo);
      localStorage.setItem('nemesis_session', JSON.stringify({ code: session.code, pseudo, playerId: player.id }));
      navigate(`/game/${session.code}`);
    } catch (err) {
      toast({ title: "Erreur", description: "Session introuvable ou pseudo déjà pris", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary animate-fade-in" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            NEMESIS
          </h1>
          <p className="text-2xl text-muted-foreground">Le Dernier Vaccin</p>
        </div>

        <div className="p-6 bg-background/50 backdrop-blur-md rounded-lg border-2 border-primary/50 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Une fuite virale catastrophique s'est produite dans l'installation NEMESIS. 
            Le Dr Morel a disparu, laissant derrière lui les fragments d'une formule capable 
            de neutraliser le virus. Vous avez <span className="text-primary font-bold">60 minutes</span> pour 
            reconstituer le vaccin avant que le système de confinement ne soit compromis définitivement.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="text-lg px-8">Créer une session</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="create-pseudo">Votre pseudo</Label>
                  <Input id="create-pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Entrez votre nom" />
                </div>
                <Button onClick={handleCreate} disabled={isCreating} className="w-full">
                  {isCreating ? 'Création...' : 'Commencer la mission'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="text-lg px-8">Rejoindre une session</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rejoindre une session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="join-code">Code de session</Label>
                  <Input id="join-code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="ABC123" className="font-mono uppercase" />
                </div>
                <div>
                  <Label htmlFor="join-pseudo">Votre pseudo</Label>
                  <Input id="join-pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Entrez votre nom" />
                </div>
                <Button onClick={handleJoin} disabled={isJoining} className="w-full">
                  {isJoining ? 'Connexion...' : 'Rejoindre'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Home;
