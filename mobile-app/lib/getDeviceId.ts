import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'my_custom_device_id';

export const getPersistentDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // IDが存在しない場合、新しく生成して保存する
    deviceId = generateUUID()
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    console.log('New Device ID generated and saved:', deviceId);
  } else {
    console.log('Existing Device ID:', deviceId);
  }

  return deviceId;
};

function generateUUID() {
  // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
  let d = new Date().getTime();
  let d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0;

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// 使用例
const myUUID = generateUUID();
console.log(myUUID);