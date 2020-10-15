import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';


class FCMService {
    register = (onRegister, onNotificationm, onOpenNotification) => {
        this.checkPermission(onRegister)
        this.createNotificationListenners(onRegister, onNotificationm, onOpenNotification)
    }

    registerAppWithFCM = async () => {
        if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
            await messaging().setAutoInitEnabled(true);
        }
    }

    checkPermission = (onRegister) => {
        messaging().hasPermission()
            .then(enabled => {
                if (enabled) {

                    //User has permission
                    this.getToken(onRegister)

                } else {
                    //User doesn't have permission
                    this.requestPermission(onRegister)
                }
            }).catch(error => { console.log("[FCMService] Permission rejected", error) })
    }
    getToken = (onRegister) => {
        messaging().getToken()
            .then(fcmtoken => {
                if (fcmtoken) {

                    this.getToken(fcmtoken)

                } else {
                    //User doesn't have permission
                    console.log("[FCMService] User doesn't have a device token'")
                }
            }).catch(error => { console.log("[FCMService] getToken rejected", error) })
    }
    requestPermission = (onRegister) => {
        messaging().requestPermission()
            .then(() => {
                this.getToken(onRegister)
            }).catch(error => { console.log("[FCMService] Request permission rejected", error) })
    }
    deleteToken = () => {
        console.log("[FCMService] deleteToken")
        messaging().deleteToken()
            .catch(error => { console.log("[FCMService] Delete token rejected", error) })
    }
    createNotificationListenners = (onRegister, onNotificationm, onOpenNotification) => {

        //when the application is running, but in the background
        messaging()
            .onNotificationOpenedApp(remoteMessage => {
                console.log("[FCMService] onNotificationOpenedApp Notification caused app to open from background state", remoteMessage)

                if (remoteMessage) {
                    const notification = remoteMessage.notification
                    onOpenNotification(notification)
                }
            });

        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
            if (remoteMessage) {
                const notification = remoteMessage.notification
                onOpenNotification(notification)
            }
        });


        //when the application is opened from a quit state.
        messaging().
            getInitialNotification()
            .then(remoteMessage => {
                console.log("[FCMService] getInitialNotification Notifacation caused app to open from quit state", remoteMessage)

                if (remoteMessage) {
                    const notification = remoteMessage.notification
                    onOpenNotification(notification)
                }

            });

        //Foreground state messages
        this.messageListener = messaging().onMessage(async remoteMessage => {
            console.log("[FCMService] A new FCM message arrived", remoteMessage)
            if (remoteMessage) {
                let notification = null
                if (Platform.OS === 'ios') {
                    notification = remoteMessage.data.notification

                } else {
                    notification = remoteMessage.notification
                }
                onNotificationm(notification)
            }
        });
        messaging().onTokenRefresh(fcmtoken => {
            console.log("[FCMService] New token refresh: ", fcmtoken)
            onRegister(fcmtoken)

        })


    }
    unRegister = () => { this.messageListener() }

}
export const fcmService = new FCMService();