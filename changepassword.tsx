import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
const { width, height } = Dimensions.get("window");
export default function ChangePasswordScreen() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("New passwords do not match");
      return;
    }

    if (!user || !user.email) {
      Alert.alert("No user logged in");
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert("Password changed successfully");
      router.back();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        Alert.alert("Failed to change password", error.message);
      } else {
        Alert.alert("Failed to change password", "An unknown error occurred.");
      }
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <Animated.View style={styles.form} entering={FadeInUp.duration(500)}>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => (scale.value = withSpring(0.95))}
          onPressOut={() => (scale.value = withSpring(1))}
          onPress={handleChangePassword}
        >
          <Animated.View style={[styles.saveButton, animatedButtonStyle]}>
            <Text style={styles.saveButtonText}>Save Password</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  
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
  
  backButton: {
    padding: width * 0.02, // 2% of screen width
  },
  
  headerTitle: {
    color: "#fff",
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
  },
  
  form: {
    paddingHorizontal: width * 0.04, // 4% of screen width
    paddingTop: height * 0.03, // 3% of screen height
  },
  
  input: {
    backgroundColor: "#fff",
    borderRadius: width * 0.05, // 5% of screen width
    padding: width * 0.04, // 4% of screen width
    marginBottom: height * 0.02, // 2% of screen height
    borderWidth: 1,
    borderColor: "#ddd",
  },
  
  saveButton: {
    backgroundColor: "#4C8BF5",
    padding: width * 0.05, // 5% of screen width
    borderRadius: width * 0.05, // 5% of screen width
    alignItems: "center",
    marginTop: height * 0.03, // 3% of screen height
  },
  
  saveButtonText: {
    color: "#fff",
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "600",
  },
});
