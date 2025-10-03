import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db } from "./firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import Animated, { FadeInUp, FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
const FAQs = [
  "How can I reset my password?",
  "How do I update my profile information?",
  "Why can’t I log in?",
  "How to contact support?",
];

export default function HelpCenterScreen() {
  const router = useRouter();

  const [selected, setSelected] = useState<string | null>(null);
  const [otherMessage, setOtherMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleSend = async () => {
    if (selected === "Other" && !otherMessage.trim()) {
      return alert("Please enter your message.");
    }

    const data = {
      type: selected,
      message: selected === "Other" ? otherMessage : selected,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "helpRequests"), data);
      setShowSuccess(true);
      setSelected(null);
      setOtherMessage("");
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to send complaint. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4C8BF5", "#6FA8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {showSuccess && (
          <Animated.View style={styles.successBox} entering={ZoomIn.duration(400)}>
            <Ionicons name="checkmark-circle-outline" size={48} color="green" />
            <Text style={styles.successText}>Your complaint has been sent!</Text>
          </Animated.View>
        )}

        {!showSuccess && (
          <>
            <Text style={styles.intro}>Select a question or type your complaint below.</Text>

            {FAQs.map((faq, index) => (
              <Animated.View key={index} entering={FadeInUp.delay(index * 50).duration(300)}>
                <TouchableOpacity
                  style={[
                    styles.faqItem,
                    selected === faq && { borderColor: "#4C8BF5" },
                  ]}
                  onPress={() => {
                    setSelected(faq);
                    setOtherMessage("");
                  }}
                >
                  <Text style={styles.faqText}>{faq}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <Animated.View entering={FadeInUp.delay(200).duration(300)}>
              <TouchableOpacity
                style={[
                  styles.faqItem,
                  selected === "Other" && { borderColor: "#4C8BF5" },
                ]}
                onPress={() => setSelected("Other")}
              >
                <Text style={styles.faqText}>Other</Text>
              </TouchableOpacity>
            </Animated.View>

            {selected === "Other" && (
              <Animated.View entering={FadeIn.duration(300)}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your message..."
                  value={otherMessage}
                  onChangeText={setOtherMessage}
                  multiline
                />
              </Animated.View>
            )}

            {selected && (
              <TouchableOpacity
                onPressIn={() => (scale.value = withSpring(0.95))}
                onPressOut={() => (scale.value = withSpring(1))}
                onPress={handleSend}
              >
                <Animated.View style={[styles.sendButton, animatedButtonStyle]} entering={FadeInUp.delay(250).duration(300)}>
                  <Text style={styles.sendButtonText}>Send</Text>
                </Animated.View>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Need more help? Email us at</Text>
          <Text style={[styles.footerText, { fontWeight: "600" }]}>support@yourapp.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04, // 4% of screen width
    paddingVertical: height * 0.02, // 2% of screen height
    borderBottomLeftRadius: width * 0.03, // 3% of screen width
    borderBottomRightRadius: width * 0.03, // 3% of screen width
    marginBottom: height * 0.02, // 2% of screen height
  },
  
  backButton: { padding: width * 0.02 }, // 2% of screen width
  
  headerTitle: {
    color: "#fff",
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
  },
  
  content: { padding: width * 0.04, paddingBottom: height * 0.05 }, // 4% of screen width, 5% of screen height
  
  intro: { fontSize: width * 0.04, color: "#555", marginBottom: height * 0.03 }, // 4% of screen width, 3% of screen height
  
  faqItem: {
    backgroundColor: "#fff",
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.04, // 4% of screen width
    marginBottom: height * 0.02, // 2% of screen height
    borderWidth: 1,
    borderColor: "#ddd",
  },
  
  faqText: { fontSize: width * 0.04, color: "#333" }, // 4% of screen width
  
  textInput: {
    height: height * 0.1, // 10% of screen height
    backgroundColor: "#fff",
    borderRadius: width * 0.04, // 4% of screen width
    padding: width * 0.04, // 4% of screen width
    borderWidth: 1,
    borderColor: "#ddd",
    textAlignVertical: "top",
    marginTop: height * 0.02, // 2% of screen height
  },
  
  sendButton: {
    backgroundColor: "#4C8BF5",
    padding: width * 0.05, // 5% of screen width
    borderRadius: width * 0.05, // 5% of screen width
    alignItems: "center",
    marginTop: height * 0.03, // 3% of screen height
  },
  
  sendButtonText: {
    color: "#fff",
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "600",
  },
  
  successBox: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.05, // 5% of screen height
  },
  
  successText: { fontSize: width * 0.04, color: "green", marginTop: height * 0.02 }, // 4% of screen width, 2% of screen height
  
  footer: { marginTop: height * 0.05, alignItems: "center" }, // 5% of screen height
  
  footerText: { fontSize: width * 0.04, color: "#777" }, // 4% of screen width
});
