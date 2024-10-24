import { Stack, useRouter } from "expo-router";
import { StepStore } from "../store/stepStore";
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { Alert } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from "nativewind";
import { useFonts } from 'expo-font';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { I18nextProvider } from 'react-i18next';
import i18n from '../language/i18n';
import { useTranslation } from 'react-i18next';

export default function StackLayout() {
    const { t } = useTranslation();
    const { colorScheme } = useColorScheme();
    const headerBackgroundColor = colorScheme === "dark" ? '#030712' : 'white';
    const router = useRouter()
    const current_step = StepStore.useState((s) => s.current_step)
    useFonts({
        'Kanit': require('../assets/fonts/Kanit-Regular.ttf'),
    });

    function backStep() {
        if (current_step === 1) {
            router.back()
        } else {
            StepStore.update((store) => {
                store.current_step = store.current_step - 1;
            })
        }
    }

    return (
        <I18nextProvider i18n={i18n}>
            <BottomSheetModalProvider>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <Stack screenOptions={{
                    headerStyle: {
                        backgroundColor: headerBackgroundColor,
                    },
                    headerTintColor: '#31C48D',
                    headerTitleAlign: 'center',
                    headerTitleStyle: {
                        fontFamily: 'Kanit'
                    },
                    headerShadowVisible: false
                }}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="paring" options={{
                        gestureEnabled: false, headerBackVisible: false,title: t('home.paring'), headerLeft: () => (
                            <Ionicons onPress={backStep} name="chevron-back-outline" size={24} color='#31C48D' />
                        )
                    }} />
                </Stack>
            </BottomSheetModalProvider>
        </I18nextProvider>
    )
}