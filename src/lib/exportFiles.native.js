// iOS / Android: write the file to the cache folder, then open the system share sheet
// (Save to Files, Google Drive, Excel, email, ...).
// Needs:  npx expo install expo-file-system expo-sharing
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function saveFile(name, data, mime, uti) {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(data); // string (CSV) or Uint8Array (xlsx)
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.uri, { mimeType: mime, dialogTitle: name, UTI: uti });
  return 'shared';
}
