import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

const TestPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const scale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start the scaling animation
        Animated.timing(scale, {
            toValue: 1,
            duration: 2000, // 2 seconds
            useNativeDriver: true,
        }).start();

        // Start the logo opacity animation
        Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 2000, // 2 seconds
            useNativeDriver: true,
        }).start(() => {
            // Set loading to false after the animation completes
            setTimeout(() => {
                setLoading(false);
            }, 1000); // 1 second delay
        });
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale }] }]}>
                    <Animated.Image
                        source={{ uri: 'https://your-logo-url.com/logo.png' }} // Replace with your logo URL
                        style={[styles.logo, { opacity: logoOpacity }]}
                    />
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Hello, world!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'blue',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0000ff', // Background color for the loading screen
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
    },
});

export default TestPage;