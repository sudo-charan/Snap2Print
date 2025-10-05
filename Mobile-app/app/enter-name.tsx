import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, ArrowRight, Printer, Hash, Minus, Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiUrl } from '../config/api';

export default function EnterNameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [name, setName] = useState('');
  const [printType, setPrintType] = useState<'color' | 'bw'>('bw');
  const [copies, setCopies] = useState(1);
  const [shopName, setShopName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (params.xeroxCenterId) {
        try {
          setIsLoading(true);
          // Replace with your actual API endpoint
          const response = await fetch(getApiUrl(`/api/shops/${params.xeroxCenterId}`));
          if (response.ok) {
            const shopData = await response.json();
            setShopName(shopData.name || 'Unknown Shop');
          } else {
            setShopName('Shop not found');
          }
        } catch (error) {
          console.error('Failed to fetch shop details:', error);
          setShopName('Shop not found');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchShopDetails();
  }, [params.xeroxCenterId]);

  const handleContinue = () => {
    if (name.trim()) {
      router.push({
        pathname: '/select-files',
        params: {
          xeroxCenterId: params.xeroxCenterId as string,
          studentName: name.trim(),
          printType: printType,
          copies: copies.toString(),
        },
      });
    }
  };

  const updateCopies = (newCopies: number) => {
    if (newCopies >= 1 && newCopies <= 50) {
      setCopies(newCopies);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#3a7bd5" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.iconGradient}
            >
              <User color="#fff" size={48} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.subtitle}>
            We'll use this to identify your print job
          </Text>

          <View style={styles.inputContainer}>
            <User color="#999" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          {/* Print Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Print Type</Text>
            <View style={styles.printTypeContainer}>
              <TouchableOpacity
                style={[styles.printTypeOption, printType === 'bw' && styles.printTypeSelected]}
                onPress={() => setPrintType('bw')}
              >
                <Text style={[styles.printTypeText, printType === 'bw' && styles.printTypeTextSelected]}>
                  Black & White
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.printTypeOption, printType === 'color' && styles.printTypeSelected]}
                onPress={() => setPrintType('color')}
              >
                <Text style={[styles.printTypeText, printType === 'color' && styles.printTypeTextSelected]}>
                  Color
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Copies Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Copies</Text>
            <View style={styles.copiesContainer}>
              <TouchableOpacity
                style={[styles.copyButton, copies <= 1 && styles.copyButtonDisabled]}
                onPress={() => updateCopies(copies - 1)}
                disabled={copies <= 1}
              >
                <Minus color={copies <= 1 ? "#ccc" : "#3a7bd5"} size={20} />
              </TouchableOpacity>

              <View style={styles.copyDisplay}>
                <Hash color="#3a7bd5" size={20} />
                <Text style={styles.copyText}>{copies}</Text>
              </View>

              <TouchableOpacity
                style={[styles.copyButton, copies >= 50 && styles.copyButtonDisabled]}
                onPress={() => updateCopies(copies + 1)}
                disabled={copies >= 50}
              >
                <Plus color={copies >= 50 ? "#ccc" : "#3a7bd5"} size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Connected to:</Text>
            <Text style={styles.infoValue}>
              {isLoading ? 'Loading...' : (shopName || `Xerox Center #${params.xeroxCenterId}`)}
            </Text>
            <Text style={styles.infoTitle}>Print Settings:</Text>
            <Text style={styles.infoValue}>
              {printType === 'color' ? 'Color' : 'Black & White'} • {copies} {copies === 1 ? 'copy' : 'copies'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !name.trim() && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!name.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={name.trim() ? ['#4facfe', '#00f2fe'] : ['#ccc', '#aaa']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ArrowRight color="#fff" size={24} />
          </LinearGradient>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
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
    padding: 24,
    gap: 16,
  },
  iconContainer: {
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  printTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  printTypeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  printTypeSelected: {
    backgroundColor: '#eaf5ff',
    borderColor: '#4facfe',
  },
  printTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  printTypeTextSelected: {
    color: '#4facfe',
  },
  copiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  copyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  copyButtonDisabled: {
    backgroundColor: '#fafafa',
    borderColor: '#f0f0f0',
  },
  copyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    minWidth: 80,
    justifyContent: 'center',
  },
  copyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3a7bd5',
  },
  infoCard: {
    backgroundColor: '#f9f9ff',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e8e8ff',
  },
  infoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3a7bd5',
    marginBottom: 8,
  },
  continueButton: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
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
