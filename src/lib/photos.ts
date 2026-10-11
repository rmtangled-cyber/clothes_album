import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Photos are copied into the app's document directory and only the file name
// is stored in the database. On iOS the absolute path of the app container can
// change between app updates, so the full URI is rebuilt at read time.
const photoDir = new Directory(Paths.document, 'photos');

function ensurePhotoDir() {
  if (!photoDir.exists) {
    photoDir.create({ intermediates: true });
  }
}

export function photoUri(fileName: string): string {
  return new File(photoDir, fileName).uri;
}

export async function savePhoto(sourceUri: string): Promise<string> {
  ensurePhotoDir();
  const source = new File(sourceUri);
  const ext = source.extension || '.jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await source.copy(new File(photoDir, fileName));
  return fileName;
}

export function deletePhoto(fileName: string | null | undefined) {
  if (!fileName) return;
  const file = new File(photoDir, fileName);
  if (file.exists) {
    file.delete();
  }
}

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.8,
};

export async function pickFromLibrary(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
  return result.canceled ? null : result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('カメラを使えません', '設定アプリからカメラへのアクセスを許可してください。');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(pickerOptions);
  return result.canceled ? null : result.assets[0].uri;
}
