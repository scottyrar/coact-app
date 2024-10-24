import { useState, useEffect } from "react";
import PasswordInput from "../components/PasswordInput";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import KeyIcon from '../assets/icons/KeyIcon';
import { Entypo } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";
import { getAuth, updatePassword } from "firebase/auth";
import LoadingComponent from "../components/LoadingComponent";
import { useTranslation } from 'react-i18next';
import { useRouter, Stack } from "expo-router";
import { unsub } from "../store/authStore";

export default function ResetPassword() {
    const router = useRouter();
    const { t } = useTranslation();
    const auth = getAuth();
    const user = auth.currentUser;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secure1, setSecure1] = useState(true);
    const [secure2, setSecure2] = useState(true);
    const [validate, setValidate] = useState(false);
    const { colorScheme } = useColorScheme();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (password === confirmPassword && password.length > 7 && password.length > 7) {
            setValidate(false)
        } else {
            setValidate(true)
        }
    }, [password, confirmPassword])

    async function resetPass() {
        try {
            setIsLoading(true)
            await updatePassword(user, password)
            unsub()
            setPassword('')
            setConfirmPassword('')
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            Alert.alert('Change Password Error', error.message);
        }
    }

    return (
        <View className="flex-1 space-y-5 dark:bg-gray-900 p-3">
            <LoadingComponent visible={isLoading} />
            <Stack.Screen options={{ headerTitle: t('auth.change') }} />
            <View>
                <PasswordInput
                    placeholder={t('auth.pass')}
                    onChangeText={(text) => setPassword(text)}
                    leftIcon={() => <KeyIcon fill={colorScheme} />}
                    mode={colorScheme}
                    rightIcon={() => (
                        <TouchableOpacity onPress={() => { setSecure1(!secure1) }}>
                            {
                                secure1
                                    ? <Entypo name="eye" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    : <Entypo name="eye-with-line" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                            }
                        </TouchableOpacity>
                    )}
                    value={password}
                    secure={secure1}
                />
            </View>
            <View>
                <PasswordInput
                    placeholder={t('auth.con_pass')}
                    onChangeText={(text) => setConfirmPassword(text)}
                    leftIcon={() => <KeyIcon fill={colorScheme} />}
                    mode={colorScheme}
                    rightIcon={() => (
                        <TouchableOpacity onPress={() => { setSecure2(!secure2) }}>
                            {
                                secure2
                                    ? <Entypo name="eye" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    : <Entypo name="eye-with-line" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                            }
                        </TouchableOpacity>
                    )}
                    value={confirmPassword}
                    secure={secure2}
                />
            </View>
            <View className="flex-row gap-6 justify-center items-center">
                <TouchableOpacity className="bg-gray-300 p-3 rounded-lg" onPress={() => {router.back()}}>
                    <Text className="text-lg" style={{ fontFamily: 'Kanit' }}>{t('auth.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={validate} className={`bg-lime-300 p-3 rounded-lg ${validate ? 'opacity-30' : ''}`} onPress={resetPass}>
                    <Text className="text-lg" style={{ fontFamily: 'Kanit' }}>{t('auth.confirm')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}