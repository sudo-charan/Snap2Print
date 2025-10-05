import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Upload, FileText, X, Send } from 'lucide-react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { getApiUrl } from '../config/api';

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function SelectFilesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isSending, setIsSending] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles: SelectedFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/octet-stream',
        }));
        setFiles([...files, ...newFiles]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSendFiles = async () => {
    if (files.length === 0) return;

    setIsSending(true);

    try {
      // For React Native, we need to send files one by one or use a different approach
      // Let's try sending to a simple endpoint first to test connectivity

      // First, let's check if the shop exists
      const shopCheckResponse = await fetch(getApiUrl(`/api/shops/${params.xeroxCenterId}`));
      if (!shopCheckResponse.ok) {
        throw new Error(`Shop not found: ${params.xeroxCenterId}`);
      }

      const shopData = await shopCheckResponse.json();
      console.log('Shop found:', shopData.name);

      // Create print job with metadata (without file for now)
      const createJobResponse = await fetch(getApiUrl('/api/print-jobs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          shopId: params.xeroxCenterId,
          studentName: params.studentName,
          printType: params.printType || 'bw',
          copies: params.copies || '1',
          fileCount: files.length,
          fileNames: files.map(f => f.name),
          // Note: Files will be uploaded separately in a real implementation
        }),
      });

      if (createJobResponse.ok) {
        const result = await createJobResponse.json();
        console.log('Print job created:', result);

        router.push({
          pathname: '/success',
          params: {
            xeroxCenterId: params.xeroxCenterId as string,
            studentName: params.studentName as string,
            printType: params.printType as string || 'bw',
            copies: params.copies as string || '1',
            fileCount: files.length.toString(),
          },
        });
      } else {
        const errorText = await createJobResponse.text();
        console.error('Print job creation failed:', createJobResponse.status, errorText);
        throw new Error(`Upload failed: ${createJobResponse.status}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Network error. Please check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#3a7bd5" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Files</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Printing for:</Text>
          <Text style={styles.infoValue}>{params.studentName}</Text>
          <Text style={styles.infoLabel}>Shop:</Text>
          <Text style={styles.infoValue}>#{params.xeroxCenterId}</Text>
          <Text style={styles.infoLabel}>Print Settings:</Text>
          <Text style={styles.infoValue}>
            {(params.printType === 'color' ? 'Color' : 'Black & White')} • {params.copies || 1} {((params.copies || 1) === 1) ? 'copy' : 'copies'}
          </Text>
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument} activeOpacity={0.7}>
          <Upload color="#3a7bd5" size={28} />
          <View>
            <Text style={styles.uploadTitle}>Browse Files</Text>
            <Text style={styles.uploadSubtitle}>PDF, Images, Word documents</Text>
          </View>
        </TouchableOpacity>

        {files.length > 0 ? (
          <>
            <View style={styles.filesHeader}>
              <Text style={styles.filesTitle}>Selected Files ({files.length})</Text>
            </View>

            <FlatList
              data={files}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.fileItem}>
                  <View style={styles.fileIcon}>
                    <FileText color="#3a7bd5" size={24} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFile(index)}
                    style={styles.removeButton}
                  >
                    <X color="#ff4444" size={20} />
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.filesList}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <FileText color="#ccc" size={64} />
            <Text style={styles.emptyText}>No files selected yet</Text>
            <Text style={styles.emptySubtext}>Tap the button above to browse files</Text>
          </View>
        )}
      </View>

      {files.length > 0 && (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendFiles}
          disabled={isSending}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Send color="#fff" size={24} />
            <Text style={styles.buttonText}>
              {isSending ? 'Sending...' : `Send ${files.length} File${files.length > 1 ? 's' : ''}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#f9f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e8ff',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3a7bd5',
    marginBottom: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filesList: {
    gap: 12,
    paddingBottom: 100,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#eaf5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  sendButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
