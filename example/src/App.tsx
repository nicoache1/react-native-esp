import {
  StyleSheet,
  View,
  Text,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import {
  scanBleDevices,
  connectToDevice,
  scanWifiList,
  BleDevices,
  WifiDevices,
} from 'react-native-esp';
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
  scanButton: {
    height: 70,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'gray',
    justifyContent: 'center',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
});

export default function App() {
  const [foundDevices, setFoundDevices] = useState<BleDevices[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<
    BleDevices | undefined
  >(undefined);
  const [wifiList, setWifiList] = useState<WifiDevices[]>([]);

  useEffect(() => {
    async function getBleDevices() {
      console.log('GetBLEDevices: Start');
      // TODO: ANDROID 12
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
  const existWifi = wifiList.length !== 0;

  const onPressDevice = (item: any) => async () => {
    try {
      const result = await connectToDevice(item.address, 'abcd1234');
      Alert.alert(`Connected to ${item.name} - with result: ${result}`);
      setConnectedDevice(item);
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  };

  const onPressScan = async () => {
    try {
      const result = await scanWifiList();
      Alert.alert(`Scanned ${result.length} networks`);
      setWifiList(result);
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  };

  return (
    <View style={styles.container}>
      {!existDevices && <Text>No devices found</Text>}
      {connectedDevice && (
        <Pressable style={styles.scanButton} onPress={onPressScan}>
          <Text>Scan Wifi List</Text>
        </Pressable>
      )}
      {existDevices &&
        foundDevices.map((item) => (
          <Pressable style={styles.item} onPress={onPressDevice(item)}>
            <Text>{`Name - ${item.name}`}</Text>
            <Text>{`Address - ${item.address}`}</Text>
          </Pressable>
        ))}
      <View style={styles.separator} />
      {existWifi &&
        wifiList.map((item) => (
          <Pressable style={styles.item} onPress={onPressDevice(item)}>
            <Text>{item.name}</Text>
            <Text>{item.rssi}</Text>
            <Text>{item.security}</Text>
          </Pressable>
        ))}
    </View>
  );
}
