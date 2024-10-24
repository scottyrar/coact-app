import { Slot, usePathname,useRouter } from 'expo-router';
import { View, ImageBackground, StyleSheet,Text,TouchableOpacity } from 'react-native';
import BgLight from '../../assets/imgs/bg-light.jpg';

export default function authLayout() {
    const pathName = usePathname()
    const router = useRouter()

    return (
        <ImageBackground source={BgLight} style={styles.backgroundImage}>
            <View className={`flex-1 flex flex-row`}>
                <View className={`flex`}>
                    <TouchableOpacity onPress={() => {router.replace('signIn')}} className={`basis-1/2 justify-center bg-white rounded-tr-[30px] ${pathName !== '/signIn' ? 'opacity-50' : ''}`}>
                        <Text className="rotate-[270deg] text-2xl" style={{ fontFamily: 'Kanit' }}>
                            Signin
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {router.replace('signUp')}} className={`basis-1/2 justify-center bg-white rounded-br-[30px] ${pathName !== '/signUp' ? 'opacity-50' : ''}`} >
                        <Text className="rotate-[270deg] text-2xl" style={{ fontFamily: 'Kanit' }}>
                            Signup
                        </Text>
                    </TouchableOpacity>
                </View>
                <Slot />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        contentFit: 'cover',
        justifyContent: 'center',
    },
})
