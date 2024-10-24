import { Tabs, Stack } from "expo-router";
import { Ionicons, MaterialCommunityIcons, AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Alert } from "react-native";
import { useColorScheme } from "nativewind";
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
    const { colorScheme } = useColorScheme();
    const headerBackgroundColor = colorScheme === "dark" ? '#030712' : 'white';
    const tabBarColor = colorScheme === "dark" ? 'white' : 'black';
    const { t } = useTranslation();

    return (
        <>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Tabs screenOptions={{
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                },
                tabBarStyle: {
                    backgroundColor: headerBackgroundColor,
                    borderTopWidth: 0,
                    elevation: 0,
                    paddingTop: 5
                },
                headerTitleStyle: {
                    fontFamily: 'Kanit'
                },
                headerTitle: "Co'act",
                headerTintColor: '#31C48D',
                headerRightContainerStyle: {
                    paddingRight: 10
                },
                headerLeftContainerStyle: {
                    paddingLeft: 10
                },
                headerTitleAlign: "center",
                tabBarActiveTintColor: '#31C48D',
                tabBarInactiveTintColor: tabBarColor,
                headerShadowVisible: false,
                tabBarLabelStyle: {
                    fontFamily: 'Kanit',
                },
                // headerRight: () => (
                //     <Ionicons onPress={() => Alert.alert("Notification")} name="notifications-outline" size={24} color='#31C48D' />
                // )
            }}>
                <Tabs.Screen name="home" options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home-variant-outline" size={24} color={color} />
                    ),
                    title: t('nav.home')
                }} />
                <Tabs.Screen name="dashboard" options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="pie-chart" size={24} color={color} />
                    ),
                    title: t('nav.dash')
                }} />
                <Tabs.Screen name="history" options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="history" size={28} color={color} />
                    ),
                    title: t('nav.his')
                }} />
                <Tabs.Screen name="setting" options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="setting" size={24} color={color} />
                    ),
                    title: t('nav.setting')
                }} />
                {/* <Tabs.Screen name="devices" options={{
                tabBarIcon: ({ color, size, focused }) => {
                    if (focused) {
                        return (<AntDesign name="earth" size={21} color='#31C48D' />)
                    } else {
                        return (<AntDesign name="earth" size={21} color='#fff' />)
                    }
                }
                // tabBarIcon: ({color,size,focused}) => (
                //     <AntDesign name="earth" size={21} color={color} />
                // )
            }} /> */}
            </Tabs>
        </>

    )
}