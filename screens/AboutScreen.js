import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { useAppTheme } from "../context/AppThemeContext";

const EMAIL = "reznik.associates@gmail.com";

export default function AboutScreen() {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  const handleEmail = () => {
    Linking.openURL(`mailto:${EMAIL}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>About Us – Reznik Associates</Text>
        <Text style={styles.paragraph}>
          Reznik Associates is a technology-focused studio dedicated to building
          simple, reliable, and user-friendly digital experiences. We combine
          clean design, practical engineering, and real-world problem solving to
          create applications that genuinely help people in their daily lives.
        </Text>
        <Text style={styles.paragraph}>
          Our mission is to bring clarity, efficiency, and stability to mobile
          software – whether productivity tools, communication solutions, or
          personal management apps.
        </Text>

        <Text style={styles.subheading}>What We Stand For</Text>
        <Text style={styles.paragraph}>
          Simplicity – everything we build is intuitive, minimal, and easy to
          use.
        </Text>
        <Text style={styles.paragraph}>
          Quality – stable performance, clear interfaces, and attention to
          detail.
        </Text>
        <Text style={styles.paragraph}>
          User Centred Design – we listen, iterate, and improve continuously.
        </Text>
        <Text style={styles.paragraph}>
          Innovation – modern technology, modern thinking, and long-term
          reliability.
        </Text>

        <Text style={styles.subheading}>What We Do</Text>
        <Text style={styles.paragraph}>Reznik Associates develops:</Text>
        <Text style={styles.bullet}>• Mobile apps for Android and iOS</Text>
        <Text style={styles.bullet}>• Cloud connected applications</Text>
        <Text style={styles.bullet}>• Productivity and personal management tools</Text>
        <Text style={styles.bullet}>• UI/UX focused software solutions</Text>
        <Text style={styles.bullet}>• Custom digital utilities</Text>

        <Text style={styles.subheading}>Our Vision</Text>
        <Text style={styles.paragraph}>
          To become a trusted name in software craftsmanship by creating
          applications that feel natural, perform smoothly, and improve people’s
          everyday lives.
        </Text>

        <TouchableOpacity onPress={handleEmail} style={styles.emailRow}>
          <Text style={styles.paragraph}>Contact us: </Text>
          <Text style={styles.email}>{EMAIL}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 16,
      gap: 10,
    },
    heading: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },
    subheading: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginTop: 6,
    },
    paragraph: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    bullet: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
      marginLeft: 8,
    },
    emailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    email: {
      color: colors.primary,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
  });
}
