import ESPProvision

class EspDevice {
    static let shared = EspDevice()
    var espDevice: ESPDevice?
    func setDevice(device: ESPDevice) {
        self.espDevice = device
    }
}

class ErrorMessages {
    static let DEVICE_NOT_FOUND = "Device not found";
    static let NOT_FOUND_DEVICES = "No devices found";
    static let DEFAULT_CONNECTION_ERROR = "Default connection error";

    static func getLocalizedError(domain: String, code: Int, message: String) -> NSError {
        let error = NSError(domain: domain, code: code, userInfo: [NSLocalizedDescriptionKey : message])
        return error
    }

}

@objc(Esp)
class Esp: NSObject {

    @objc(scanBleDevices:withResolver:withRejecter:)
    func scanBleDevices(prefix: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {

        let errorCode = 404
        let errorDomain = "scanBleDevices"

        ESPProvisionManager.shared.searchESPDevices(devicePrefix:prefix, transport:.ble) { bleDevices, _ in
            DispatchQueue.main.async {
                if bleDevices == nil {

                    reject("\(errorCode)", errorDomain, ErrorMessages.getLocalizedError(domain: errorDomain, code: errorCode, message: ErrorMessages.NOT_FOUND_DEVICES))

                    return
                }

                let deviceNames = bleDevices!.map({[
                    "name": $0.name,
                    "address": $0.name,
                    "uuids": []
                ]})

                resolve(deviceNames)
            }
        }
    }

    @objc(connectToDevice:deviceProofOfPossession:withResolver:withRejecter:)
    func connectToDevice(deviceAddress: String, deviceProofOfPossession: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {

        let errorCode = 404
        let errorDomain = "connectToDevice"

        ESPProvisionManager.shared.createESPDevice(deviceName: deviceAddress, transport: .ble, security: .unsecure, proofOfPossession: deviceProofOfPossession, completionHandler: { device, _ in
            if device == nil {

                reject("\(errorCode)", errorDomain + "Device nil", ErrorMessages.getLocalizedError(domain: errorDomain, code: errorCode, message: ErrorMessages.DEVICE_NOT_FOUND))

                return
            }

            let espDevice: ESPDevice = device!
            EspDevice.shared.setDevice(device: espDevice)

            espDevice.connect(completionHandler: { status in

                switch status {
                case .connected:
                    resolve("Connection success")
                case let .failedToConnect(error):
                    reject("\(error.code)", error.description, error)
                default:
                    reject("\(errorCode)", errorDomain + "Common error", ErrorMessages.getLocalizedError(domain: errorDomain, code: errorCode, message: ErrorMessages.DEFAULT_CONNECTION_ERROR))
                }
            })
        })
    }

    @objc(scanWifiList:withRejecter:)
    func scanWifiList(resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        EspDevice.shared.espDevice?.scanWifiList{ wifiList, error in

            if error != nil {
                let errorCode = error?.code ?? 404
                let errorMessage = error?.description ?? "General error message"
                reject("\(errorCode)", errorMessage, error)

                return
            }

            let networks = wifiList!.map {[
                "name": $0.ssid,
                "rssi": $0.rssi,
                "security": $0.auth.rawValue,
            ]}

            resolve(networks)
        }
    }

    @objc(provision:passPhrase:withResolver:withRejecter:)
    func provision(ssid: String, passPhrase: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        var completedFlag = false
        EspDevice.shared.espDevice?.provision(ssid: ssid, passPhrase: passPhrase, completionHandler: {
            status in

            if(!completedFlag) {
                completedFlag = true
                resolve("Connection success")
            }
        })
    }
}
