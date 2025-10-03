import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

import { auth } from "./firebase"; // ✅ import your firebase instance
import { signInWithEmailAndPassword } from "firebase/auth";
const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const scale = useSharedValue(1);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert("Success", "Logged in successfully!");

      router.replace("/home");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Alert.alert("Login Failed", errorMessage);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <LinearGradient
      colors={["#5A4FCF", "#2C2C54"]}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Animated.View style={styles.card} entering={FadeInUp.duration(600)}>
          <Animated.Text
            style={styles.title}
            entering={FadeInDown.delay(200).duration(600)}
          >
            Welcome Back
          </Animated.Text>

          <Animated.Text
            style={styles.subtitle}
            entering={FadeInDown.delay(400).duration(600)}
          >
            Sign in to continue
          </Animated.Text>

          <Animated.View entering={FadeInLeft.delay(600).duration(600)}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Animated.View>

          <Animated.View
            style={styles.passwordContainer}
            entering={FadeInLeft.delay(800).duration(600)}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#aaa"
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(1000).duration(600)}>
            <Animated.View style={[animatedButtonStyle]}>
              <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={styles.button}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          <TouchableOpacity
            onPress={() => router.push("/signup")}
            style={{ marginTop: 20 }}
          >
            <Animated.Text
              style={styles.registerText}
              entering={FadeInUp.delay(1200).duration(600)}
            >
              Don’t have an account?{" "}
              <Text style={{ fontWeight: "bold" }}>Register</Text>
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: width * 0.05,
    padding: width * 0.05,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },
  title: {
    fontSize: width * 0.08,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: height * 0.01,
    textAlign: "center",
    paddingTop: height * 0.02,
  },
  subtitle: {
    fontSize: width * 0.035,
    color: "#ddd",
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    padding: width * 0.04,
    borderRadius: width * 0.05,
    marginBottom: height * 0.02,
    fontSize: width * 0.045,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: width * 0.05,
    marginBottom: height * 0.02,
  },
  passwordInput: {
    flex: 1,
    color: "#fff",
    padding: width * 0.04,
    fontSize: width * 0.045,
  },
  eyeIcon: {
    paddingHorizontal: width * 0.035,
  },
  button: {
    backgroundColor: "#4C8BF5",
    padding: width * 0.04,
    borderRadius: width * 0.05,
    marginTop: height * 0.015,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: width * 0.045,
  },
  registerText: {
    textAlign: "center",
    color: "#ddd",
    fontSize: width * 0.035,
  },
});