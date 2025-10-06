import { createContext, useContext, useState, type ReactNode } from 'react';

interface PendingRoom {
  roomId: string;
  groupNumber: number;
}

interface PushNotificationContextType {
  pendingRoom: PendingRoom | null;
  setPendingRoom: (room: PendingRoom | null) => void;
  closeDrawer: (() => void) | null;
  setCloseDrawer: (closeDrawer: (() => void) | null) => void;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

export const PushNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [pendingRoom, setPendingRoom] = useState<PendingRoom | null>(null);
  const [closeDrawer, setCloseDrawer] = useState<(() => void) | null>(null);

  console.log('PushNotificationProvider rendered, pendingRoom:', pendingRoom);

  return (
    <PushNotificationContext.Provider value={{
      pendingRoom,
      setPendingRoom,
      closeDrawer,
      setCloseDrawer
    }}>
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotificationContext = () => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotificationContext must be used within a PushNotificationProvider');
  }
  return context;
};