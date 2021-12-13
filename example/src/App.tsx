import { StyleSheet, View, Text, Platform } from 'react-native';
import { scanBleDevices } from 'react-native-esp';
import React, { useEffect, useState } from 'react';
import { request, PERMISSIONS } from 'react-native-permissions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    height: 70,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: 'black',
    borderBottomWidth: 0.5,
    justifyContent: 'center',
  },
});

export default function App() {
  const [foundDevices, setFoundDevices] = useState<any[]>([]);

  useEffect(() => {
    async function getBleDevices() {
      console.log('GetBLEDevices: Start');
      if (Platform.OS === 'android') {
        await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      } else {
        await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      }

      try {
        const devices = await scanBleDevices('EKG');
        if (devices.length > 0) {
          setFoundDevices(devices);
        } else {
          console.log('GetBLEDevices: No devices found');
        }
      } catch (error) {
        console.log('GetBLEDevices: ' + error);
      }
    }

    getBleDevices();
  }, []);

  const existDevices = foundDevices.length !== 0;

  return (
    <View style={styles.container}>
      {!existDevices && <Text>No devices found</Text>}
      {existDevices &&
        foundDevices.map((item) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
          </View>
        ))}
    </View>
  );
}
