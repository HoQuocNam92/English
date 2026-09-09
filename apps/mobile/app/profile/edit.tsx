import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing } from '@techenglish/design-tokens';
import { api, getTokens, API_BASE } from '../../src/shared/api/api-client';
import { validateDisplayName } from '../../src/shared/utils/validators';
import { useAuth } from '../../src/shared/store/auth-context';

export default function MobileEditProfileScreen() {
  const router = useRouter();
  const { fetchUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  
  // Mock states for the new dropdowns
  const [englishLevel, setEnglishLevel] = useState('Intermediate (B1-B2)');
  const [itField, setItField] = useState('Frontend Development');
  const [careerGoal, setCareerGoal] = useState('Remote Work for US/EU Clients');
  const [certification, setCertification] = useState('IELTS 6.5+');
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/users/me')
      .then((data: any) => {
        setDisplayName(data.displayName || 'Nguyen Van A');
        setAvatarUrl(data.avatarUrl || data.userDetail?.avatarUrl || null);
      })
      .catch(err => Alert.alert('Lỗi', 'Không thể tải thông tin'))
      .finally(() => setLoading(false));
  }, []);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);
      const tokens = await getTokens();
      
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName || 'avatar.jpg',
        type: asset.mimeType || 'image/jpeg',
      });

      const response = await fetch(`${API_BASE}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setAvatarUrl(data.url);
      
      await api.patch('/users/me', { avatarUrl: data.url });
      await fetchUser();
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const nameErr = validateDisplayName(displayName);
    if (nameErr) return Alert.alert('Lỗi', nameErr);

    setSaving(true);
    try {
      await api.patch('/users/me', { displayName });
      await fetchUser();
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân thành công!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'N';

  const renderDropdown = (label: string, value: string) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdownButton} activeOpacity={0.8}>
        <Text style={styles.dropdownText}>{value}</Text>
        <MaterialIcons name="expand-more" size={24} color="#464555" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#464555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
            <View style={styles.avatarBox}>
              {uploading ? (
                <ActivityIndicator color="#ffffff" />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 96, height: 96, borderRadius: 48 }} />
              ) : (
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              )}
              <View style={styles.editAvatarIcon}>
                <MaterialIcons name="edit" size={16} color="#ffffff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nguyen Van A"
              placeholderTextColor="#777587"
            />
          </View>

          {renderDropdown('Current English Level', englishLevel)}
          {renderDropdown('Primary IT Field', itField)}
          {renderDropdown('Career Goal', careerGoal)}
          {renderDropdown('Target Certification (Optional)', certification)}
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#c7c4d8',
    marginTop: 20
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 100
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  avatarBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e3e5'
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff'
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  formContainer: {
    gap: spacing.md
  },
  inputGroup: {
    gap: spacing.xs
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464555'
  },
  input: {
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: 14,
    color: '#191c1e',
    backgroundColor: '#ffffff'
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#c7c4d8',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: '#ffffff'
  },
  dropdownText: {
    fontSize: 14,
    color: '#191c1e'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: spacing.md,
    paddingBottom: 32, // Safe area inset
    borderTopWidth: 1,
    borderTopColor: '#c7c4d8',
    shadowColor: '#0f1718',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4
  },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  }
});

