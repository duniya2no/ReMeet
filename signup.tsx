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
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, {
  FadeInUp,
  FadeInLeft,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

const BUSINESS_TYPES = [
  "Retail",
  "Restaurant",
  "Salon",
  "Gym",
  "Consultancy",
  "Other",
];

export default function SignUpScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [business, setBusiness] = useState("");
  const [shopName, setShopName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const scale = useSharedValue(1);

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword || !business || !shopName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, "users", user.uid), {
        name: username,
        email,
        business,
        shopName,
        avatarUri: "",
      });

      router.replace("/home");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Alert.alert("Signup Failed", errorMessage);
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

  const handleBusinessChange = (text: string) => {
    setBusiness(text);
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion: string) => {
    setBusiness(suggestion === "Other" ? "" : suggestion);
    setShowSuggestions(false);
  };

  return (
    <LinearGradient colors={["#5A4FCF", "#2C2C54"]} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Animated.View style={styles.card} entering={FadeInUp.duration(600)}>
          <Animated.Text
            style={styles.title}
            entering={FadeInDown.delay(200).duration(600)}
          >
            Create Account
          </Animated.Text>

          <Animated.View entering={FadeInLeft.delay(500).duration(600)}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />
          </Animated.View>

          <Animated.View entering={FadeInLeft.delay(600).duration(600)}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Animated.View>

          <Animated.View entering={FadeInLeft.delay(700).duration(600)}>
            <TextInput
              style={styles.input}
              placeholder="Business Type"
              placeholderTextColor="#aaa"
              value={business}
              onChangeText={handleBusinessChange}
            />
            {showSuggestions && (
              <FlatList
                data={BUSINESS_TYPES.filter((type) =>
                  type.toLowerCase().includes(business.toLowerCase())
                )}
                keyExtractor={(item) => item}
                style={styles.suggestionList}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectSuggestion(item)}>
                    <Text style={styles.suggestionItem}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </Animated.View>

          <Animated.View entering={FadeInLeft.delay(800).duration(600)}>
            <TextInput
              style={styles.input}
              placeholder="Shop Name"
              placeholderTextColor="#aaa"
              value={shopName}
              onChangeText={setShopName}
            />
          </Animated.View>

          <Animated.View entering={FadeInLeft.delay(900).duration(600)}>
            <View style={styles.passwordContainer}>
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
            </View>
          </Animated.View>

          <Animated.View entering={FadeInLeft.delay(1000).duration(600)}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={
                    showConfirmPassword ? "eye-off-outline" : "eye-outline"
                  }
                  size={22}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(1200).duration(600)}>
            <Animated.View style={[animatedButtonStyle]}>
              <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={styles.button}
                onPress={handleSignUp}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(1400).duration(600)}>
            <TouchableOpacity
              style={{ marginTop: 20 }}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={{ fontWeight: "bold" }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
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
    paddingHorizontal: width * 0.05, // 5% of screen width
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: width * 0.05, // responsive border radius
    padding: width * 0.05, // responsive padding
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },
  title: {
    fontSize: width * 0.08, // 8% of screen width
    color: "#fff",
    fontWeight: "bold",
    marginBottom: height * 0.03, // 3% of screen height
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.05, // responsive border radius
    marginBottom: height * 0.02, // 2% of screen height
    fontSize: width * 0.04, // 4% of screen width
  },
  suggestionList: {
    backgroundColor: "#fff",
    borderRadius: width * 0.04, // responsive border radius
    marginBottom: height * 0.02, // 2% of screen height
  },
  suggestionItem: {
    padding: width * 0.04, // 4% of screen width
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: width * 0.05, // responsive border radius
    marginBottom: height * 0.02, // 2% of screen height
  },
  passwordInput: {
    flex: 1,
    color: "#fff",
    padding: width * 0.04, // 4% of screen width
    fontSize: width * 0.04, // 4% of screen width
  },
  eyeIcon: {
    paddingHorizontal: width * 0.04, // 4% of screen width
  },
  button: {
    backgroundColor: "#4C8BF5",
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.05, // responsive border radius
    marginTop: height * 0.02, // 2% of screen height
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: width * 0.04, // 4% of screen width
  },
  loginText: {
    textAlign: "center",
    color: "#ddd",
    fontSize: width * 0.035, // 3.5% of screen width
  },
});