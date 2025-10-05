import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Home, RotateCcw } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#4facfe', '#00f2fe']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.successIcon,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <CheckCircle color="#fff" size={100} strokeWidth={2} />
          </Animated.View>

          <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Sent Successfully!</Text>
            <Text style={styles.subtitle}>
              Your files have been sent to the Xerox center
            </Text>

            <View style={styles.detailsCard}>
              <DetailRow label="Student Name" value={params.studentName as string} />
              <DetailRow label="Xerox Center" value={`#${params.xeroxCenterId}`} />
              <DetailRow label="Files Sent" value={params.fileCount as string} />
              <DetailRow label="Print Type" value={params.printType === 'color' ? 'Color' : 'Black & White'} />
              <DetailRow label="Copies" value={`${params.copies || 1} ${((params.copies || 1) === 1) ? 'copy' : 'copies'}`} />
              <DetailRow label="Status" value="Processing" />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                The Xerox center has been notified and will start processing your print job shortly.
              </Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace({
              pathname: '/select-files',
              params: {
                xeroxCenterId: params.xeroxCenterId as string,
                studentName: params.studentName as string,
                printType: params.printType as string || 'bw',
                copies: params.copies as string || '1',
              }
            })}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <RotateCcw color="#3a7bd5" size={24} />
              <Text style={styles.buttonText}>Send More Files</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Home color="#fff" size={24} />
              <Text style={[styles.buttonText, styles.homeButtonText]}>Go to Home</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 40,
  },
  textContainer: {
    width: '100%',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 24,
    gap: 12,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  homeButton: {
    backgroundColor: '#3a7bd5',
    borderWidth: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3a7bd5',
  },
  homeButtonText: {
    color: '#fff',
  },
});
