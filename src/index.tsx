import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-esp' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const Esp = NativeModules.Esp
  ? NativeModules.Esp
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export enum ResultOfOperation {
  SUCCESS = 'Connection success',
}

export interface BleDevices {
  name: string;
  address: string;
  uuids: string[];
}

export interface WifiDevices {
  name: string;
  rssi: number;
  security: number;
}

/**
 * Scan for ESP devices with BLE
 * @param prefix prefix of the device/s name to search.
 * @returns an array of devices
 */
export const scanBleDevices = async (
  prefix?: string
): Promise<BleDevices[]> => {
  const result = await Esp.scanBleDevices(prefix);
  return result;
};

/**
 * Connect to a ESP device via BLE
 * @param deviceAddress address of the device to connect
 * @param deviceProofOfPossession proof of possession of the device for security reasons
 * @param mainServiceUUID only required in Android
 * @returns result of the connection
 */
export const connectToDevice = async (
  deviceAddress: String,
  deviceProofOfPossession: String,
  mainServiceUUID?: String
): Promise<boolean> => {
  let result;
  if (Platform.OS === 'ios') {
    result = await Esp.connectToDevice(deviceAddress, deviceProofOfPossession);
  } else {
    result = await Esp.connectToDevice(
      deviceAddress,
      deviceProofOfPossession,
      mainServiceUUID
    );
  }
  return result === ResultOfOperation.SUCCESS;
};

/**
 * ESP Device perform a WIFI scan of nearby devices an returns the list.
 * @returns an array of nearby wifi devices
 */
export const scanWifiList = async (): Promise<WifiDevices[]> => {
  const result = await Esp.scanWifiList();
  return result;
};

/**
 * Make the provisioning process with a device
 * @param ssid the ssid of the network to connect
 * @param passPhrase password of the network to connect
 * @returns result of the operation
 */
export const provisionDevice = async (
  ssid: String,
  passPhrase: String
): Promise<boolean> => {
  const result = await Esp.provision(ssid, passPhrase);
  return result === ResultOfOperation.SUCCESS;
};
