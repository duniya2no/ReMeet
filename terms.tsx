import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { Dimensions} from "react-native";
const { width, height } = Dimensions.get("window");


const COLORS = {
  primary: "#4C8BF5",
  secondary: "#6FA7FF",
  background: "#F8FAFC",
  text: "#1E293B",
  muted: "#64748B",
  card: "#fff",
  border: "#E2E8F0",
};

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Privacy</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.Text
          entering={SlideInRight.delay(100).duration(500)}
          style={styles.sectionTitle}
        >
          Terms of Service
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(150).duration(600)}
          style={styles.paragraph}
        >
          By using this app, you agree to abide by all applicable laws and
          regulations. You are responsible for providing accurate information
          when using our services. Any misuse of the app or violation of these
          terms may result in termination of your access.
        </Animated.Text>

        <View style={styles.divider} />

        <Animated.Text
          entering={SlideInRight.delay(200).duration(500)}
          style={styles.sectionTitle}
        >
          Privacy Policy
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(250).duration(600)}
          style={styles.paragraph}
        >
          We respect your privacy. Your data is securely stored and used only
          for providing our services. We do not sell or share your personal
          information with third parties without your consent, except where
          required by law.
        </Animated.Text>

        <View style={styles.divider} />

        <Animated.Text
          entering={SlideInRight.delay(300).duration(500)}
          style={styles.sectionTitle}
        >
          App Features
        </Animated.Text>
        <Animated.View
          entering={FadeIn.delay(350).duration(600)}
          style={styles.card}
        >
          <Text style={styles.bulletItem}>🎁 Free plan for first 20 clients</Text>
          <Text style={styles.bulletItem}>📆 Monthly & yearly paid plans</Text>
          <Text style={styles.bulletItem}>💳 EasyPaisa & JazzCash payment</Text>
          <Text style={styles.bulletItem}>👥 Unlimited client management</Text>
          <Text style={styles.bulletItem}>🔔 Automatic appointment reminders</Text>
          <Text style={styles.bulletItem}>🔒 Secure & reliable service</Text>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.Text
          entering={SlideInRight.delay(400).duration(500)}
          style={styles.sectionTitle}
        >
          Contact Us
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(450).duration(600)}
          style={styles.paragraph}
        >
          If you have any questions about these terms, privacy policy, or our
          features, please contact us at:
        </Animated.Text>
        <Animated.View 
          entering={FadeIn.delay(500).duration(600)}
          style={styles.card}
        >
          <Text style={styles.bulletItem}>📧 ReMeet@gmail.com</Text>
        </Animated.View>

        <Animated.Text
          entering={FadeIn.delay(550).duration(600)}
          style={styles.versionText}
        >
          Last updated: July 2025
        </Animated.Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: StatusBar.currentHeight || 0,
    borderBottomLeftRadius: width * 0.03, // 3% of screen width
    borderBottomRightRadius: width * 0.03, // 3% of screen width
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04, // 4% of screen width
    paddingVertical: height * 0.02, // 2% of screen height
  },
  headerTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    padding: width * 0.05, // 5% of screen width
    paddingBottom: height * 0.05, // 5% of screen height
  },
  sectionTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: height * 0.02, // 2% of screen height
  },
  paragraph: {
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.muted,
    marginBottom: height * 0.02, // 2% of screen height
    lineHeight: width * 0.06, // 6% of screen width
  },
  bulletItem: {
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.text,
    marginVertical: height * 0.01, // 1% of screen height
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: height * 0.02, // 2% of screen height
  },
  card: {
    backgroundColor: COLORS.card,
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.03, // 3% of screen width
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: width * 0.01, // 1% of screen width
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginBottom: height * 0.02, // 2% of screen height
  },
  versionText: {
    textAlign: "center",
    marginTop: height * 0.03, // 3% of screen height
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.muted,
  },
});
