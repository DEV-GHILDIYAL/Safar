import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { haptics } from '@/lib/haptics';
import { pickPhotos, type PhotoSource } from '@/lib/photos';
import { useProfile } from '@/store/profile';
import type { CoverChange } from '@/store/trips';
import { colors, space } from '@/theme/tokens';
import { Avatar } from './Avatar';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Text } from './Text';
import { TextField } from './TextField';

export function ProfileSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ProfileForm onDone={onClose} />
    </BottomSheet>
  );
}

function ProfileForm({ onDone }: { onDone: () => void }) {
  const profile = useProfile((s) => s.profile);
  const save = useProfile((s) => s.save);
  const [name, setName] = useState(profile.name);
  const [homeCity, setHomeCity] = useState(profile.homeCity);
  const [avatar, setAvatar] = useState<CoverChange>('keep');
  const [saving, setSaving] = useState(false);

  const previewUri = typeof avatar === 'string' && avatar !== 'keep' ? avatar : null;
  const previewFile = avatar === 'keep' ? profile.avatar : null;

  const pick = async (source: PhotoSource) => {
    const [p] = await pickPhotos(source);
    if (p) {
      haptics.select();
      setAvatar(p.uri);
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await save({ name: name.trim(), homeCity: homeCity.trim() }, avatar);
      haptics.success();
      onDone();
    } catch (e) {
      setSaving(false);
      Alert.alert('Could not save', String(e));
    }
  };

  return (
    <>
      <View style={styles.head}>
        <Text variant="title">Edit profile</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
        <View style={styles.avatarRow}>
          <Avatar name={name} uri={previewUri} file={previewFile} size={76} />
          <View style={styles.avatarActions}>
            <Button compact variant="secondary" icon="image-outline" label="Gallery" onPress={() => pick('library')} />
            <Button compact variant="secondary" icon="camera-outline" label="Camera" onPress={() => pick('camera')} />
            {(previewUri || previewFile) && (
              <IconButton icon="trash-can-outline" size={40} color={colors.danger} onPress={() => setAvatar(null)} />
            )}
          </View>
        </View>
        <TextField label="Your name" icon="account-outline" value={name} onChangeText={setName} placeholder="What should Safar call you?" />
        <TextField label="Home city" icon="home-city-outline" value={homeCity} onChangeText={setHomeCity} placeholder="Dehradun" />
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Save profile" icon="check" onPress={submit} loading={saving} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.xl, paddingBottom: space.md },
  body: { gap: space.lg, paddingHorizontal: space.xl, paddingBottom: space.xl },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  avatarActions: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' },
  footer: { paddingHorizontal: space.xl, paddingVertical: space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
