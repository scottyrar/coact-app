import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from "expo-router";
import { appSignUp } from '../../store/authStore';
import LoadingComponent from '../../components/LoadingComponent';
import BaseInput from '../../components/BaseInput';
import PasswordInput from '../../components/PasswordInput';
import UserIcon from '../../assets/icons/UserIcon';
import KeyIcon from '../../assets/icons/KeyIcon';
import { Entypo,FontAwesome } from '@expo/vector-icons';

export default function SignUp() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [validate, setValidate] = useState(false);
    const [secure1, setSecure1] = useState(true);
    const [secure2, setSecure2] = useState(true);


    useEffect(() => {
        if (username !== '' && email !== '' && phone !== '' && password !== '' && confirmPassword !== '') {
            if (password === confirmPassword) {
                setValidate(false)
            }
        } else {
            setValidate(true)
        }
    }, [username, email, phone, password, confirmPassword])

    async function registerUser() {
        try {
            setIsLoading(true);
            const res = await appSignUp(email, password, username, phone)
            setIsLoading(false);
            if (!res?.error) {
                router.replace("/(tabs)/home");
            } else {
                Alert.alert('Signup Error', res.error?.message)
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <LoadingComponent visible={isLoading} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 p-3 !pt-10"
            >
                <ScrollView className="space-y-5">
                    <Text style={styles.textHeader}>Register new account</Text>
                    <View style={styles.content}>
                        <BaseInput
                            placeholder="Username"
                            onChangeText={(text) => setUsername(text)}
                            leftIcon={() => <UserIcon />}
                        />
                        <BaseInput
                            placeholder="Email"
                            onChangeText={(text) => setEmail(text)}
                            leftIcon={() => <Entypo name="mail" size={24} color="black" />}
                            type={"email-address"}
                        />
                        <BaseInput
                            placeholder="Phone"
                            onChangeText={(text) => setPhone(text)}
                            leftIcon={() => <FontAwesome name="phone" size={30} color="black" />}
                        />
                        <PasswordInput
                            placeholder="Password"
                            onChangeText={(text) => setPassword(text)}
                            leftIcon={() => <KeyIcon />}
                            rightIcon={() => (
                                <TouchableOpacity onPress={() => { setSecure1(!secure1) }}>
                                    {
                                        secure1
                                            ? <Entypo name="eye" size={24} color="black" />
                                            : <Entypo name="eye-with-line" size={24} color="black" />
                                    }
                                </TouchableOpacity>
                            )}
                            secure={secure1}
                        />
                        <PasswordInput
                            placeholder="Password Confirm"
                            onChangeText={(text) => setConfirmPassword(text)}
                            leftIcon={() => <KeyIcon />}
                            rightIcon={() => (
                                <TouchableOpacity onPress={() => { setSecure2(!secure2) }}>
                                    {
                                        secure2
                                            ? <Entypo name="eye" size={24} color="black" />
                                            : <Entypo name="eye-with-line" size={24} color="black" />
                                    }
                                </TouchableOpacity>
                            )}
                            secure={secure2}
                        />
                        <View className="w-full justify-center items-center">
                            <TouchableOpacity disabled={validate} onPress={registerUser} className={`${!validate ? 'bg-[#D9D9D9B0] border' : 'bg-gray-400 border-gray-400'} rounded-full p-3 w-36 justify-center items-center`}>
                                <Text className="text-lg" style={{ fontFamily: 'Kanit' }}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 20
    },
    content: {
        width: '100%',
        gap: 20,
    },
    textHeader: {
        fontSize: 25,
        paddingTop: 20,
        fontFamily: 'Kanit'
    },
});
