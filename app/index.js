import React, { useEffect, useState } from "react";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { AuthStore } from "../store/authStore";
import { settingStore } from "../store/settingStore"
import { Text, View, Image, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "i18next";
import { useColorScheme } from "nativewind";
import SplashScreen from "../assets/splash.png";

export default function Index() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { initialized, isLoggedIn } = AuthStore.useState((s) => s);
  const { setColorScheme } = useColorScheme();

  const getData = async () => {
    try {
      const language = await AsyncStorage.getItem('language');
      const mode = await AsyncStorage.getItem('mode');
      if (language !== null) {
        i18n.changeLanguage(language)
        settingStore.update((store) => {
          store.language = language;
        })
      } else {
        await AsyncStorage.setItem('language', "en");
        settingStore.update((store) => {
          store.language = "en";
        })
      }
      if (mode !== null) {
        console.log(mode);
        setColorScheme(mode)
        settingStore.update((store) => {
          store.mode = mode;
        })
      } else {
        await AsyncStorage.setItem('mode', "light");
        settingStore.update((store) => {
          store.mode = "light";
        })
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
    
    if (!navigationState?.key || !initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/signIn');
    } else if (isLoggedIn) {
      router.replace("/(tabs)/home");
    }
  }, [segments, navigationState?.key, initialized]);

  return (
    <ImageBackground source={SplashScreen} style={styles.backgroundImage}>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    contentFit: 'cover',
    justifyContent: 'center',
  },
})
