import { useState, useEffect } from "react";
import BaseInput from "../components/BaseInput";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import KeyIcon from '../assets/icons/KeyIcon';
import { useColorScheme } from "nativewind";
import { getAuth, updateEmail } from "firebase/auth";
import LoadingComponent from "../components/LoadingComponent";
import UserIcon from '../assets/icons/UserIcon';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter, Stack } from "expo-router";
import { unsub } from "../store/authStore";

export default function EditProfile() {
    const router = useRouter();
    const { t } = useTranslation();
    const auth = getAuth();
    const user = auth.currentUser;
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [validate, setValidate] = useState(false);
    const { colorScheme } = useColorScheme();
    const [isLoading, setIsLoading] = useState(false);
    const [dbUser, setDbuser] = useState(null)
    const dbRef = ref(database, `users/${user?.uid}`);

    useEffect(() => {
        if (email === '' || username === '' || phone === '') {
            setValidate(true)
        } else {
            setValidate(false)
        }
    }, [email, username, phone, dbUser])

    function getUser() {
        try {
            onValue(dbRef, (snapshot) => {
                const data = snapshot.val();
                setDbuser(data)
                setUsername(data.username)
                setEmail(data.email)
                setPhone(data.phonenumber)
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function editPro() {
        try {
            setIsLoading(true)
            if (dbUser?.email !== email) {
                await updateEmail(user, email)
                await set(ref(database, `users/${user?.uid}/email`), email);
            }
            if (dbUser?.username !== username) {
                await set(ref(database, `users/${user?.uid}/username`), username);
            }
            if (dbUser?.phonenumber !== phone) {
                await set(ref(database, `users/${user?.uid}/phonenumber`), phone);
            }
            getUser();
            unsub();
            Alert.alert('Change Profile', 'Change Profile Success');
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            Alert.alert('Change Profile Error', error.message);
        }
    }

    useEffect(() => {
        getUser();
    }, [])

    return (
        <View className="flex-1 space-y-5 dark:bg-gray-900 p-3">
            <LoadingComponent visible={isLoading} />
            <Stack.Screen options={{ headerTitle: t('auth.edit') }} />
            <View>
                <BaseInput
                    placeholder={t('auth.user_name')}
                    onChangeText={(text) => setUsername(text)}
                    leftIcon={() => <UserIcon fill={colorScheme} />}
                    value={username}
                    mode={colorScheme}
                />
            </View>
            <View>
                <BaseInput
                    placeholder={t('auth.email')}
                    onChangeText={(text) => setEmail(text)}
                    leftIcon={() => <Entypo name="mail" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />}
                    type={"email-address"}
                    value={email}
                    mode={colorScheme}
                />
            </View>
            <View>
                <BaseInput
                    placeholder={t('auth.phone')}
                    onChangeText={(text) => setPhone(text)}
                    leftIcon={() => <FontAwesome name="phone" size={30} color={colorScheme === 'dark' ? 'white' : 'black'} />}
                    value={phone}
                    mode={colorScheme}
                />
            </View>
            <View className="flex-row gap-6 justify-center items-center">
                <TouchableOpacity className="bg-gray-300 p-3 rounded-lg" onPress={() => { router.back() }}>
                    <Text className="text-lg" style={{ fontFamily: 'Kanit' }}>{t('auth.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={validate} className={`bg-lime-300 p-3 rounded-lg ${validate ? 'opacity-30' : ''}`} onPress={editPro}>
                    <Text className="text-lg" style={{ fontFamily: 'Kanit' }}>{t('auth.confirm')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}