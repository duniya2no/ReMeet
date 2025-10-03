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
import { Dimensions } from "react-native";

import Animated, {
  FadeIn,
  SlideInRight,
} from "react-native-reanimated";
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

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.header}
        >
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back-outline" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About the App</Text>
            <View style={{ width: 26 }} /> {/* empty for symmetry */}
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.Text
            entering={SlideInRight.delay(100).duration(500)}
            style={styles.sectionTitle}
          >
            Welcome!
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(150).duration(600)}
            style={styles.paragraph}
          >
            Our app is more than just a plan management tool — it’s your{" "}
            <Text style={styles.boldText}>personal assistant</Text> for handling
            client appointments with ease. Whenever a client books an appointment
            with you, simply enter their details into the{" "}
            <Text style={styles.boldText}>appointment screen</Text>. Once added,
            the app securely stores the appointment and automatically keeps track
            of it. As the appointment time approaches, the app sends{" "}
            <Text style={styles.boldText}>timely reminders</Text> to your client,
            ensuring they never miss their meeting with you. This seamless process
            saves you time, <Text style={styles.boldText}>reduces no-shows</Text>,
            and <Text style={styles.boldText}>improves your client experience</Text>{" "}
            by keeping them informed and engaged. You focus on your work — let the
            app handle the follow-up and notifications.
          </Animated.Text>

          <View style={styles.divider} />

          <Animated.Text
            entering={SlideInRight.delay(200).duration(500)}
            style={styles.sectionTitle}
          >
            Key Features
          </Animated.Text>

          <Animated.View
            entering={FadeIn.delay(250).duration(600)}
            style={styles.card}
          >
            <Text style={styles.bulletItem}>🎁 Free Plan for First Twenty Client</Text>
            <Text style={styles.bulletItem}>📆 Monthly and Yearly Unlimited Plans</Text>
            <Text style={styles.bulletItem}>💳 Pay with EasyPaisa or JazzCash</Text>
            <Text style={styles.bulletItem}>👥 Manage Unlimited Users & Clients</Text>
            <Text style={styles.bulletItem}>🔔 Automatic Client Appointment Reminders</Text>
            <Text style={styles.bulletItem}>🔒 Secure, Fast & Reliable</Text>
          </Animated.View>

          <View style={styles.divider} />

          <Animated.Text
            entering={SlideInRight.delay(300).duration(500)}
            style={styles.sectionTitle}
          >
            How It Works
          </Animated.Text>

          <Animated.View
            entering={FadeIn.delay(350).duration(600)}
            style={styles.card}
          >
            <Text style={styles.bulletItem}>1️⃣ Browse available plans on the Purchase screen.</Text>
            <Text style={styles.bulletItem}>2️⃣ Activate free plan instantly or choose a paid plan.</Text>
            <Text style={styles.bulletItem}>3️⃣ Select payment method: EasyPaisa or JazzCash.</Text>
            <Text style={styles.bulletItem}>4️⃣ Payment is recorded and plan is activated immediately.</Text>
            <Text style={styles.bulletItem}>5️⃣ Enter client appointments and let the app remind them.</Text>
            <Text style={styles.bulletItem}>✅ Enjoy your upgraded plan and all its features!</Text>
          </Animated.View>

          <View style={styles.divider} />

          <Animated.Text
            entering={SlideInRight.delay(400).duration(500)}
            style={styles.sectionTitle}
          >
            Why Choose Our App?
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(450).duration(600)}
            style={styles.paragraph}
          >
            • Easy to use interface designed for all users{"\n"}• Quick activation of plans and appointments{"\n"}• Affordable pricing and secure payments{"\n"}• Excellent customer support
          </Animated.Text>

          <View style={styles.divider} />

          <Animated.Text
            entering={SlideInRight.delay(500).duration(500)}
            style={styles.sectionTitle}
          >
            Need Help?
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(550).duration(600)}
            style={styles.paragraph}
          >
            If you have any questions, feedback, or need support, feel free to reach out at:
          </Animated.Text>

          <Animated.View
            entering={FadeIn.delay(600).duration(600)}
            style={styles.card}
          >
            <Text style={styles.bulletItem}>📧 ReMeet@gmail.com</Text>
          </Animated.View>

          <Animated.Text
            entering={FadeIn.delay(650).duration(600)}
            style={styles.versionText}
          >
            App Version: 1.0.0
          </Animated.Text>
        </ScrollView>
      </SafeAreaView>
    </View>
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
    fontSize: width * 0.06, // 6% of screen width
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    padding: width * 0.05, // 5% of screen width
    paddingBottom: height * 0.1, // 10% of screen height
  },
  sectionTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: height * 0.01, // 1% of screen height
  },
  paragraph: {
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.muted,
    marginBottom: height * 0.02, // 2% of screen height
    lineHeight: width * 0.05, // 5% of screen width
  },
  boldText: {
    fontWeight: "bold",
    color: COLORS.text,
  },
  bulletItem: {
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.text,
    marginVertical: height * 0.005, // 0.5% of screen height
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: height * 0.02, // 2% of screen height
  },
  card: {
    backgroundColor: COLORS.card,
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.04, // 4% of screen width
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
    fontSize: width * 0.03, // 3% of screen width
    color: COLORS.muted,
  },
});