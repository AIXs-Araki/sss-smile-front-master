import React from 'react';
import type { AlertStatus } from '@hitsuji/core/types/UserCard';
import { BellIcon2 } from '@/assets/icons/Bell';
import { toAlertText } from '@core/types/UserCard';

type AlertType = 'error' | 'warning';

const alertStyles = {
  error: {
    container: 'bg-red-100 border-red-500',
    text: 'text-red-800',
    button: 'text-red-600 hover:bg-red-200 focus:ring-red-500',
  },
  warning: {
    container: 'bg-yellow-100 border-yellow-500',
    text: 'text-yellow-800',
    button: 'text-yellow-600 hover:bg-yellow-200 focus:ring-yellow-500',
  },
};

interface AlertBannerProps {
  alertStatus: AlertStatus;
  type?: AlertType;
  onDismiss: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  alertStatus,
  type = 'error',
  onDismiss,
}) => {
  const styles = alertStyles[type];
  const alertText = toAlertText(alertStatus)
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-around p-3 border shadow-sm shadow-red-400 rounded-md  ${styles.button} ${styles.container}`}
      role="alert"
      onClick={onDismiss}
    >
      <div>
        <p className={`font-bold ${styles.text}`}>{alertText}</p>
      </div>

      <div
        className={`p-0 relative transition-colors duration-200 rounded-full focus:outline-none`}
        style={{ bottom: 3 }}
        aria-label="アラートを解除"
      >
        <BellIcon2 />
      </div>
    </button>
  );
};


export default AlertBanner;
