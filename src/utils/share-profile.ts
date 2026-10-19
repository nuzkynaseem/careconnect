import { Alert, Linking, Platform, Share } from 'react-native';

import { patient } from '@/data/people';

const shareMessage = () =>
  `${patient.name}'s Care Connect ID: ${patient.careId}\n` +
  `View medical history and medication schedule: ${patient.profileUrl}`;

function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

/** Opens the system share sheet with a link to the patient's profile. */
export async function shareProfileLink() {
  try {
    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({ title: 'My Care Connect ID', text: shareMessage(), url: patient.profileUrl });
      } else {
        await navigator.clipboard.writeText(patient.profileUrl);
        notify('Link copied', patient.profileUrl);
      }
      return;
    }
    await Share.share({ title: 'My Care Connect ID', message: shareMessage(), url: patient.profileUrl });
  } catch (error) {
    // Dismissing the share sheet rejects on web; that isn't an error worth showing.
    if (error instanceof Error && error.name === 'AbortError') return;
    notify('Unable to share', 'Please try again.');
  }
}

/** Opens the messaging app with the patient's ID pre-filled. */
export async function textProfileId() {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const url = `sms:${separator}body=${encodeURIComponent(shareMessage())}`;
  try {
    await Linking.openURL(url);
  } catch {
    notify('Unable to open Messages', shareMessage());
  }
}
