package com.reactnativeesp

import android.Manifest
import android.content.pm.PackageManager
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.ScanResult
import androidx.core.app.ActivityCompat
import android.util.Log
import com.espressif.provisioning.ESPConstants
import com.espressif.provisioning.ESPDevice

import com.espressif.provisioning.ESPProvisionManager
import com.espressif.provisioning.WiFiAccessPoint
import com.espressif.provisioning.listeners.BleScanListener
import com.espressif.provisioning.listeners.ProvisionListener
import com.espressif.provisioning.listeners.WiFiScanListener
import com.facebook.react.bridge.*
import com.facebook.react.bridge.WritableNativeArray

import com.facebook.react.bridge.WritableArray

class EspModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    val foundBLEDevices = HashMap<String, BluetoothDevice>();

    override fun getName(): String {
        return "Esp"
    }

    @ReactMethod
    fun scanBleDevices(prefix: String, promise: Promise) {
      Log.e("ESPProvisioning", "getBleDevices")

      // TODO: CHECK IF I NEED ALSO TO CHECK ANDROID 12 AND DIFFERENT VERSIONS
      if (ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        promise.reject("500","Location Permission denied")
        return;
      }

      // Search for BLE devices
      ESPProvisionManager.getInstance(reactApplicationContext).searchBleEspDevices(prefix, object : BleScanListener {
        override fun scanStartFailed() {
          promise.reject("500", "Scan start failed")
        }

        override fun onPeripheralFound(device: BluetoothDevice, scanResult: ScanResult) {
          foundBLEDevices[device.address] = device;
        }

        override fun scanCompleted() {
          val result = WritableNativeArray();

          foundBLEDevices.keys.forEach {
            val device: WritableMap = Arguments.createMap();
            val array: WritableArray = WritableNativeArray();

            foundBLEDevices[it]?.uuids?.forEach { itUuid ->
              array.pushString(itUuid.uuid.toString());
            }

            device.putString("address", it);
            device.putString("name", foundBLEDevices[it]?.name);
            device.putArray("uuids", array);
            result.pushMap(device)
          }

          // Return found BLE devices
          promise.resolve(result);
        }

        override fun onFailure(p0: Exception?) {
          promise.reject("500",p0.toString())
        }
      });
    }

    @ReactMethod
    fun connectToDevice(deviceAddress: String, deviceProofOfPossession: String, mainUUID: String, promise: Promise) {
      Log.e("ESPProvisioning", "connectBleDevice")

      // TODO: CHECK IF I NEED ALSO TO CHECK ANDROID 12 AND DIFFERENT VERSIONS
      if (ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        promise.reject("500","Not enough permissions");
        return;
      }

      val esp : ESPDevice = ESPProvisionManager.getInstance(reactApplicationContext).createESPDevice(ESPConstants.TransportType.TRANSPORT_BLE, ESPConstants.SecurityType.SECURITY_0);
      esp.proofOfPossession = deviceProofOfPossession


      val device = foundBLEDevices[deviceAddress]
      if (device == null) {
        promise.reject("500","Device not found, invalid $deviceAddress")
        return;
      }

      esp.connectBLEDevice(device, mainUUID);

      promise.resolve("Connection success");
    }

    @ReactMethod
    fun scanWifiList(promise: Promise) {
      val device = ESPProvisionManager.getInstance(reactApplicationContext).espDevice

      if(device == null) {
        promise.reject("No device found")
        return;
      }

      device.scanNetworks(object: WiFiScanListener {
        override fun onWifiListReceived(wifiList: java.util.ArrayList<WiFiAccessPoint>?) {
          val result = WritableNativeArray();
          wifiList?.forEach {
            val network: WritableMap = Arguments.createMap();
            network.putString("name", it.wifiName);
            network.putInt("rssi", it.rssi);
            network.putInt("security", it.security);

            result.pushMap(network)
          }
          promise.resolve(result)
        }

        override fun onWiFiScanFailed(p0: java.lang.Exception?) {
          promise.reject("Failed to get Wi-Fi scan list")
        }
      })
    }

    @ReactMethod
    fun provision(ssid: String, password: String, promise: Promise) {
      val device = ESPProvisionManager.getInstance(reactApplicationContext).espDevice
      device?.provision(ssid, password, object: ProvisionListener {
        override fun wifiConfigApplyFailed(p0: Exception?) {
          Log.e("ESPProvisioning", "provision-wifiConfigApplyFailed");
          promise.reject("500",p0.toString())
        }

        override fun wifiConfigApplied() {
          Log.e("ESPProvisioning", "provision-wifiConfigApplied");
        }

        override fun onProvisioningFailed(p0: Exception?) {
          Log.e("ESPProvisioning", "provision-onProvisioningFailed");
          promise.reject("500",p0.toString())
        }

        override fun deviceProvisioningSuccess() {
          Log.e("ESPProvisioning", "provision-deviceProvisioningSuccess");
          promise.resolve("Connection success")
        }

        override fun createSessionFailed(p0: Exception?) {
          Log.e("ESPProvisioning", "provision-createSessionFailed");
          promise.reject("500",p0.toString())
        }

        override fun wifiConfigFailed(p0: Exception?) {
          Log.e("ESPProvisioning", "provision-wifiConfigFailed");
          promise.reject("500",p0.toString())
        }

        override fun provisioningFailedFromDevice(p0: ESPConstants.ProvisionFailureReason?) {
          Log.e("ESPProvisioning", "provision-provisioningFailedFromDevice");
          promise.reject("500",p0.toString())
        }

        override fun wifiConfigSent() {
          Log.e("ESPProvisioning", "provision-wifiConfigSent");
        }
      })
    }


}
