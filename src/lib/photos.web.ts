// Web build: photos are downscaled and stored as Blobs in IndexedDB.
// An in-memory map of object URLs lets photoUri() stay synchronous like on native.
import * as ImagePicker from 'expo-image-picker';

import { idbDelete, idbEntries, idbPut, STORE_PHOTOS } from '@/db/idb';

const MAX_SIZE = 1600;
const urls = new Map<string, string>();

export async function loadPhotoCache() {
  for (const [key, blob] of await idbEntries<Blob>(STORE_PHOTOS)) {
    urls.set(key, URL.createObjectURL(blob));
  }
}

export function photoUri(key: string): string {
  return urls.get(key) ?? '';
}

async function downscale(sourceUri: string): Promise<Blob> {
  const image = new Image();
  image.src = sourceUri;
  await image.decode();
  const scale = Math.min(1, MAX_SIZE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('画像を変換できませんでした'))), 'image/jpeg', 0.85)
  );
}

export async function savePhoto(sourceUri: string): Promise<string> {
  const blob = await downscale(sourceUri);
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await idbPut(STORE_PHOTOS, key, blob);
  urls.set(key, URL.createObjectURL(blob));
  return key;
}

export function deletePhoto(key: string | null | undefined) {
  if (!key) return;
  const url = urls.get(key);
  if (url) URL.revokeObjectURL(url);
  urls.delete(key);
  idbDelete(STORE_PHOTOS, key).catch(() => {});
}

// On mobile browsers the file picker must open directly from the tap,
// so these call the picker without any permission request first.
export async function pickFromLibrary(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
  return result.canceled ? null : result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] });
  return result.canceled ? null : result.assets[0].uri;
}
