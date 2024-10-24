import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import BaseInput from '../components/BaseInput';
import * as Linking from 'expo-linking';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import LoadingComponent from '../components/LoadingComponent';

export default function ForgotPassword() {
    const { colorScheme } = useColorScheme();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [sendSuc, setSuc] = useState(false)

    async function sendEmail() {
        try {
            setIsLoading(true)
            await sendPasswordResetEmail(auth, email);
            setSuc(true)
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            Alert.alert('Send password error', error);
        }
    }

    function openGmailApp() {
        Linking.openURL('googlegmail://');
    }

    return (
        <View className="flex-1 dark:bg-gray-900 p-3">
            <LoadingComponent visible={isLoading} />
            <Stack.Screen options={{ headerTitle: 'Reset Password' }} />
            {
                !sendSuc ?
                    <View className="space-y-3">
                        <View className="items-center">
                            <View className="bg-gray-400 dark:bg-gray-600 p-10 rounded-full">
                                <Entypo name="lock" size={100} color={colorScheme === 'dark' ? 'white' : 'black'} />
                            </View>
                        </View>
                        <Text className="dark:text-white text-2xl text-center" style={{ fontFamily: 'Kanit' }}>Forgot password?</Text>
                        <Text className="dark:text-white text-lg text-center" style={{ fontFamily: 'Kanit' }}>Enter your email below to reset your password</Text>
                        <View>
                            <BaseInput
                                placeholder="Email"
                                onChangeText={(text) => setEmail(text)}
                                leftIcon={() => <Entypo name="mail" size={24} color="black" />}
                                type={"email-address"}
                                mode={colorScheme}
                            />
                        </View>
                        <View className="w-full justify-center items-center">
                            <TouchableOpacity onPress={sendEmail} disabled={email === ''} className={`${email == '' ? 'bg-gray-400 border-gray-400 opacity-30' : 'bg-gray-400 border-gray-400'} rounded-full p-3 w-36 justify-center items-center`}>
                                <Text className="text-lg" style={{ fontFamily: 'Kanit' }}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    :
                    <View className="space-y-3">
                        <View className="items-center">
                            <View className="bg-gray-400 dark:bg-gray-600 p-10 rounded-full">
                                <FontAwesome name="send-o" size={100} color={colorScheme === 'dark' ? 'white' : 'black'} />
                            </View>
                        </View>
                        <Text className="dark:text-white text-2xl text-center" style={{ fontFamily: 'Kanit' }}>Email Sent!</Text>
                        <Text className="dark:text-white text-lg text-center" style={{ fontFamily: 'Kanit' }}>Please check your email to reset your password</Text>
                        <View className="w-full justify-center items-center">
                            <TouchableOpacity onPress={openGmailApp} className={`bg-gray-400 border-gray-400 first-line:rounded-full p-3 w-36 justify-center items-center`}>
                                <Text className="text-lg" style={{ fontFamily: 'Kanit' }}>Open Gmail</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
            }
        </View>
    )
}