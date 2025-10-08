import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRewardQueue } from './useRewardQueue';
import type { InventoryItem } from '@/lib/gameLogic';

export const useInventory = (
  sessionCode: string | null,
  currentInventory: InventoryItem[]
) => {
  const { addReward } = useRewardQueue();

  // Ajouter un item à l'inventaire
  const addItem = useCallback(async (item: InventoryItem) => {
    if (!sessionCode) return;

    try {
      // Vérifier que l'item n'existe pas déjà
      if (currentInventory.some(i => i.id === item.id)) {
        console.log('Item already in inventory');
        return;
      }

      const newInventory = [...currentInventory, item];

      await supabase
        .from('sessions')
        .update({ inventory: newInventory as any })
        .eq('code', sessionCode);
      
      // Ajouter à la file d'attente des récompenses
      addReward({
        type: 'item',
        title: item.name,
        description: item.description,
        icon: item.icon
      });
    } catch (err) {
      console.error('Error adding item to inventory:', err);
    }
  }, [sessionCode, currentInventory]);

  // Retirer un item de l'inventaire
  const removeItem = useCallback(async (itemId: string) => {
    if (!sessionCode) return;

    try {
      const newInventory = currentInventory.filter(i => i.id !== itemId);

      await supabase
        .from('sessions')
        .update({ inventory: newInventory as any })
        .eq('code', sessionCode);
    } catch (err) {
      console.error('Error removing item from inventory:', err);
    }
  }, [sessionCode, currentInventory]);

  // Vérifier si un item est dans l'inventaire
  const hasItem = useCallback((itemId: string): boolean => {
    return currentInventory.some(i => i.id === itemId);
  }, [currentInventory]);

  return {
    addItem,
    removeItem,
    hasItem,
  };
};
