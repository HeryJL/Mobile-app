import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing,
    Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


const { width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confpass, setConfPass] = useState('');
    const [phone, setPhone] = useState('');
    const [secureEntry, setSecureEntry] = useState(true);
    const [confSecure,setConfSecure]= useState(true);
    const [shakeAnimation] = useState(new Animated.Value(0));
    const { registre, isLoading } = useContext(AuthContext);
    const insets = useSafeAreaInsets();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const handleLogin = async () => {
        if (!email || !password) {
            triggerShake();
            return;
        }
        try {
            const userType = await registre(name, email, password,phone);

        } catch (error) {
            triggerShake();
            alert(error.message);
        }
    };

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);


    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 50,
                easing: Easing.linear,
                useNativeDriver: true
            }),
            Animated.timing(shakeAnimation, {
                toValue: -10,
                duration: 50,
                useNativeDriver: true
            }),
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true
            }),
            Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true
            })
        ]).start();
    };

    return (
        <LinearGradient
        colors={['#74c7ec', '#60a5fa']}// Light, soft blue gradient
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <Animated.ScrollView
                    contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top }]}
                    style={{ opacity: fadeAnim }}
                >
                    <KeyboardAvoidingView
                        style={styles.innerContainer}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <Animated.View style={[styles.header, {
                            transform: [{ translateX: shakeAnimation }]
                        }]}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="car-sport" size={72} color="#ffffff" />
                                <View style={styles.logoPulse} />
                            </View>
                            <Text style={styles.title}>S'inscrire</Text>
                        </Animated.View>

                        <Animated.View style={[styles.form, {
                            transform: [{ translateX: shakeAnimation }]
                        }]}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nom"
                                    placeholderTextColor='rgb(100, 100, 100)'
                                    value={name}
                                    onChangeText={setName}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="phone-portrait" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Numero telephone"
                                    placeholderTextColor='rgb(100, 100, 100)'
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Adresse email"
                                    placeholderTextColor='rgb(100, 100, 100)'
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                                
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mot de passe"
                                    placeholderTextColor='rgb(100, 100, 100)'
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={secureEntry}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setSecureEntry(!secureEntry)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={secureEntry ? "eye-off" : "eye"}
                                        size={22}
                                        color='rgb(80, 78, 78)'
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirmer mot de passe"
                                    placeholderTextColor='rgb(100, 100, 100)'
                                    value={confpass}
                                    onChangeText={setConfPass}
                                    secureTextEntry={confSecure}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setConfSecure(!confSecure)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={confSecure ? "eye-off" : "eye"}
                                        size={22}
                                        color='rgb(80, 78, 78)'
                                    />
                                </TouchableOpacity>
                            </View>


                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#3b82f6', '#2563eb']} // Lighter blue gradient for buttons
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.button}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text style={styles.buttonText}>S'inscrire</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>ou</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.signupButton}
                                onPress={() => navigation.navigate('Login')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.signupText}>Se connecter</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </Animated.ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    logoPulse: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        top: -9,
        left: -9,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 8,
        letterSpacing: 1,
    },

    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginBottom: 16,

    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: 'rgb(0, 0, 0)',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    eyeButton: {
        padding: 5,
        marginLeft: 10,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: 'rgb(255, 255, 255)',
        fontSize: 14,
    },
    buttonContainer: {
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    button: {
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#334155',
    },
    dividerText: {
        color: '#334155',
        paddingHorizontal: 10,
        fontSize: 14,
    },
    signupButton: {
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#3b82f6',

    },
    signupText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default SignupScreen