import React, { useState, useEffect, useRef } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInUp,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import styles from '../styles';

import { auth } from "./firebase";
import { signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default function VerificationScreen() {
  const { name = "Guest", source = "", phone: passedPhone = "" } =
    useLocalSearchParams<{ name?: string; source?: string; phone?: string }>();

  const [step, setStep] = useState<"phone" | "code">(
    source === "signup" ? "code" : "phone"
  );
  const [phone, setPhone] = useState(passedPhone);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [timer, setTimer] = useState(30);
  const intervalRef = useRef<number | null>(null);

  const codeRefs = Array.from({ length: 6 }, () => useRef<TextInput>(null));
  const scaleRefs = Array.from({ length: 6 }, () => useSharedValue(1));

  const animatedStyles = scaleRefs.map((scale) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))
  );

  const startVerification = async () => {
    if (!phone) {
      Alert.alert("Error", "No phone number provided.");
      return;
    }

    try {
      const result = await signInWithPhoneNumber(auth, phone);
      setConfirmationResult(result);

      Alert.alert(
        "Verification Code Sent",
        `Your verification code has been sent to ${phone}`
      );

      setTimer(30);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      Alert.alert("Error", "Failed to send verification code.");
    }
  };

  const handleNext = () => {
    if (!phone) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    if (!phone.startsWith("+")) {
      Alert.alert("Error", "Phone number must start with country code (e.g. +92)");
      return;
    }

    setStep("code");
    startVerification();
  };

  const handleVerify = async () => {
    const enteredCode = code.join("");
    if (!confirmationResult) {
      Alert.alert("Error", "No verification session found.");
      return;
    }

    try {
      await confirmationResult.confirm(enteredCode);

      Alert.alert("Success", "Phone number verified!");
      router.replace({
        pathname: "/home",
        params: { name, source, phone },
      });
    } catch (err) {
      Alert.alert("Invalid Verification", "The verification code is incorrect.");
      setCode(["", "", "", "", "", ""]);
      codeRefs[0].current?.focus();
    }
  };

  const handleCodeChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);

    if (value) {
      if (idx < codeRefs.length - 1) {
        codeRefs[idx + 1].current?.focus();
      }
    } else {
      if (idx > 0) {
        codeRefs[idx - 1].current?.focus();
      }
    }
  };

  useEffect(() => {
    if (step === "code" && phone) {
      startVerification();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step]);

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleVerify();
    }
  }, [code]);

  return (
    <LinearGradient colors={["#5A4FCF", "#2C2C54"]} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {step === "phone" ? (
          <Animated.View style={styles.card} entering={FadeInUp.duration(600)}>
            <Text style={styles.title}>Enter Phone Number</Text>

            <TextInput
              style={styles.input}
              placeholder="+92XXXXXXXXXX"
              placeholderTextColor="#ddd"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={styles.card} entering={BounceIn.duration(700)}>
            <Text style={styles.title}>Verification Code</Text>

            <Text style={styles.phoneText}>📱 {phone}</Text>

            <View style={styles.codeContainer}>
              {code.map((digit, idx) => (
                <Animated.View
                  key={idx}
                  style={[styles.codeBox, animatedStyles[idx]]}
                >
                  <TextInput
                    ref={codeRefs[idx]}
                    style={styles.codeInput}
                    keyboardType="numeric"
                    maxLength={1}
                    value={digit}
                    onChangeText={(v) => handleCodeChange(v, idx)}
                    onFocus={() => (scaleRefs[idx].value = withSpring(1.1))}
                    onBlur={() => (scaleRefs[idx].value = withSpring(1))}
                  />
                </Animated.View>
              ))}
            </View>

            {timer > 0 ? (
              <Text style={styles.timerText}>You can resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={startVerification}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F9F9F9', // You can change the background color as per your theme
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.08, // 8% of screen width
  },

  card: {
    alignItems: 'center',
  },

  title: {
    fontSize: width * 0.06, // 6% of screen width
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: height * 0.03, // 3% of screen height
  },

  phoneText: {
    color: '#fff',
    fontSize: width * 0.04, // 4% of screen width
    marginBottom: height * 0.03, // 3% of screen height
  },

  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: width * 0.05, // 5% of screen width
    padding: width * 0.04, // 4% of screen width
    marginBottom: height * 0.05, // 5% of screen height
    textAlign: 'center',
    fontSize: width * 0.04, // 4% of screen width
    color: '#000',
  },

  nextButton: {
    backgroundColor: '#4C8BF5',
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.05, // 5% of screen width
    width: '100%',
    alignItems: 'center',
  },

  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.04, // 4% of screen width
  },

  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.03, // 3% of screen height
  },

  codeBox: {
    width: width * 0.12, // 12% of screen width
    height: width * 0.15, // 15% of screen width
    marginHorizontal: width * 0.02, // 2% of screen width
  },

  codeInput: {
    width: width * 0.12, // 12% of screen width
    height: width * 0.15, // 15% of screen width
    backgroundColor: '#fff',
    borderRadius: width * 0.02, // 2% of screen width
    textAlign: 'center',
    fontSize: width * 0.05, // 5% of screen width
    color: '#000',
  },

  timerText: {
    color: '#ddd',
    marginTop: height * 0.02, // 2% of screen height
  },

  resendText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: height * 0.02, // 2% of screen height
  },
});