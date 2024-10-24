import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthStore, appSignOut } from '../../store/authStore';
import { database } from '../../firebase';
import { ref, onValue, set } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'expo-router';

export default function HomeView() {
  const router = useRouter();
  const user = AuthStore.useState((s) => s.user);
  const nameStore = AuthStore.useState((s) => s.name);
  const dbRef = ref(database, `users/${user?.uid}/device`);
  const [device, setDevice] = useState([]);
  const { t } = useTranslation();
  const pathname = usePathname();

  function getDevice() {
    try {
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        const res = data
          ? Object.keys(data).map((deviceId) => ({
            device_id: deviceId,
            device_name: data[deviceId].name,
            action: data[deviceId].action,
            isconnect: data[deviceId].isconnect
          }))
          : [];
        setDevice(res);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleAction(deviceId, action) {
    try {
      await set(ref(database, `users/${user?.uid}/device/${deviceId}/action`), !action);
      await set(ref(database, `users/${user?.uid}/device/${deviceId}/change`), "action");
    } catch (error) {
      console.error(error);
    }
  };

  function checkOnline() {
    try {
      device.forEach(async (item) => {
        await set(ref(database, `users/${user?.uid}/device/${item.device_id}/isconnect`), false);
        await set(ref(database, `users/${user?.uid}/device/${item.device_id}/change`), 'check');
      })
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (pathname === '/home') {
      getDevice();
      checkOnline();
    }
  }, [pathname]);

  return (
    <View className="flex-1 gap-y-3 dark:bg-gray-900">
      <Text className="text-xl md:text-3xl px-3 dark:text-white" style={{ fontFamily: 'Kanit' }}>{t('home.welcome')} {nameStore} {t('home.enjoy')}</Text>
      <ScrollView className="gap-y-3 px-3">
        <TouchableOpacity onPress={() => { router.push('paring') }} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow flex-row justify-between items-center">
          <Text className="text-lg md:text-2xl dark:text-white" style={{ fontFamily: 'Kanit' }}>{t('home.paring')}</Text>
        </TouchableOpacity>
        {device.map((item) => (
          <TouchableOpacity
            key={item.device_id}
            onPress={() => {
              router.push(`/device/${item.device_id}`)
            }}
          >
            <View className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow flex-row justify-between items-center">
              <View>
                <Text className="text-lg md:text-2xl dark:text-white" style={{ fontFamily: 'Kanit' }}>{item.device_name}</Text>
                <Text className="text-xs md:text-base dark:text-white" style={{ fontFamily: 'Kanit' }}>{item.isconnect ? t('home.connect') : t('home.no_connect')}</Text>
              </View>
              <TouchableOpacity className={`border-4 ${item.action ? 'border-lime-500' : 'border-red-500'} rounded-full justify-center items-center w-14 h-14`} onPress={() => {
                toggleAction(item.device_id, item.action);
              }}>
                <Text className={`text-sm md:text-lg ${item.action ? 'text-lime-500' : 'text-red-500'}`} style={{ fontFamily: 'Kanit' }}>{item.action ? t('home.on') : t('home.off')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
