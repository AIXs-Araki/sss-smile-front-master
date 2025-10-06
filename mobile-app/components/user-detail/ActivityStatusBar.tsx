import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Alert {
  id: string | number;
  startTime: Date;
  endTime: Date;
  type: BedStatus;
}

type BedStatus = 'bedexit' | 'moving' | 'resting' | 'offline';

interface StatusBarProps {
  alerts: Alert[];
  currentTime: Date;
  displayDate?: Date;
  showMarker?: boolean;
  showTimeMarkers?: boolean;
  width?: number;
}

const ALERT_COLOR_MAP: Record<BedStatus, string> = {
  bedexit: '#d1d5db',
  moving: '#fb923c',
  resting: '#60a5fa',
  offline: '#ffffff'
};

const ActivityStatusBar: React.FC<StatusBarProps> = ({
  alerts,
  currentTime,
  displayDate,
  showMarker = false,
  showTimeMarkers = false,
  width = 300,
}) => {
  const [actualWidth, setActualWidth] = React.useState(width);

  const oneHour = 60 * 60 * 1000;

  const { windowStartTime, windowEndTime, totalDuration } = (() => {

    const endTime = currentTime.getTime();
    return {
      windowStartTime: endTime - oneHour,
      windowEndTime: endTime,
      totalDuration: oneHour,
    };
  })();

  const visibleAlerts = alerts
    .map((alert) => {
      const alertStart = alert.startTime.getTime();
      const alertEnd = alert.endTime.getTime();

      if (alertStart > windowEndTime || alertEnd < windowStartTime) {
        return null;
      }

      const left = ((Math.max(alertStart, windowStartTime) - windowStartTime) / totalDuration) * 100;
      const right = ((Math.min(alertEnd, windowEndTime) - windowStartTime) / totalDuration) * 100;
      const width = right - left;

      return {
        id: alert.id,
        left: left,
        width: width,
        type: alert.type,
        color: ALERT_COLOR_MAP[alert.type],
      };
    })
    .filter(Boolean);

  const timeMarkers = getTimeMarkers(false, currentTime, windowStartTime, windowEndTime);
  console.log(width)

  return (
    <View style={styles.container}>
      <View
        style={styles.statusBar}
        onLayout={(event) => {
          const { width: layoutWidth } = event.nativeEvent.layout;
          setActualWidth(layoutWidth);
        }}
      >
        {visibleAlerts.map(
          (alert) =>
            alert && (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertBar,
                  {
                    left: (alert.left / 100) * actualWidth,
                    width: (alert.width / 100) * actualWidth,
                    backgroundColor: alert.color,
                  },
                ]}
              >
                {showMarker && (alert.type === 'bedexit' || alert.type === 'moving') && (
                  <View style={[styles.triangle, { borderTopColor: alert.color }]} />
                )}
              </TouchableOpacity>
            ),
        )}
      </View>

      {showTimeMarkers && (
        <View style={styles.timeMarkersContainer}>
          {timeMarkers.map(marker => (
            <View
              key={marker.label}
              style={[styles.timeMarker, { left: (parseFloat(marker.position) / 100) * actualWidth }]}
            >
              <Text style={styles.markerTick}>|</Text>
              <Text style={styles.markerLabel}>{marker.label}</Text>
            </View>
          ))}
        </View>
      )}

    </View>
  );
};
const Triangle: React.FC<{ color: string }> = ({ color }) => (
  <View style={[styles.triangle, { borderTopColor: color }]} />
);

const getTimeMarkers = (isDailyMode: boolean, date: Date, windowStartTime?: number, windowEndTime?: number) => {
  if (isDailyMode) {
    const markers = [];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    for (let i = 0; i <= 24; i++) {
      if (i % 3 === 0) {
        const markerTime = new Date(startOfDay.getTime() + i * 60 * 60 * 1000);
        const position = (i / 24) * 100;
        markers.push({
          label: markerTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          position: `${position}%`,
        });
      }
    }
    return markers;
  }

  const markers = [];
  const startTime = windowStartTime || (date.getTime() - 60 * 60 * 1000);
  const endTime = windowEndTime || date.getTime();
  const duration = endTime - startTime;

  // 15分間隔でマーカーを作成
  const startMarkerTime = new Date(startTime);
  startMarkerTime.setMinutes(Math.ceil(startMarkerTime.getMinutes() / 15) * 15, 0, 0);

  let currentMarkerTime = startMarkerTime.getTime();
  while (currentMarkerTime <= endTime) {
    if (currentMarkerTime >= startTime) {
      const position = ((currentMarkerTime - startTime) / duration) * 100;
      markers.push({
        label: new Date(currentMarkerTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        position: `${position}%`,
      });
    }
    currentMarkerTime += 15 * 60 * 1000; // 15分追加
  }
  return markers;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 8,
  },
  statusBar: {
    position: 'relative',
    height: 20,
    width: '100%',
    backgroundColor: '#60a5fa',
  },
  alertBar: {
    position: 'absolute',
    height: '100%',
  },
  triangle: {
    position: 'absolute',
    top: -10,
    left: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  futureOverlay: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  timeMarkersContainer: {
    position: 'relative',
    height: 32,
    width: '100%',
    marginTop: 4,
  },
  timeMarker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -12 }],
  },
  markerTick: {
    fontSize: 6,
    color: '#6b7280',
    marginBottom: 2,
  },
  markerLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popover: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  popoverTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  popoverTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default ActivityStatusBar;