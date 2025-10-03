import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");



export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const isLoggedIn = false;
      if (isLoggedIn) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Abstract Background Circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      {/* App Name */}
      <Text style={styles.title}>ReMeet</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5A4FCF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: width * 0.1, // 10% of screen width
    fontWeight: "bold",
    letterSpacing: 1,
  },
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 999,
  },
  circle1: {
    width: width * 0.6,
    height: width * 0.6,
    top: -height * 0.1,
    left: -width * 0.1,
  },
  circle2: {
    width: width * 0.5,
    height: width * 0.5,
    bottom: -height * 0.08,
    right: -width * 0.08,
  },
  circle3: {
    width: width * 0.3,
    height: width * 0.3,
    bottom: height * 0.07,
    left: width * 0.05,
  },
});
