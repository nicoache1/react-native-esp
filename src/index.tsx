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

export const scanBleDevices = async (prefix?: string): Promise<any[]> => {
  const result = await Esp.scanBleDevices(prefix);
  return result;
};

export const connectToDevice = async (
  deviceAddress: String,
  deviceProofOfPossession: String,
  mainServiceUUID?: String
): Promise<any[]> => {
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
  return result;
};

export const scanWifiList = async (): Promise<any[]> => {
  const result = await Esp.scanWifiList();
  return result;
};

export const provisionDevice = async (
  ssid: String,
  passPhrase: String
): Promise<any[]> => {
  const result = await Esp.provision(ssid, passPhrase);
  return result;
};
