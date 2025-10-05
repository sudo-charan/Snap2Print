import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Printer, FileText, Zap } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#4facfe', '#00f2fe']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Printer color="#fff" size={80} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Snap2Print</Text>
        <Text style={styles.subtitle}>Print your documents instantly</Text>

        <View style={styles.featuresContainer}>
          <FeatureItem icon={<QrCode color="#fff" size={24} />} text="Scan QR Code" />
          <FeatureItem icon={<FileText color="#fff" size={24} />} text="Select Files" />
          <FeatureItem icon={<Zap color="#fff" size={24} />} text="Print Fast" />
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/scan-qr')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#fff', '#f0f0f0']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Sacn QR Code</Text>
            <QrCode color="#3a7bd5" size={24} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.featureItem}>
      {icon}
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 48,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 60,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  startButton: {
    width: width - 48,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    color: '#3a7bd5',
  },
});
