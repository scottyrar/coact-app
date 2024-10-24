import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import { appSignIn } from '../../store/authStore';
import BaseInput from '../../components/BaseInput';
import PasswordInput from '../../components/PasswordInput';
import UserIcon from '../../assets/icons/UserIcon';
import KeyIcon from '../../assets/icons/KeyIcon';
import LoadingComponent from '../../components/LoadingComponent';
import { Entypo } from '@expo/vector-icons';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secure, setSecure] = useState(true)
    const [isLoading, setIsLoading] = useState(false);
    const [validate, setValidate] = useState(false)

    useEffect(() => {
        if (email !== '' && password !== '') {
            setValidate(false)
        } else {
            setValidate(true)
        }
    }, [email, password])

    async function login() {
        try {
            setIsLoading(true)
            const res = await appSignIn(email, password);
            setIsLoading(false)
            if (!res?.error) {
                router.replace("/(tabs)/home");
            } else {
                Alert.alert('Signin Error', res.error?.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View className="flex-1 justify-center gap-y-6 p-3">
            <LoadingComponent visible={isLoading} />
            <Text className="text-3xl" style={{ fontFamily: 'Kanit' }}>SignIn</Text>
            <View style={styles.content}>
                <BaseInput
                    placeholder="Email"
                    onChangeText={(text) => setEmail(text)}
                    leftIcon={() => <UserIcon />}
                    type={"email-address"}
                />
                <PasswordInput
                    placeholder="Password"
                    onChangeText={(text) => setPassword(text)}
                    leftIcon={() => <KeyIcon />}
                    rightIcon={() => (
                        <TouchableOpacity onPress={() => { setSecure(!secure) }}>
                            {
                                secure
                                    ? <Entypo name="eye" size={24} color="black" />
                                    : <Entypo name="eye-with-line" size={24} color="black" />
                            }
                        </TouchableOpacity>
                    )}
                    secure={secure}
                />
            </View>
            <View className="flex-row justify-end">
                <TouchableOpacity onPress={() => {router.push('forgotpassword')}}>
                    <Text style={{ fontFamily: 'Kanit' }}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
            <View className="w-full justify-center items-center">
                <TouchableOpacity onPress={login} disabled={validate} className={`${!validate ? 'bg-[#D9D9D9B0] border' : 'bg-gray-400 border-gray-400'} rounded-full p-3 w-36 justify-center items-center`}>
                    <Text className="text-lg" style={{ fontFamily: 'Kanit' }}>SIGN IN</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
        gap: 40,
    },
});
